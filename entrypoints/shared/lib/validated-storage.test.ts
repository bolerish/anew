import { expect, test, vi } from "vitest";
import { z } from "zod";

import { validateStorage } from "./validated-storage";

test("stored values and watch events use the same fallback rules", async () => {
  const schema = z.object({ enabled: z.boolean().catch(false) }).catch({ enabled: false });
  let receive: (value: { enabled: boolean }, previous: { enabled: boolean }) => void = () => {};
  const item = {
    getValue: vi.fn<() => Promise<{ enabled: boolean }>>().mockResolvedValue({ enabled: "invalid" } as never),
    setValue: vi.fn<(value: { enabled: boolean }) => Promise<void>>().mockResolvedValue(undefined),
    watch: vi.fn<(callback: typeof receive) => () => void>((callback) => {
      receive = callback;
      return () => {};
    }),
  };
  const stored = validateStorage(item, schema);
  expect(await stored.getValue()).toEqual({ enabled: false });
  const listener = vi.fn<typeof receive>();
  stored.watch(listener);
  receive(null as never, { enabled: true });
  expect(listener).toHaveBeenCalledWith({ enabled: false }, { enabled: true });
  await stored.setValue({ enabled: true });
  expect(item.setValue).toHaveBeenCalledWith({ enabled: true });
});
