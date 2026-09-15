import { z } from "zod";

export const bookmarkUrlSchema = z
  .string()
  .trim()
  .transform((url) => (/^https?:\/\//i.test(url) ? url : `https://${url}`))
  .pipe(z.url())
  .transform((url) => new URL(url).toString());

export function normalizeUrl(rawUrl: string): string {
  return bookmarkUrlSchema.parse(rawUrl);
}

export function canNormalizeUrl(rawUrl: string): boolean {
  return bookmarkUrlSchema.safeParse(rawUrl).success;
}
