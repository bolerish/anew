import { colorVars, spacingVars, typo } from "@bolerish/tokens/semantic.stylex";
import { Field, FieldDescription, FieldGroup, FieldLabel, FieldSet, FieldLegend } from "@bolerish/ui/field";
import { Input } from "@bolerish/ui/input";
import { Slider } from "@bolerish/ui/slider";
import * as stylex from "@stylexjs/stylex";
import { useEffect, useState } from "react";
import { useStorageValue } from "~shared/hooks/useStorageValue";
import { useLanguage } from "~shared/lib/preferences";

import { TEXT_SCALE } from "../model/constants";
import { getInitialAppearanceSettings } from "../model/init";
import { sanitizeAppearanceSettings } from "../model/sanitize";
import { appearanceStorage } from "../model/storage";
import { updateAppearanceSetting } from "../model/update";
const styles = stylex.create({
  legend: { fontSize: `calc(${typo.fontSizeSm} / var(--mds-content-scale, 1) * var(--mds-heading-scale, 1))` },
  row: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: spacingVars.space2 },
  value: { color: colorVars.fgSecondary, fontSize: typo.fontSizeSm, fontVariantNumeric: "tabular-nums" },
});
export function FontField() {
  const UI_LANGUAGE = useLanguage();
  const [placeholder, setPlaceholder] = useState("");
  const storedSettings = useStorageValue(appearanceStorage, getInitialAppearanceSettings);
  const settings = sanitizeAppearanceSettings(storedSettings);
  const [fontFamily, setFontFamily] = useState(settings.fontFamily);
  const [isEditing, setIsEditing] = useState(false);
  useEffect(() => {
    if (!isEditing) setFontFamily(settings.fontFamily);
  }, [isEditing, settings.fontFamily]);
  useEffect(() => {
    if (!browser.fontSettings) return;
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
    <FieldGroup>
      <Field>
        <FieldLabel htmlFor="fontFamily">{UI_LANGUAGE.settings.font}</FieldLabel>
        <FieldDescription id="font-scope-hint">{UI_LANGUAGE.settings.fontScopeDescription}</FieldDescription>
        <Input
          id="fontFamily"
          aria-describedby="font-scope-hint font-input-hint"
          placeholder={placeholder}
          value={fontFamily}
          onFocus={() => setIsEditing(true)}
          onBlur={() => setIsEditing(false)}
          onChange={(e) => {
            setFontFamily(e.target.value);
            void updateAppearanceSetting("fontFamily", e.target.value);
          }}
        />
        <FieldDescription id="font-input-hint">{UI_LANGUAGE.settings.fontDescription}</FieldDescription>
      </Field>
      <FieldSet>
        <FieldLegend xstyle={styles.legend}>{UI_LANGUAGE.settings.textSize}</FieldLegend>
        <FontScaleField setting="fontScale" />
        <FontScaleField setting="headingScale" />
      </FieldSet>
    </FieldGroup>
  );
}

export function FontScaleField({ setting }: { setting: "fontScale" | "headingScale" }) {
  const UI_LANGUAGE = useLanguage();
  const settings = useStorageValue(appearanceStorage, getInitialAppearanceSettings);
  const scale = sanitizeAppearanceSettings(settings)[setting];
  const label = setting === "fontScale" ? UI_LANGUAGE.settings.body : UI_LANGUAGE.settings.header;
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
