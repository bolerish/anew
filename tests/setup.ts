import { cleanup } from "@testing-library/react";
import { afterEach, beforeEach, vi } from "vitest";
import { fakeBrowser } from "wxt/testing";
beforeEach(() => {
  fakeBrowser.reset();
  let tail = Promise.resolve();
  Object.defineProperty(navigator, "locks", {
    configurable: true,
    value: {
      request: <T>(_name: string, action: () => Promise<T>) => {
        const next = tail.then(action);
        tail = next.then(
          () => {},
          () => {},
        );
        return next;
      },
    },
  });
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  );
  vi.stubGlobal(
    "matchMedia",
    vi.fn(() => ({
      matches: false,
      addEventListener: vi.fn<() => void>(),
      removeEventListener: vi.fn<() => void>(),
    })),
  );
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});
