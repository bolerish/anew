import { act, fireEvent, render, waitFor } from "@testing-library/react";
import { expect, test } from "vitest";

import { loadInitialAppearanceSettings } from "../model/init";
import { appearanceStorage } from "../model/storage";
import { updateAppearanceSetting } from "../model/update";
import { FontField } from "./FontField";

test("one font input preserves spaces and Korean composition, clears and receives external changes", async () => {
  await loadInitialAppearanceSettings();
  const view = render(<FontField />);
  const input = await view.findByRole("textbox", { name: "Font" });
  if (!(input instanceof HTMLInputElement)) throw new Error("Expected a font input");
  expect(view.getAllByRole("textbox")).toHaveLength(1);
  expect(view.getByRole("slider", { name: "Default text size" })).toBeTruthy();
  expect(view.getByRole("slider", { name: "Heading size" })).toBeTruthy();
  fireEvent.focus(input);
  fireEvent.change(input, { target: { value: "Noto " } });
  await waitFor(async () => expect((await appearanceStorage.getValue()).fontFamily).toBe("Noto"));
  expect(input.value).toBe("Noto ");
  fireEvent.change(input, { target: { value: "Noto Sans KR" } });
  await waitFor(async () => expect((await appearanceStorage.getValue()).fontFamily).toBe("Noto Sans KR"));
  fireEvent.compositionStart(input);
  fireEvent.change(input, { target: { value: "맑은 고딕" } });
  fireEvent.compositionEnd(input);
  await waitFor(async () => expect((await appearanceStorage.getValue()).fontFamily).toBe("맑은 고딕"));
  fireEvent.change(input, { target: { value: "" } });
  fireEvent.blur(input);
  await waitFor(async () => expect((await appearanceStorage.getValue()).fontFamily).toBe(""));
  await act(async () => updateAppearanceSetting("fontFamily", "External Font"));
  await waitFor(() => expect(input.value).toBe("External Font"));
  expect(input.getAttribute("aria-describedby")).toContain("font-input-hint");
});
