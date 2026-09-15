import { render, fireEvent } from "@testing-library/react";
import { expect, test, vi } from "vitest";
import { preferenceStorage, preferenceDefaults } from "~shared/lib/preferences";

import { fetchCurrentCity } from "../api/location";
import { weatherSettings } from "../model/weather";
import { WeatherSettings } from "./WeatherSettings";

vi.mock("../api/location", () => ({ fetchCurrentCity: vi.fn<() => Promise<never>>() }));

test("GPS failure stays next to the input and permits retry", async () => {
  await preferenceStorage.setValue({ ...preferenceDefaults, language: "en" });
  await weatherSettings.setValue({ enabled: true, city: null });
  vi.mocked(fetchCurrentCity).mockRejectedValueOnce({ code: 3 });
  const { findByRole } = render(<WeatherSettings />);
  const gps = await findByRole("button", { name: "Use current location" });
  fireEvent.click(gps);
  const error = await findByRole("alert");
  expect(error.textContent).toMatch(/timed out/i);
  expect(gps.hasAttribute("disabled")).toBe(false);
});
