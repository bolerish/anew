import { SectionItem } from "~newtab/settings/ui/SettingsSection";
import { UI_LANGUAGE } from "~shared/lib/language";
import { ToggleGroup, ToggleGroupItem } from "~shared/ui/toggle-group";

import type { BookmarkIconDisplayMode } from "../model/types";
import { updateAppearanceSetting } from "../model/update";

type BookmarkIconProps = { bookmarkIconDisplayMode: BookmarkIconDisplayMode };

export function BookmarkIcon({ bookmarkIconDisplayMode }: BookmarkIconProps) {
  return (
    <SectionItem description={UI_LANGUAGE.settings.appearance.bookmarkIcon.description} label="Icons">
      <ToggleGroup
        aria-label="Bookmark icon display"
        className="grid h-7 w-full"
        size="sm"
        spacing={0}
        style={{ gridTemplateColumns: "repeat(4, minmax(0, 1fr))" }}
        type="single"
        value={bookmarkIconDisplayMode}
        variant="outline"
        onValueChange={(value) => {
          if (value) void updateAppearanceSetting("bookmarkIconDisplayMode", value as BookmarkIconDisplayMode);
        }}
      >
        <ToggleGroupItem value="original">Icon</ToggleGroupItem>
        <ToggleGroupItem value="square">Square</ToggleGroupItem>
        <ToggleGroupItem value="dash">Dash</ToggleGroupItem>
        <ToggleGroupItem value="none">None</ToggleGroupItem>
      </ToggleGroup>
    </SectionItem>
  );
}
