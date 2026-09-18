import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { getDb } from '../db/client.server';

export interface UploadFileInput {
  name: string;
  type: string;
  base64: string;
  usageNote?: string;
  altText?: string;
}

export interface UploadFileResult {
  ok: boolean;
  url: string;
  fileName: string;
  id?: number;
  error?: string;
}

const ALLOWED_EXTENSIONS = new Set([
  'png',
  'jpg',
  'jpeg',
  'svg',
  'webp',
  'gif',
  'ico',
  'pdf',
]);

export async function saveUploadedFile(input: UploadFileInput): Promise<UploadFileResult> {
  try {
    const rawName = input.name || 'upload';
    const ext = (path.extname(rawName).slice(1) || input.type.split('/')[1] || 'png').toLowerCase();

    if (!ALLOWED_EXTENSIONS.has(ext)) {
      return { ok: false, url: '', fileName: '', error: `Unsupported file format: .${ext}` };
    }

    // Strip data URL scheme prefix if present (e.g., "data:image/png;base64,")
    const cleanBase64 = input.base64.replace(/^data:[^;]+;base64,/, '');
    const buffer = Buffer.from(cleanBase64, 'base64');

    // Shorter & consistent naming pattern using MD5 hash (8 hex chars)
    // Example: img-a3e91b2c.png or doc-a3e91b2c.pdf
    const md5Hash = crypto.createHash('md5').update(buffer).digest('hex').slice(0, 8);
    const isDoc = ext === 'pdf';
    const prefix = isDoc ? 'doc' : 'img';
    const fileName = `${prefix}-${md5Hash}.${ext}`;

    const uploadDir = path.join(process.cwd(), 'public/uploads');

    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const filePath = path.join(uploadDir, fileName);
    fs.writeFileSync(filePath, buffer);

    const publicUrl = `/uploads/${fileName}`;

    // Record into SQLite media table with the short consistent name
    const db = await getDb();
    const result = await db.run(
      `INSERT INTO media (file_name, url, alt_text, usage_note)
       VALUES (?, ?, ?, ?)`,
      [fileName, publicUrl, input.altText?.trim() || '', input.usageNote || 'Uploaded via Admin'],
    );

    return {
      ok: true,
      url: publicUrl,
      fileName,
      id: result.lastInsertRowid,
    };
  } catch (error) {
    console.error('[upload] Failed to save uploaded file:', error);
    return {
      ok: false,
      url: '',
      fileName: '',
      error: error instanceof Error ? error.message : 'Unknown upload error',
    };
  }
}
