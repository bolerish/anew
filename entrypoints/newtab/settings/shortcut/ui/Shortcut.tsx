import { UI_LANGUAGE } from "~shared/lib/language";
import { Switch } from "~shared/ui/switch";

import { Section, SectionContent, SectionHeader } from "~/entrypoints/newtab/settings/ui/Section";
import { useStorageValue } from "~/entrypoints/shared/hooks/useStorageValue";

import { getInitialShortcutSettings, shortcutStorage, updateShortcutSetting } from "../model/shortcut";

export function Shortcut() {
  const { showShortcutHints } = useStorageValue(shortcutStorage, getInitialShortcutSettings);

  return (
    <Section className="gap-0">
      <SectionHeader title="Shortcuts">
        <Switch
          checked={showShortcutHints}
          aria-label="Footer hints"
          onCheckedChange={(checked) => void updateShortcutSetting("showShortcutHints", checked)}
        />
      </SectionHeader>
      <SectionContent>
        <p className="text-muted-foreground/75 text-mds-setting-group">
          {UI_LANGUAGE.settings.shortcut.hints.description}
        </p>
      </SectionContent>
    </Section>
  );
}
