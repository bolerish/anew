import { expect, test } from "vitest";

import { resolveBookmarkView } from "./item-view";

test("only original icons keep the selected grid view", () => {
  for (const icon of ["original", "dot", "dash", "none"] as const) {
    expect(resolveBookmarkView(icon, "list")).toBe("list");
    expect(resolveBookmarkView(icon, "icons")).toBe(icon === "original" ? "icons" : "list");
  }
});
