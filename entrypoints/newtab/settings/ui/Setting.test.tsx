import { render, fireEvent, waitFor, within } from "@testing-library/react";
import { expect, test, vi } from "vitest";
import { getMessages } from "~shared/i18n";

import { Setting } from "./Setting";
vi.mock("~shared/lib/preferences", async (importOriginal) => {
  const original = await importOriginal<typeof import("~shared/lib/preferences")>();
  return { ...original, useLanguage: () => getMessages("en") };
});
test("settings detail and update reader restore on browser back/forward", async () => {
  window.history.replaceState(null, "");
  const { findByRole, queryByRole } = render(<Setting open onOpenChange={vi.fn<() => void>()} />);
  fireEvent.click(await findByRole("button", { name: "Theme" }));
  expect(window.history.state.minSettingsIndex).toBe(1);
  window.history.back();
  await findByRole("button", { name: "Theme" });
  window.history.forward();
  await findByRole("button", { name: "Back to settings" });
  window.history.back();
  fireEvent.click(await findByRole("button", { name: /Update history/ }));
  await findByRole("heading", { name: "Update history", level: 1 });
  window.history.back();
  await waitFor(() => expect(queryByRole("heading", { name: "Update history", level: 1 })).toBeNull());
  window.history.forward();
  await findByRole("heading", { name: "Update history", level: 1 });
  const reader = (await findByRole("heading", { name: "Update history", level: 1 })).closest(
    '[role="dialog"]',
  ) as HTMLElement;
  fireEvent.click(await within(reader).findByRole("button", { name: "Back to settings" }));
  await waitFor(() => expect(queryByRole("heading", { name: "Update history", level: 1 })).toBeNull());
});
