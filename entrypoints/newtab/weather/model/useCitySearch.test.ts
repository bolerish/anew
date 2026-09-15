import { act, renderHook } from "@testing-library/react";
import { expect, test, vi } from "vitest";

import { searchCities } from "../api/weather";
import { useCitySearch } from "./useCitySearch";

vi.mock(import("../api/weather"), async (importOriginal) => ({
  ...(await importOriginal()),
  searchCities: vi.fn<typeof searchCities>(),
}));

test("city lookup debounces, ignores superseded results and clears when disabled", async () => {
  vi.useFakeTimers();
  try {
    const pending = Promise.withResolvers<Awaited<ReturnType<typeof searchCities>>>();
    vi.mocked(searchCities).mockReturnValueOnce(pending.promise).mockResolvedValue([]);
    const { result, rerender } = renderHook(({ query, enabled }) => useCitySearch(query, "en", enabled), {
      initialProps: { query: "Seoul", enabled: true },
    });
    expect(result.current.status).toBe("loading");
    expect(searchCities).not.toHaveBeenCalled();
    await act(async () => {
      await vi.advanceTimersByTimeAsync(400);
    });
    const signal = vi.mocked(searchCities).mock.calls[0][2];
    rerender({ query: "Tokyo", enabled: true });
    expect(signal?.aborted).toBe(true);
    await act(async () => {
      pending.resolve([{ name: "Seoul", latitude: 37, longitude: 127 }]);
    });
    expect(result.current.cities).toEqual([]);
    await act(async () => {
      await vi.advanceTimersByTimeAsync(400);
    });
    expect(result.current.status).toBe("empty");
    rerender({ query: "Tokyo", enabled: false });
    expect(result.current.status).toBe("idle");
    expect(result.current.cities).toEqual([]);
  } finally {
    vi.useRealTimers();
  }
});
