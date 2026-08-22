import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [
        "text-mds-content",
        "text-mds-select-item",
        "text-mds-input-placeholder",
        "text-mds-setting-section",
        "text-mds-setting-group",
        "text-mds-setting-item",
        "text-mds-bookmark-section",
        "text-mds-bookmark-item",
        "text-mds-shortcut-key",
        "text-mds-shortcut-label",
        "text-mds-caption",
      ],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
