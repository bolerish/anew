import * as stylex from "@stylexjs/stylex";
import { useState } from "react";
import { formatCurrentTime } from "~newtab/date/lib/format";
import { useStorageValue } from "~shared/hooks/useStorageValue";
import { useLanguage, usePreferences } from "~shared/lib/preferences";
import { Select, SelectTrigger, SelectValue, SelectPopup, SelectList, SelectItem } from "~shared/ui/select";
import { Switch } from "~shared/ui/switch";

import { Section, SectionContent, SectionHeader } from "../../ui/Section";
import { getInitialTimeSettings, timeStorage, updateTimeSetting, updateTimeSettings } from "../model/time";

const styles = stylex.create({
  fullWidth: { width: "100%" },
});

export function Time() {
  const UI_LANGUAGE = useLanguage();
  const { language } = usePreferences();
  const formats = [
    { value: "12h", timeFormat: "12h", showTimeSeconds: false },
    { value: "12h-seconds", timeFormat: "12h", showTimeSeconds: true },
    { value: "24h", timeFormat: "24h", showTimeSeconds: false },
    { value: "24h-seconds", timeFormat: "24h", showTimeSeconds: true },
  ] as const;
  const [previewTime, setPreviewTime] = useState(() => new Date());
  const { showTime, showTimeSeconds, timeFormat } = useStorageValue(timeStorage, getInitialTimeSettings);
  return (
    <Section>
      <SectionHeader title={UI_LANGUAGE.settings.time}>
        <Switch
          checked={showTime}
          aria-label={UI_LANGUAGE.settings.time}
          onCheckedChange={(checked) => void updateTimeSetting("showTime", checked)}
        />
      </SectionHeader>
      {showTime ? (
        <SectionContent>
          <Select
            onOpenChange={(open) => {
              if (open) setPreviewTime(new Date());
            }}
            value={`${timeFormat}${showTimeSeconds ? "-seconds" : ""}`}
            onValueChange={(value) => {
              const format = formats.find((format) => format.value === value);
              if (format)
                void updateTimeSettings({ timeFormat: format.timeFormat, showTimeSeconds: format.showTimeSeconds });
            }}
          >
            <SelectTrigger aria-label={UI_LANGUAGE.settings.timeFormat} xstyle={styles.fullWidth}>
              <SelectValue>
                {(value) =>
                  formatCurrentTime(
                    previewTime,
                    { ...(formats.find((format) => format.value === value) ?? formats[0]), showTime: true },
                    language,
                  )
                }
              </SelectValue>
            </SelectTrigger>
            <SelectPopup align="start" alignItemWithTrigger={false} side="bottom">
              <SelectList>
                {formats.map((format) => (
                  <SelectItem key={format.value} value={format.value}>
                    {formatCurrentTime(previewTime, { ...format, showTime: true }, language)}
                  </SelectItem>
                ))}
              </SelectList>
            </SelectPopup>
          </Select>
        </SectionContent>
      ) : null}
    </Section>
  );
}
