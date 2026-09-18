// PBKDF2 password hashing on Web Crypto — available on both Node and edge
// runtimes. Format: pbkdf2$<iterations>$<saltB64>$<hashB64>
const ITERATIONS = 120_000;

function toB64(bytes: ArrayBuffer | Uint8Array): string {
  const view = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  let binary = '';
  for (const byte of view) binary += String.fromCharCode(byte);
  return btoa(binary);
}

function fromB64(value: string): Uint8Array {
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

async function derive(password: string, salt: Uint8Array, iterations: number): Promise<string> {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, [
    'deriveBits',
  ]);
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt: salt as unknown as BufferSource, iterations, hash: 'SHA-256' },
    key,
    256,
  );
  return toB64(bits);
}

export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const hash = await derive(password, salt, ITERATIONS);
  return `pbkdf2$${ITERATIONS}$${toB64(salt)}$${hash}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [scheme, iterationsRaw, saltB64, hashB64] = stored.split('$');
  if (scheme !== 'pbkdf2' || !iterationsRaw || !saltB64 || !hashB64) return false;
  const computed = await derive(password, fromB64(saltB64), Number(iterationsRaw));
  // Constant-time comparison.
  if (computed.length !== hashB64.length) return false;
  let diff = 0;
  for (let i = 0; i < computed.length; i += 1) diff |= computed.charCodeAt(i) ^ hashB64.charCodeAt(i);
  return diff === 0;
}
