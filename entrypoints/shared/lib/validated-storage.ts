import type { z } from "zod";

type StorageItem<T> = {
  getValue(): Promise<T>;
  setValue(value: T): Promise<void>;
  watch(callback: (value: T, previous: T) => void): () => void;
};

/** Validate persisted values both on initial reads and cross-tab updates. */
export function validateStorage<T>(item: StorageItem<T>, schema: z.ZodType<T>): StorageItem<T> {
  return {
    getValue: async () => schema.parse(await item.getValue()),
    setValue: (value) => item.setValue(schema.parse(value)),
    watch: (callback) => item.watch((value, previous) => callback(schema.parse(value), schema.parse(previous))),
  };
}
