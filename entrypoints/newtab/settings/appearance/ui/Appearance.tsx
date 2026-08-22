import { useEffect, useState } from "react";
import { Section, SectionContent, SectionHeader } from "~newtab/settings/ui/SettingsSection";

import { getInitialAppearanceSettings } from "../model/init";
import { appearanceStorage } from "../model/storage";
import type { AppearanceSettings } from "../model/types";
import { BookmarkIcon } from "./BookmarkIcon";
import { CornerRadius } from "./CornerRadius";
import { FontFamily } from "./FontFamily";
import { FontSize } from "./FontSize";
import { Theme } from "./Theme";

export function Appearance() {
  const [settings, setSettings] = useState<AppearanceSettings>(getInitialAppearanceSettings);

  useEffect(() => {
    let isMounted = true;
    void appearanceStorage.getValue().then((settings) => {
      if (isMounted) setSettings(settings);
    });

    const unwatchAppearance = appearanceStorage.watch(setSettings);

    return () => {
      isMounted = false;
      unwatchAppearance();
    };
  }, []);

  return (
    <Section>
      <SectionHeader title="Appearance" />
      <SectionContent>
        <Theme />
        <FontFamily fontFamily={settings.fontFamily} />
        <FontSize fontSize={settings.fontSize} />
        <BookmarkIcon bookmarkIconDisplayMode={settings.bookmarkIconDisplayMode} />
        <CornerRadius cornerRadius={settings.cornerRadius} />
      </SectionContent>
    </Section>
  );
}
