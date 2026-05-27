import { useEffect, useState } from "react";

import { Section, SectionContent, SectionHeader } from "../ui/Section";
import { appearanceStorage, initAppearanceSettings, type AppearanceSettings } from "./index";
import { BookmarkIcon } from "./ui/BookmarkIcon";
import { CornerRadius } from "./ui/CornerRadius";
import { FontFamily } from "./ui/FontFamily";
import { FontSize } from "./ui/FontSize";
import { Theme } from "./ui/Theme";

export function Appearance() {
  const [settings, setSettings] = useState<AppearanceSettings>(initAppearanceSettings);

  useEffect(() => {
    return appearanceStorage.watch(setSettings);
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
