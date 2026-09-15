import { useEffect, useState } from "react";
import { notifyError } from "~shared/lib/notify-error";

type StorageValue<T> = {
  getValue: () => Promise<T>;
  watch: (callback: (value: T) => void) => () => void;
};

const latestValues = new WeakMap<object, unknown>();

export function useStorageValue<T>(storageValue: StorageValue<T>, getInitialValue: () => T): T {
  const [value, setValue] = useState<T>(() =>
    latestValues.has(storageValue) ? (latestValues.get(storageValue) as T) : getInitialValue(),
  );

  useEffect(() => {
    let isMounted = true;
    let changed = false;
    function receive(nextValue: T) {
      latestValues.set(storageValue, nextValue);
      if (isMounted) setValue(nextValue);
    }
    const unwatch = storageValue.watch((nextValue) => {
      changed = true;
      receive(nextValue);
    });
    void storageValue
      .getValue()
      .then((nextValue) => {
        if (!changed && isMounted) receive(nextValue);
      })
      .catch((error: unknown) => {
        if (isMounted) void notifyError(error);
      });

    return () => {
      isMounted = false;
      unwatch();
    };
  }, [storageValue]);

  return value;
}
