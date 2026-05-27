import { ArrowCounterClockwiseIcon } from "@phosphor-icons/react";
import { useMemo } from "react";
import { UI_LANGUAGE } from "~newtab/shared/lib/language";
import { Button } from "~newtab/shared/ui/button";
import { Input } from "~newtab/shared/ui/input";

import { SectionItem } from "../../ui/Section";
import { isSystemFontFamily } from "../lib/font";
import type { AppearanceSettings } from "../lib/types";
import { updateAppearanceSetting } from "../lib/update";

type FontFamilySettingProps = { fontFamily: AppearanceSettings["fontFamily"] };

export function FontFamily({ fontFamily }: FontFamilySettingProps) {
  const customFontFamily = fontFamily.trim();
  const isSystemFont = isSystemFontFamily(customFontFamily);
  const fontFamilyPlaceholder = useMemo(resolveFontFamilyPlaceholder, []);

  return (
    <SectionItem label="Font">
      <div className="grid gap-1">
        <p className="text-muted-foreground/75 text-mds-setting-group" id="font-family-hint">
          {UI_LANGUAGE.settings.appearance.fontFamily.description}
        </p>
        <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-2">
          <Input
            aria-describedby="font-family-hint"
            aria-label="Font"
            className="border-input text-foreground/80 text-mds-setting-item placeholder:text-muted-foreground/55 h-7 bg-transparent px-2.5 py-1 font-mono focus-visible:ring-0"
            placeholder={fontFamilyPlaceholder}
            value={isSystemFont ? "" : fontFamily}
            onChange={(e) => {
              const nextFontFamily = e.target.value;
              void updateAppearanceSetting("fontFamily", isSystemFontFamily(nextFontFamily) ? "" : nextFontFamily);
            }}
          />
          {customFontFamily.length > 0 && !isSystemFont ? (
            <Button
              aria-label="Reset"
              className="h-7 w-7 p-0"
              size="icon-sm"
              type="button"
              variant="outline"
              onClick={() => void updateAppearanceSetting("fontFamily", "")}
            >
              <ArrowCounterClockwiseIcon aria-hidden="true" />
            </Button>
          ) : null}
        </div>
      </div>
    </SectionItem>
  );
}

function resolveFontFamilyPlaceholder(): string {
  if (typeof window === "undefined") return "Arial, Helvetica, Times New Roman";
  return window.getComputedStyle(document.documentElement).fontFamily || "Arial, Helvetica, Times New Roman";
}
