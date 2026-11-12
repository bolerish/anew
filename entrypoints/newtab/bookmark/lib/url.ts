import { z } from "zod";

export const bookmarkUrlSchema = z
  .string()
  .trim()
  .transform((url) =>
    /^[a-z][a-z\d+.-]*:/i.test(url) && !/^(?:localhost|[^/?#:]+\.[^/?#:]+):\d+(?:[/?#]|$)/i.test(url)
      ? url
      : `https://${url}`,
  )
  .pipe(z.url())
  .refine((url) => /^(?:https?|ftp|file|mailto|chrome|edge|about):/i.test(url), "Unsupported bookmark URL scheme.")
  .transform((url) => new URL(url).toString());

export function normalizeUrl(rawUrl: string): string {
  return bookmarkUrlSchema.parse(rawUrl);
}

export function canNormalizeUrl(rawUrl: string): boolean {
  return bookmarkUrlSchema.safeParse(rawUrl).success;
}
