import { UI_LANGUAGE } from "~shared/lib/language";
import { cn } from "~shared/lib/utils";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "~shared/ui/select";

import type { BookmarkLocation } from "../model/types";

const LOCATION_DEPTH_INDENT_REM = 0.75;

type LocationPickerProps = {
  ariaLabel?: string;
  locations: BookmarkLocation[];
  onLocationChange: (locationId: string) => void;
  selectedLocationId: string | null;
  size?: "sm" | "default";
  triggerClassName?: string;
};

export function LocationPicker({
  ariaLabel = UI_LANGUAGE.bookmark.label.source,
  locations,
  onLocationChange,
  selectedLocationId,
  size = "default",
  triggerClassName,
}: LocationPickerProps) {
  if (locations.length <= 1) {
    return null;
  }

  return (
    <Select value={selectedLocationId ?? undefined} onValueChange={onLocationChange}>
      <SelectTrigger
        aria-label={ariaLabel}
        className={cn(
          "bg-background",
          size === "sm" && "text-foreground/75 h-6 w-26 px-1.5 sm:w-37.5",
          triggerClassName,
        )}
        size={size}
      >
        <SelectValue>{(value) => getSelectedLocationTitle(locations, value)}</SelectValue>
      </SelectTrigger>
      <SelectContent
        align="end"
        alignItemWithTrigger={false}
        className="bg-popover w-anchor min-w-anchor font-mono"
        position="popper"
      >
        {groupLocations(locations).map((group) => (
          <SelectGroup key={group.title}>
            <SelectLabel className="text-muted-foreground text-mds-caption">{group.title}</SelectLabel>
            {group.locations.map((location) => (
              <SelectItem key={location.id} value={location.id}>
                <span
                  style={{ paddingInlineStart: `${Math.max(location.depth - 1, 0) * LOCATION_DEPTH_INDENT_REM}rem` }}
                >
                  - {location.depth === 0 ? "All" : location.title}
                </span>
              </SelectItem>
            ))}
          </SelectGroup>
        ))}
      </SelectContent>
    </Select>
  );
}

function getSelectedLocationTitle(locations: readonly BookmarkLocation[], locationId: string): string {
  const location = locations.find((location) => location.id === locationId);

  if (!location) {
    return locationId;
  }

  return location.depth === 0 ? location.rootTitle : location.title;
}

function groupLocations(locations: readonly BookmarkLocation[]) {
  const groups = new Map<string, BookmarkLocation[]>();

  for (const location of locations) {
    const group = groups.get(location.rootTitle);

    if (group) {
      group.push(location);
    } else {
      groups.set(location.rootTitle, [location]);
    }
  }

  return [...groups].map(([title, groupLocations]) => ({ locations: groupLocations, title }));
}
