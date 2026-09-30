export function normalizeUrl(url: string): string {
  let trimmed = url.trim();
  if (!trimmed) return '';
  if (!/^https?:\/\//i.test(trimmed)) {
    trimmed = 'https://' + trimmed;
  }
  return trimmed;
}

export function isValidUrl(url: string): boolean {
  if (!url) return false;
  try {
    const parsed = new URL(url);
    return /^https?:$/i.test(parsed.protocol);
  } catch {
    return false;
  }
}

export function isSelfUrl(url: string): boolean {
  if (!url) return false;
  try {
    const parsed = new URL(url);
    if (typeof window !== 'undefined' && window.location) {
      return parsed.host === window.location.host;
    }
    return false;
  } catch {
    return false;
  }
}


export function getShortUrlForHash(hash: string): string {
  const base = window.location.origin + window.location.pathname;
  return `${base}#${hash}`;
}
