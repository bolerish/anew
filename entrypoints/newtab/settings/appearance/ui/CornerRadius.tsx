import { colorVars, spacingVars, typo, sizeVars } from "@bolerish/tokens/semantic.stylex";
import { Field, FieldLabel, FieldDescription } from "@bolerish/ui/field";
import { Slider } from "@bolerish/ui/slider";
import * as stylex from "@stylexjs/stylex";
import { useStorageValue } from "~shared/hooks/useStorageValue";
import { useLanguage } from "~shared/lib/preferences";

import { CORNER_RADIUS } from "../model/constants";
import { getInitialAppearanceSettings } from "../model/init";
import { appearanceStorage } from "../model/storage";
import { updateAppearanceSetting } from "../model/update";
const styles = stylex.create({
  row: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: spacingVars.space2 },
  value: { color: colorVars.fgSecondary, fontSize: typo.fontSizeSm, fontVariantNumeric: "tabular-nums" },
  preview: {
    width: sizeVars.iconLg,
    height: sizeVars.iconLg,
    borderWidth: sizeVars.stroke,
    borderStyle: "solid",
    borderColor: colorVars.strokeDefault,
    backgroundColor: colorVars.bgActionPrimary,
  },
  radius: (value: number) => ({ borderRadius: `${value}px` }),
});
export function CornerRadiusField() {
  const UI_LANGUAGE = useLanguage();
  const { cornerRadius } = useStorageValue(appearanceStorage, getInitialAppearanceSettings);
  return (
    <Field>
      <div {...stylex.props(styles.row)}>
        <FieldLabel id="corner-radius-label">{UI_LANGUAGE.settings.cornerRadius}</FieldLabel>
        <div {...stylex.props(styles.row)}>
          <output {...stylex.props(styles.value)}>{cornerRadius}px</output>
          <span aria-hidden="true" {...stylex.props(styles.preview, styles.radius(cornerRadius))} />
        </div>
      </div>
      <FieldDescription id="corner-radius-description">{UI_LANGUAGE.settings.cornerRadiusDescription}</FieldDescription>
      <Slider
        aria-labelledby="corner-radius-label"
        aria-describedby="corner-radius-description"
        getAriaLabel={() => UI_LANGUAGE.settings.cornerRadius}
        min={CORNER_RADIUS.min}
        max={CORNER_RADIUS.max}
        step={0.5}
        value={cornerRadius}
        onValueChange={(value) => {
          if (typeof value === "number") void updateAppearanceSetting("cornerRadius", value);
        }}
      />
    </Field>
  );
}
