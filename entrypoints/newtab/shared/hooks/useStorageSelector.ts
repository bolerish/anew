import { useEffect, useState } from "react";
import type { WxtStorageItem } from "wxt/utils/storage";

export function useStorageSelector<TValue, TMetadata extends Record<string, unknown>, TSelected>(
  item: WxtStorageItem<TValue, TMetadata>,
  selector: (value: TValue) => TSelected,
  initialValue: TSelected,
): TSelected {
  const [selectedValue, setSelectedValue] = useState(initialValue);

  useEffect(() => {
    return item.watch((value) => setSelectedValue(selector(value)));
  }, [item, selector]);

  return selectedValue;
}
