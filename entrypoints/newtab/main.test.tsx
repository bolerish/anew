import { waitFor } from "@testing-library/react";
import { expect, test, vi } from "vitest";
import { preferenceDefaults, preferenceStorage } from "~shared/lib/preferences";

vi.mock("./App", () => ({ default: () => <div data-testid="newtab-ready">Ready</div> }));

test("mounts the new tab after an initial settings read fails without overwriting saved values", async () => {
  const saved = { ...preferenceDefaults, width: 72 };
  await preferenceStorage.setValue(saved);
  const read = vi.spyOn(preferenceStorage, "getValue").mockRejectedValue(new Error("storage unavailable"));
  const write = vi.spyOn(preferenceStorage, "setValue");
  document.body.innerHTML = '<div id="root"></div>';
  await import("./main");
  await waitFor(() => expect(document.querySelector('[data-testid="newtab-ready"]')).not.toBeNull());
  expect(write).not.toHaveBeenCalled();
  read.mockRestore();
  expect(await preferenceStorage.getValue()).toEqual(saved);
});
