import { darkColorTheme, lightColorTheme } from "@bolerish/tokens/themes.stylex";
import * as stylex from "@stylexjs/stylex";
import { act, renderHook, waitFor } from "@testing-library/react";
import { expect, test, vi } from "vitest";
import { storage } from "wxt/utils/storage";

import { initializeTheme, useThemeSync } from "./theme";
test("saved and system themes replace root classes and preserve unrelated classes", async () => {
  document.documentElement.classList.add("app");
  await storage.setItem("local:newtab:theme-mode", "dark");
  await initializeTheme();
  const dark = stylex.props(darkColorTheme).className!.split(" ");
  expect(dark.every((name) => document.documentElement.classList.contains(name))).toBe(true);
  const { unmount } = renderHook(() => useThemeSync());
  await act(async () => storage.setItem("local:newtab:theme-mode", "light"));
  await waitFor(() => expect(document.documentElement.style.colorScheme).toBe("light"));
  expect(
    stylex
      .props(lightColorTheme)
      .className!.split(" ")
      .every((name) => document.documentElement.classList.contains(name)),
  ).toBe(true);
  const light = stylex.props(lightColorTheme).className!.split(" ");
  expect(
    dark.filter((name) => !light.includes(name)).some((name) => document.documentElement.classList.contains(name)),
  ).toBe(false);
  unmount();
  expect(document.documentElement.classList.contains("app")).toBe(true);
  vi.stubGlobal(
    "matchMedia",
    vi.fn(() => ({ matches: true, addEventListener: vi.fn<() => void>(), removeEventListener: vi.fn<() => void>() })),
  );
  await storage.setItem("local:newtab:theme-mode", "system");
  await initializeTheme();
  expect(document.documentElement.style.colorScheme).toBe("dark");
});
