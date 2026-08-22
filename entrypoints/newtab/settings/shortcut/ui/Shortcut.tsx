import { useEffect, useState } from "react";
import { Section, SectionContent, SectionHeader } from "~newtab/settings/ui/SettingsSection";
import { UI_LANGUAGE } from "~shared/lib/language";
import { Switch } from "~shared/ui/switch";

import { getInitialShortcutSettings, shortcutStorage, updateShortcutSetting } from "../model/shortcut";

export function Shortcut() {
  const [showShortcutHints, setShowShortcutHints] = useState(() => getInitialShortcutSettings().showShortcutHints);

  useEffect(() => {
    let isMounted = true;
    void shortcutStorage.getValue().then((settings) => {
      if (isMounted) setShowShortcutHints(settings.showShortcutHints);
    });

    const unwatchShortcut = shortcutStorage.watch((settings) => setShowShortcutHints(settings.showShortcutHints));

    return () => {
      isMounted = false;
      unwatchShortcut();
    };
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
