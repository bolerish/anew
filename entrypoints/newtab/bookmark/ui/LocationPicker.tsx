import {
  Select,
  SelectPopup,
  SelectGroup,
  SelectList,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@bolerish/ui/select";
import * as stylex from "@stylexjs/stylex";
import { useLanguage } from "~shared/lib/preferences";

import type { BookmarkLocation } from "../model/types";

const styles = stylex.create({
  trigger: { width: "10rem", maxWidth: "100%" },
  indent: (value: number) => ({ paddingInlineStart: `${value}rem` }),
});

type LocationPickerProps = {
  xstyle?: import("@bolerish/ui/button").ButtonProps["xstyle"];
  ariaLabel?: string;
  locations: readonly BookmarkLocation[];
  onLocationChange: (locationId: string) => void;
  selectedLocationId: string | null;
  size?: "sm" | "default";
};

const LOCATION_DEPTH_INDENT_REM = 0.75;

export function LocationPicker({
  xstyle,
  ariaLabel,
  locations: sourceLocations,
  onLocationChange,
  selectedLocationId,
}: LocationPickerProps) {
  const UI_LANGUAGE = useLanguage();
  const rootTitles: Record<string, string> = {
    "1": UI_LANGUAGE.bookmark.bookmarksBar,
    "2": UI_LANGUAGE.bookmark.otherBookmarks,
    "3": UI_LANGUAGE.bookmark.mobileBookmarks,
  };
  const titles = new Map(
    sourceLocations
      .filter((location) => location.depth === 0)
      .map((location) => [location.rootTitle, rootTitles[location.id] ?? location.rootTitle]),
  );
  const locations = sourceLocations.map((location) => ({
    ...location,
    rootTitle: titles.get(location.rootTitle) ?? location.rootTitle,
  }));
  if (locations.length <= 1) {
    return null;
  }

  return (
    <Select
      value={selectedLocationId}
      onValueChange={(value) => {
        if (value) onLocationChange(value);
      }}
    >
      <SelectTrigger aria-label={ariaLabel ?? UI_LANGUAGE.bookmark.source} xstyle={[styles.trigger, xstyle]}>
        <SelectValue>{(value) => getSelectedLocationTitle(locations, value)}</SelectValue>
      </SelectTrigger>
      <SelectPopup align="end" alignItemWithTrigger={false}>
        <SelectList>
          {[...Map.groupBy(locations, (location) => location.rootTitle)].map(([title, group]) => (
            <SelectGroup key={title}>
              <SelectLabel>{title}</SelectLabel>
              {group.map((location) => (
                <SelectItem key={location.id} value={location.id}>
                  <span {...stylex.props(styles.indent(Math.max(location.depth - 1, 0) * LOCATION_DEPTH_INDENT_REM))}>
                    {location.depth === 0 ? UI_LANGUAGE.settings.all : location.title}
                  </span>
                </SelectItem>
              ))}
            </SelectGroup>
          ))}
        </SelectList>
      </SelectPopup>
    </Select>
  );
}

function getSelectedLocationTitle(locations: readonly BookmarkLocation[], locationId: string | null): string {
  const location = locations.find((location) => location.id === locationId);

  if (!location) {
    return locationId ?? "";
  }

  return location.depth === 0 ? location.rootTitle : location.title;
}
