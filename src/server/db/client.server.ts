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
  constructor() {
    super('The CMS database is not available in this runtime.');
    this.name = 'DatabaseUnavailableError';
  }
}

const DB_PATH = process.env['CMS_DB_PATH'] ?? './.data/cms.sqlite';

let executorPromise: Promise<SqlExecutor> | null = null;

async function createSqliteExecutor(): Promise<SqlExecutor> {
  const [fs, path] = await Promise.all([
    import('node:fs'),
    import('node:path'),
  ]);

  const dir = path.dirname(DB_PATH);
  if (dir && !fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  // If running in Bun, use built-in bun:sqlite
  if (typeof (globalThis as unknown as { Bun?: unknown }).Bun !== 'undefined') {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { Database } = (await import('bun:sqlite' as string)) as any;
    const db = new Database(DB_PATH);
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
  const db = new DatabaseSync(DB_PATH);
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

/**
 * Returns the shared executor, running migrations and first-run seeding once.
 */
export async function getDb(): Promise<SqlExecutor> {
  if (!executorPromise) {
    executorPromise = (async () => {
      let db: SqlExecutor;
      try {
        db = await createSqliteExecutor();
      } catch (error) {
        console.error('[cms] SQLite driver unavailable', error);
        throw new DatabaseUnavailableError();
      }
      await migrate(db);
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
