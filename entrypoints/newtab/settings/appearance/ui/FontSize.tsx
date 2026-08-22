import { SectionItem } from "~newtab/settings/ui/SettingsSection";
import { UI_LANGUAGE } from "~shared/lib/language";
import { Slider } from "~shared/ui/slider";

import { FONT_SIZE } from "../model/constants";
import type { AppearanceSettings } from "../model/types";
import { updateAppearanceSetting } from "../model/update";

type FontSizeProps = { fontSize: AppearanceSettings["fontSize"] };

export function FontSize({ fontSize }: FontSizeProps) {
  return (
    <SectionItem description={UI_LANGUAGE.settings.appearance.fontSize.description} label="Size">
      <div className="grid grid-cols-[1fr_auto] items-center gap-3">
        <Slider
          aria-label="Font size"
          indicatorClassName="bg-primary"
          max={FONT_SIZE.max}
          min={FONT_SIZE.min}
          step={FONT_SIZE.step}
          value={fontSize ?? FONT_SIZE.preview}
          onValueChange={(value) => void updateAppearanceSetting("fontSize", value)}
        />
        <button
          aria-label="Reset font size"
          className="border-input text-foreground/70 text-mds-setting-group hover:bg-accent hover:text-accent-foreground rounded-mds h-7 min-w-12 border bg-transparent px-2 transition-colors"
          type="button"
          onClick={() => void updateAppearanceSetting("fontSize", null)}
        >
          {fontSize ?? FONT_SIZE.preview}px
        </button>
      </div>
    </SectionItem>
  );
}
