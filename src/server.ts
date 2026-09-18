import "./lib/error-capture";
import fs from "node:fs";
import path from "node:path";

import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";

const UPLOAD_MIME_TYPES: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".gif": "image/gif",
  ".ico": "image/x-icon",
  ".pdf": "application/pdf",
  ".txt": "text/plain",
  ".mp4": "video/mp4",
};

function serveUploadedFile(pathname: string): Response | null {
  const fileName = path.basename(decodeURIComponent(pathname));
  if (!fileName || fileName.startsWith(".")) return null;

  const searchDirs = [
    process.env["CMS_UPLOADS_PATH"],
    path.join(process.cwd(), "public/uploads"),
    path.join(process.cwd(), ".output/public/uploads"),
  ].filter(Boolean) as string[];

  for (const dir of searchDirs) {
    const fullPath = path.join(dir, fileName);
    if (fs.existsSync(fullPath)) {
      try {
        const stats = fs.statSync(fullPath);
        if (!stats.isFile()) continue;
        const buffer = fs.readFileSync(fullPath);
        const ext = path.extname(fileName).toLowerCase();
        const contentType = UPLOAD_MIME_TYPES[ext] || "application/octet-stream";
        return new Response(buffer, {
          status: 200,
          headers: {
            "Content-Type": contentType,
            "Content-Length": String(stats.size),
            "Cache-Control": "public, max-age=31536000, immutable",
          },
        });
      } catch {
        // continue search
      }
    }
  }
  return null;
}

type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

let serverEntryPromise: Promise<ServerEntry> | undefined;

async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    serverEntryPromise = import("@tanstack/react-start/server-entry").then(
      (m) => (m.default ?? m) as ServerEntry,
    );
  }
  return serverEntryPromise;
}

// h3 swallows in-handler throws into a normal 500 Response with body
// {"unhandled":true,"message":"HTTPError"} — try/catch alone never fires for those.
async function normalizeCatastrophicSsrResponse(response: Response): Promise<Response> {
  if (response.status < 500) return response;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return response;

  const body = await response.clone().text();
  if (!isH3SwallowedErrorBody(body)) return response;

  console.error(consumeLastCapturedError() ?? new Error(`h3 swallowed SSR error: ${body}`));
  return new Response(renderErrorPage(), {
    status: 500,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

function isH3SwallowedErrorBody(body: string): boolean {
  try {
    const payload = JSON.parse(body) as { unhandled?: unknown; message?: unknown };
    return payload.unhandled === true && payload.message === "HTTPError";
  } catch {
    return false;
  }
}

export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    try {
      const url = new URL(request.url);

      // Serve uploaded media files directly from disk in production
      if (url.pathname.startsWith("/uploads/")) {
        const fileResponse = serveUploadedFile(url.pathname);
        if (fileResponse) return fileResponse;
      }

      const handler = await getServerEntry();
      const response = await handler.fetch(request, env, ctx);
      const normalized = await normalizeCatastrophicSsrResponse(response);

      // Discourage search engines from indexing /admin or any protected/internal URLs via HTTP header
      if (url.pathname.startsWith('/admin') || url.pathname.startsWith('/api') || url.pathname.startsWith('/_server')) {
        const headers = new Headers(normalized.headers);
        headers.set('X-Robots-Tag', 'noindex, nofollow, noarchive, nosnippet');
        return new Response(normalized.body, {
          status: normalized.status,
          statusText: normalized.statusText,
          headers,
        });
      }

      return normalized;
    } catch (error) {
      if (error instanceof Response) {
        return error;
      }
      if (error && typeof error === 'object' && 'status' in error && typeof (error as { status: number }).status === 'number' && (error as { status: number }).status >= 300 && (error as { status: number }).status < 400) {
        const errObj = error as { status: number; headers?: HeadersInit };
        return new Response(null, {
          status: errObj.status,
          headers: errObj.headers,
        });
      }
      console.error(error);
      return new Response(renderErrorPage(), {
        status: 500,
        headers: { "content-type": "text/html; charset=utf-8" },
      });
    }
  },
};
