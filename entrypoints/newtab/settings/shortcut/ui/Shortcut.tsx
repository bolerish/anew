import { spacingVars } from "@bolerish/tokens/semantic.stylex";
import { Field, FieldDescription, FieldLabel } from "@bolerish/ui/field";
import { Switch } from "@bolerish/ui/switch";
import * as stylex from "@stylexjs/stylex";
import { useStorageValue } from "~shared/hooks/useStorageValue";
import { useLanguage } from "~shared/lib/preferences";

import { getInitialShortcutSettings, shortcutStorage, updateShortcutSetting } from "../model/shortcut";

const styles = stylex.create({
  row: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: spacingVars.space3 },
});
export function Shortcut() {
  const UI_LANGUAGE = useLanguage();
  const { showShortcutHints } = useStorageValue(shortcutStorage, getInitialShortcutSettings);
  return (
    <Field>
      <div {...stylex.props(styles.row)}>
        <FieldLabel htmlFor="shortcut-hints">{UI_LANGUAGE.settings.shortcuts}</FieldLabel>

        <Switch
          id="shortcut-hints"
          checked={showShortcutHints}
          onCheckedChange={(checked) => void updateShortcutSetting("showShortcutHints", checked)}
        />
      </div>
      <FieldDescription>{UI_LANGUAGE.settings.shortcutsDescription}</FieldDescription>
    </Field>
  );
}
