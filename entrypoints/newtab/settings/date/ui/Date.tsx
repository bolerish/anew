import { useEffect, useState } from "react";
import { type DateSettings, dateStorage, getInitialDateSettings, updateDateSetting } from "~newtab/settings/date";
import { Switch } from "~newtab/shared/ui/switch";

import { Section, SectionContent, SectionHeader } from "../../ui/Section";
import { FormatSelect } from "./FormatSelect";

export function Date() {
  const [{ customDateFormat, dateFormat, showDate }, setDateSettings] = useState<DateSettings>(getInitialDateSettings);

  useEffect(() => {
    return dateStorage.watch(setDateSettings);
  }, []);

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
