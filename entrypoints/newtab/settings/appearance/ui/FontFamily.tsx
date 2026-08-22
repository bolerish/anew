import { ArrowCounterClockwiseIcon } from "@phosphor-icons/react";
import { useEffect, useState } from "react";
import { SectionItem } from "~newtab/settings/ui/SettingsSection";
import { UI_LANGUAGE } from "~shared/lib/language";
import { Button } from "~shared/ui/button";
import { Input } from "~shared/ui/input";

import type { AppearanceSettings } from "../model/types";
import { updateAppearanceSetting } from "../model/update";

type FontFamilySettingProps = { fontFamily: AppearanceSettings["fontFamily"] };

export function FontFamily({ fontFamily }: FontFamilySettingProps) {
  const [fontFamilyPlaceholder, setFontFamilyPlaceholder] = useState("");

  useEffect(() => {
    void browser.fontSettings.getFont({ genericFamily: "standard" }).then(({ fontId }) => {
      setFontFamilyPlaceholder(fontId);
    });
  }, []);

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
            value={fontFamily}
            onChange={(e) => {
              void updateAppearanceSetting("fontFamily", e.target.value);
            }}
          />
          {fontFamily ? (
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
