// Database access layer.
//
// Everything above this file (repositories, server functions, React) talks to
// the small `SqlExecutor` interface below and never to a driver directly, so
// swapping SQLite for MySQL/Postgres later means writing one new executor.
import { migrations } from './migrations.server';

export interface SqlExecutor {
  all<T = Record<string, unknown>>(sql: string, params?: unknown[]): Promise<T[]>;
  get<T = Record<string, unknown>>(sql: string, params?: unknown[]): Promise<T | null>;
  run(sql: string, params?: unknown[]): Promise<{ lastInsertRowid: number }>;
  exec(sql: string): Promise<void>;
}

export class DatabaseUnavailableError extends Error {
  constructor(cause?: unknown) {
    const detail = cause instanceof Error ? `: ${cause.message}` : cause ? `: ${String(cause)}` : '';
    super(`The CMS database is not available in this runtime${detail}`);
    this.name = 'DatabaseUnavailableError';
    if (cause && cause instanceof Error && cause.stack) {
      this.stack = `${this.stack}\nCaused by: ${cause.stack}`;
    }
  }
}

function getDbPath(pathModule: typeof import('node:path')): string {
  const envPath = process.env['CMS_DB_PATH'];
  if (envPath) return pathModule.isAbsolute(envPath) ? envPath : pathModule.resolve(process.cwd(), envPath);
  return pathModule.resolve(process.cwd(), '.data/cms.sqlite');
}

let executorPromise: Promise<SqlExecutor> | null = null;

async function createSqliteExecutor(): Promise<SqlExecutor> {
  const [fs, path] = await Promise.all([
    import('node:fs'),
    import('node:path'),
  ]);

  const dbPath = getDbPath(path);
  const dir = path.dirname(dbPath);
  if (dir && !fs.existsSync(dir)) {
    try {
      fs.mkdirSync(dir, { recursive: true, mode: 0o777 });
    } catch (err) {
      console.warn('[cms] mkdir failed:', err);
    }
  }

  // If running in Bun, use built-in bun:sqlite
  if (typeof (globalThis as unknown as { Bun?: unknown }).Bun !== 'undefined') {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { Database } = (await import('bun:sqlite' as string)) as any;
    const db = new Database(dbPath);
    db.run('PRAGMA journal_mode = WAL;');
    db.run('PRAGMA foreign_keys = ON;');

    return {
      async all<T>(sql: string, params: unknown[] = []) {
        return db.query(sql).all(...(params as never[])) as T[];
      },
      async get<T>(sql: string, params: unknown[] = []) {
        return (db.query(sql).get(...(params as never[])) as T | undefined) ?? null;
      },
      async run(sql: string, params: unknown[] = []) {
        const result = db.query(sql).run(...(params as never[]));
        return { lastInsertRowid: Number(result.lastInsertRowid ?? 0) };
      },
      async exec(sql: string) {
        db.exec(sql);
      },
    };
  }

  // Otherwise, use Node.js built-in node:sqlite
  const { DatabaseSync } = await import('node:sqlite');
  const db = new DatabaseSync(dbPath);
  db.exec('PRAGMA journal_mode = WAL;');
  db.exec('PRAGMA foreign_keys = ON;');

  return {
    async all<T>(sql: string, params: unknown[] = []) {
      return db.prepare(sql).all(...(params as never[])) as T[];
    },
    async get<T>(sql: string, params: unknown[] = []) {
      return (db.prepare(sql).get(...(params as never[])) as T | undefined) ?? null;
    },
    async run(sql: string, params: unknown[] = []) {
      const result = db.prepare(sql).run(...(params as never[]));
      return { lastInsertRowid: Number(result.lastInsertRowid ?? 0) };
    },
    async exec(sql: string) {
      db.exec(sql);
    },
  };
}

async function migrate(db: SqlExecutor) {
  await db.exec(
    `CREATE TABLE IF NOT EXISTS _migrations (name TEXT PRIMARY KEY, applied_at TEXT NOT NULL DEFAULT (datetime('now')))`,
  );
  const applied = new Set((await db.all<{ name: string }>('SELECT name FROM _migrations')).map((r) => r.name));
  for (const migration of migrations) {
    if (applied.has(migration.name)) continue;
    await db.exec(migration.sql);
    await db.run('INSERT INTO _migrations (name) VALUES (?)', [migration.name]);
  }
}

async function ensureEnvLoaded(): Promise<void> {
  if (process.env['DATABASE_URL'] || process.env['MYSQL_HOST'] || process.env['DB_HOST']) return;
  try {
    const [fs, path] = await Promise.all([import('node:fs'), import('node:path')]);
    const envPath = path.resolve(process.cwd(), '.env');
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, 'utf8');
      for (const rawLine of content.split('\n')) {
        const line = rawLine.trim();
        if (!line || line.startsWith('#')) continue;
        const eqIdx = line.indexOf('=');
        if (eqIdx > 0) {
          const key = line.slice(0, eqIdx).trim();
          let val = line.slice(eqIdx + 1).trim();
          if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
            val = val.slice(1, -1);
          }
          if (process.env[key] === undefined) {
            process.env[key] = val;
          }
        }
      }
    }
  } catch {
    // Non-fatal
  }
}

/**
 * Returns the shared executor, running migrations and first-run seeding once.
 * Automatically connects to MySQL if DATABASE_URL or MYSQL_HOST is provided,
 * otherwise falls back to SQLite.
 */
export async function getDb(): Promise<SqlExecutor> {
  if (!executorPromise) {
    executorPromise = (async () => {
      await ensureEnvLoaded();
      let db: SqlExecutor;
      const databaseUrl = process.env['DATABASE_URL'];
      const hasMysqlConfig =
        (databaseUrl && (databaseUrl.startsWith('mysql://') || databaseUrl.startsWith('mysql:'))) ||
        Boolean(process.env['MYSQL_HOST'] || process.env['DB_HOST']);

      if (hasMysqlConfig) {
        console.log('[cms] Connecting to MySQL database...');
        try {
          const { createMysqlExecutor, initMysqlSchema } = await import('./mysql.server');
          db = await createMysqlExecutor(databaseUrl);
          await initMysqlSchema(db);
          console.log('[cms] Connected to MySQL and initialized schema successfully.');
        } catch (error) {
          console.error('[cms] Failed to connect to MySQL:', error);
          throw new DatabaseUnavailableError(error);
        }
      } else {
        try {
          db = await createSqliteExecutor();
          await migrate(db);
        } catch (error) {
          console.error('[cms] SQLite driver unavailable:', error);
          throw new DatabaseUnavailableError(error);
        }
      }

      const { seedDatabase } = await import('./seed.server');
      await seedDatabase(db);
      return db;
    })().catch((error) => {
      executorPromise = null;
      throw error;
    });
  }
  return executorPromise;
}
