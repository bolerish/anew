export function normalizeUrl(rawUrl: string): string {
  const trimmedUrl = rawUrl.trim();
  const withProtocol = /^https?:\/\//i.test(trimmedUrl) ? trimmedUrl : `https://${trimmedUrl}`;

  return new URL(withProtocol).toString();
}

export function canNormalizeUrl(rawUrl: string): boolean {
  try {
    normalizeUrl(rawUrl);
    return true;
  } catch {
    return false;
  }
}
