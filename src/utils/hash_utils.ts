import { loadFromStorage, saveToStorage } from './storage_utils';

/**
 * Утилиты для генерации 8-значного кода короткой ссылки и декодирования.
 */

const BASE62_CHARS = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
const HASH_LENGTH = 8;
const HASH_STORAGE_KEY = 'vio_url_hashes';

const PROTOCOLS = [
  'https://www.',
  'http://www.',
  'https://',
  'http://'
] as const;

/**
 * Генерирует детерминированный 8-символьный хэш для переданного URL
 */
function generate8CharHash(str: string): string {
  let h1 = 0xdeadbeef;
  let h2 = 0x41c6ce57;

  for (let i = 0; i < str.length; i++) {
    const ch = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }

  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);

  let num = (BigInt(h1 >>> 0) << 32n) | BigInt(h2 >>> 0);
  let result = '';

  for (let i = 0; i < HASH_LENGTH; i++) {
    result += BASE62_CHARS[Number(num % 62n)];
    num /= 62n;
  }

  return result;
}

/**
 * Кодирует URL в компактный 8-значный хэш
 */
export function toHash(url: string): string {
  const cleanUrl = url.trim();
  const hash = generate8CharHash(cleanUrl);

  const map = loadFromStorage<Record<string, string>>(HASH_STORAGE_KEY, {});
  map[hash] = cleanUrl;
  saveToStorage(HASH_STORAGE_KEY, map);

  return hash;
}

/**
 * Декодирует хэш обратно в исходный URL
 */
export function toUrl(hash: string): string {
  if (!hash) return '';

  const map = loadFromStorage<Record<string, string>>(HASH_STORAGE_KEY, {});
  if (map[hash]) {
    return map[hash];
  }

  const history = loadFromStorage<Array<{ hash: string; originalUrl: string }>>('vio_shortener_history', []);
  const fromHistory = history.find(item => item.hash === hash);
  if (fromHistory) {
    return fromHistory.originalUrl;
  }

  // Обратная совместимость с Base64 хэшами
  try {
    let base64 = hash.replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4) {
      base64 += '=';
    }

    const binaryString = atob(base64);
    const bytes = Uint8Array.from(binaryString, char => char.charCodeAt(0));
    const decoded = new TextDecoder().decode(bytes);

    if (decoded.length > 0) {
      const code = decoded.charCodeAt(0);
      if (code >= 0 && code < PROTOCOLS.length) {
        return PROTOCOLS[code] + decoded.slice(1);
      }
    }

    return decoded;
  } catch {
    return '';
  }
}
