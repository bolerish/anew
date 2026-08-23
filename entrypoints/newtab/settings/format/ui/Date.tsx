import { Switch } from "~shared/ui/switch";

import { Section, SectionContent, SectionHeader } from "~/entrypoints/newtab/settings/ui/Section";
import { useStorageValue } from "~/entrypoints/shared/hooks/useStorageValue";

import { dateStorage, getInitialDateSettings, updateDateSetting } from "../model/date";
import { FormatSelect } from "./FormatSelect";

export function Date() {
  const { customDateFormat, dateFormat, showDate } = useStorageValue(dateStorage, getInitialDateSettings);

  return (
    <Section>
      <SectionHeader title="Date">
        <Switch
          checked={showDate}
          aria-label="Date"
          onCheckedChange={(checked) => void updateDateSetting("showDate", checked)}
        />
      </SectionHeader>
      <SectionContent>
        <FormatSelect
          customDateFormat={customDateFormat}
          dateFormat={dateFormat}
          disabled={!showDate}
          onCustomDateFormatChange={(value) => void updateDateSetting("customDateFormat", value)}
          onDateFormatChange={(value) => void updateDateSetting("dateFormat", value)}
        />
      </SectionContent>
    </Section>
  );
}
