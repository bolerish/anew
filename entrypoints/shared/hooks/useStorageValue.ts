import { useEffect, useState } from "react";

type StorageValue<T> = {
  getValue: () => Promise<T>;
  watch: (callback: (value: T) => void) => () => void;
};

export function useStorageValue<T>(storageValue: StorageValue<T>, getInitialValue: () => T): T {
  const [value, setValue] = useState(getInitialValue);

  useEffect(() => {
    let isMounted = true;
    void storageValue.getValue().then((nextValue) => {
      if (isMounted) setValue(nextValue);
    });
    const unwatch = storageValue.watch(setValue);

    return () => {
      isMounted = false;
      unwatch();
    };
  }, [storageValue]);

  return value;
}
