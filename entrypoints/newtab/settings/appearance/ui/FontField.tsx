import * as stylex from "@stylexjs/stylex";
import { useEffect, useState } from "react";
import { useStorageValue } from "~shared/hooks/useStorageValue";
import { useLanguage } from "~shared/lib/preferences";
import { colorVars, spacingVars, typographyVars } from "~shared/styles/semantic.stylex";
import { Field, FieldDescription, FieldLabel, FieldSet, FieldLegend } from "~shared/ui/field";
import { Input } from "~shared/ui/input";
import { Slider } from "~shared/ui/slider";

import { TEXT_SCALE } from "../model/constants";
import { getInitialAppearanceSettings } from "../model/init";
import { sanitizeAppearanceSettings } from "../model/sanitize";
import { appearanceStorage } from "../model/storage";
import { updateAppearanceSetting } from "../model/update";
const styles = stylex.create({
  hint: { color: colorVars.fgSecondary, fontSize: typographyVars.fontSizeSm, margin: 0 },
  row: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: spacingVars.space2 },
  value: { color: colorVars.fgSecondary, fontSize: typographyVars.fontSizeSm, fontVariantNumeric: "tabular-nums" },
});
export function FontField() {
  const UI_LANGUAGE = useLanguage();
  const [placeholder, setPlaceholder] = useState("");
  const storedSettings = useStorageValue(appearanceStorage, getInitialAppearanceSettings);
  const settings = sanitizeAppearanceSettings(storedSettings);
  useEffect(() => {
    let active = true;
    void browser.fontSettings
      .getFont({ genericFamily: "standard" })
      .then(({ fontId }) => {
        if (active) setPlaceholder(fontId);
      })
      .catch(() => {
        if (active) setPlaceholder("");
      });
    return () => {
      active = false;
    };
  }, []);
  return (
    <FieldSet>
      {(["headingFontFamily", "fontFamily"] as const).map((setting) => (
        <FieldSet key={setting}>
          <FieldLegend>
            {setting === "headingFontFamily" ? UI_LANGUAGE.settings.header : UI_LANGUAGE.settings.body}
          </FieldLegend>
          <Field>
            <FieldLabel htmlFor={setting}>{UI_LANGUAGE.settings.font}</FieldLabel>
            <FieldDescription>
              {setting === "headingFontFamily"
                ? UI_LANGUAGE.settings.headingFontDescription
                : UI_LANGUAGE.settings.bodyFontDescription}
            </FieldDescription>
            <Input
              id={setting}
              aria-describedby="font-input-hint"
              placeholder={placeholder}
              value={settings[setting]}
              onChange={(e) => void updateAppearanceSetting(setting, e.target.value)}
            />
          </Field>
          <FontScaleField setting={setting === "headingFontFamily" ? "headingScale" : "fontScale"} />
        </FieldSet>
      ))}
      <p id="font-input-hint" {...stylex.props(styles.hint)}>
        {UI_LANGUAGE.settings.fontDescription}
      </p>
    </FieldSet>
  );
}

export function FontScaleField({ setting }: { setting: "fontScale" | "headingScale" }) {
  const UI_LANGUAGE = useLanguage();
  const settings = useStorageValue(appearanceStorage, getInitialAppearanceSettings);
  const scale = sanitizeAppearanceSettings(settings)[setting];
  const label = UI_LANGUAGE.settings.textSize;
  const description =
    setting === "fontScale" ? UI_LANGUAGE.settings.bodyDescription : UI_LANGUAGE.settings.headerDescription;
  return (
    <Field>
      <div {...stylex.props(styles.row)}>
        <FieldLabel id={`${setting}-label`}>{label}</FieldLabel>
        <output {...stylex.props(styles.value)}>×{scale.toFixed(2)}</output>
      </div>
      <FieldDescription id={`${setting}-hint`}>{description}</FieldDescription>
      <Slider
        aria-labelledby={`${setting}-label`}
        aria-describedby={`${setting}-hint`}
        getAriaLabel={() => label}
        min={TEXT_SCALE.min}
        max={TEXT_SCALE.max}
        step={TEXT_SCALE.step}
        value={scale}
        onValueChange={(value) => {
          if (typeof value === "number") void updateAppearanceSetting(setting, value);
        }}
      />
    </Field>
  );
}
