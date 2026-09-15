import { useLanguage } from "~shared/lib/preferences";
import { Switch } from "~shared/ui/switch";

import { Section, SectionContent, SectionHeader } from "~/entrypoints/newtab/settings/ui/Section";
import { useStorageValue } from "~/entrypoints/shared/hooks/useStorageValue";

import { dateStorage, getInitialDateSettings, updateDateSetting } from "../model/date";
import { FormatSelect } from "./FormatSelect";

export function Date() {
  const UI_LANGUAGE = useLanguage();
  const { customDateFormat, dateFormat, showDate } = useStorageValue(dateStorage, getInitialDateSettings);

  return (
    <Section>
      <SectionHeader title={UI_LANGUAGE.settings.date}>
        <Switch
          checked={showDate}
          aria-label={UI_LANGUAGE.settings.date}
          onCheckedChange={(checked) => void updateDateSetting("showDate", checked)}
        />
      </SectionHeader>
      {showDate ? (
        <SectionContent>
          <FormatSelect
            customDateFormat={customDateFormat}
            dateFormat={dateFormat}
            onCustomDateFormatChange={(value) => void updateDateSetting("customDateFormat", value)}
            onDateFormatChange={(value) => void updateDateSetting("dateFormat", value)}
          />
        </SectionContent>
      ) : null}
    </Section>
  );
}
