import { useEffect, useState } from "react";
import {
  getInitialShortcutSettings,
  shortcutStorage,
  updateShortcutSetting,
} from "~newtab/settings/shortcut/lib/shortcut-settings";
import { UI_LANGUAGE } from "~newtab/shared/lib/language";

import { Switch } from "../../shared/ui/switch";
import { Section, SectionHeader, SectionContent } from "../ui/Section";

export function Shortcut() {
  const [showShortcutHints, setShowShortcutHints] = useState(() => getInitialShortcutSettings().showShortcutHints);

  useEffect(() => {
    return shortcutStorage.watch((settings) => setShowShortcutHints(settings.showShortcutHints));
  }, []);

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
