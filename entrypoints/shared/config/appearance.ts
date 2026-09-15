import { z } from "zod";

export const bookmarkIconDisplayModeSchema = z
  .enum(["dash", "none", "original", "dot", "square"])
  .transform((value) => (value === "square" ? "dot" : value));

export type BookmarkIconDisplayMode = z.output<typeof bookmarkIconDisplayModeSchema>;
