import { useEffect, useState } from "react";
import { Section, SectionContent, SectionHeader } from "~newtab/settings/ui/SettingsSection";
import { Switch } from "~shared/ui/switch";

import { type DateSettings, dateStorage, getInitialDateSettings, updateDateSetting } from "../model/date";
import { FormatSelect } from "./FormatSelect";

export function Date() {
  const [{ customDateFormat, dateFormat, showDate }, setDateSettings] = useState<DateSettings>(getInitialDateSettings);

  useEffect(() => {
    let isMounted = true;
    void dateStorage.getValue().then((settings) => {
      if (isMounted) setDateSettings(settings);
    });

    const unwatchDate = dateStorage.watch(setDateSettings);

    return () => {
      isMounted = false;
      unwatchDate();
    };
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
