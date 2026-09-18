import { createStart, createCsrfMiddleware, createMiddleware } from "@tanstack/react-start";

import { renderErrorPage } from "./lib/error-page";

const errorMiddleware = createMiddleware().server(async ({ next }) => {
  try {
    return await next();
  } catch (error) {
    if (error != null && typeof error === "object" && "statusCode" in error) {
      throw error;
    }
    console.error(error);
    return new Response(renderErrorPage(), {
      status: 500,
      headers: { "content-type": "text/html; charset=utf-8" },
    });
  }
});

// Start installs this automatically when src/start.ts is absent; defining the
// file opts out, so re-add it explicitly to keep server functions protected
// from cross-site requests.
// Hosts the app is legitimately served from. Behind the Lovable preview proxy
// the request URL is the internal host, so a plain origin === url comparison
// rejects genuine same-site requests (POST server fns got 403 Forbidden).
const TRUSTED_HOST_SUFFIXES = [".lovable.app", ".lovableproject.com", ".lovable.dev"];

const csrfMiddleware = createCsrfMiddleware({
  filter: (ctx) => ctx.handlerType === "serverFn",
  origin: (origin, ctx) => {
    let originHost: string;
    try {
      originHost = new URL(origin).host;
    } catch {
      return false;
    }
    const request = ctx.request;
    const url = new URL(request.url);
    const forwardedHost = request.headers.get("x-forwarded-host");
    if (originHost === url.host) return true;
    if (forwardedHost && originHost === forwardedHost) return true;
    if (originHost === "localhost:8080" || originHost === "127.0.0.1:8080") return true;
    return TRUSTED_HOST_SUFFIXES.some((suffix) => originHost.endsWith(suffix));
  },
});

export const startInstance = createStart(() => ({
  requestMiddleware: [errorMiddleware, csrfMiddleware],
}));
