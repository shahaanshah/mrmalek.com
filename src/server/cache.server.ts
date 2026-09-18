// Small server-side read cache for public content.
//
// Public pages read through `cached()`; every admin write calls
// `invalidate()` with the tags it touched, so published changes appear
// immediately instead of waiting for a TTL.
type Entry = { value: unknown; expires: number };

const store = new Map<string, Entry>();
const DEFAULT_TTL_MS = 5 * 60 * 1000;

export async function cached<T>(key: string, loader: () => Promise<T>, ttlMs = DEFAULT_TTL_MS): Promise<T> {
  const hit = store.get(key);
  if (hit && hit.expires > Date.now()) return hit.value as T;
  const value = await loader();
  store.set(key, { value, expires: Date.now() + ttlMs });
  return value;
}

/** Drops every cache entry whose key starts with one of the given prefixes. */
export function invalidate(...prefixes: string[]): void {
  if (!prefixes.length) {
    store.clear();
    return;
  }
  for (const key of store.keys()) {
    if (prefixes.some((prefix) => key.startsWith(prefix))) store.delete(key);
  }
}

export const CacheKeys = {
  videos: 'videos:',
  categories: 'categories:',
  content: 'content:',
  settings: 'settings:',
  sitemap: 'sitemap:',
};

/** Called after any content mutation. */
export function invalidateContent(type?: string): void {
  invalidate(CacheKeys.content + (type ?? ''), CacheKeys.sitemap, CacheKeys.videos);
}
