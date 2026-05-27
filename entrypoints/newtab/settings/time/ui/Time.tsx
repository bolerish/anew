import { useEffect, useState } from "react";
import {
  getInitialTimeSettings,
  timeStorage,
  type TimeFormat,
  type TimeSettings,
  updateTimeSetting,
} from "~newtab/settings/time";
import { UI_LANGUAGE } from "~newtab/shared/lib/language";
import { Button } from "~newtab/shared/ui/button";
import { ToggleGroup, ToggleGroupItem } from "~newtab/shared/ui/toggle-group";

import { Switch } from "../../../shared/ui/switch";
import { Section, SectionHeader, SectionContent, SectionItem } from "../../ui/Section";

export function Time() {
  const [{ showTime, showTimeSeconds, timeFormat }, setTimeSettings] = useState<TimeSettings>(getInitialTimeSettings);

  useEffect(() => {
    return timeStorage.watch(setTimeSettings);
  }, []);

  return (
    <Section>
      <SectionHeader title="Time">
        <Switch
          checked={showTime}
          aria-label="Time"
          onCheckedChange={(checked) => void updateTimeSetting("showTime", checked)}
        />
      </SectionHeader>
      <SectionContent>
        <SectionItem description={UI_LANGUAGE.settings.time.seconds.description} disabled={!showTime} label="Seconds">
          <Button
            aria-pressed={showTimeSeconds}
            disabled={!showTime}
            size="sm"
            type="button"
            variant="outline"
            onClick={() => void updateTimeSetting("showTimeSeconds", !showTimeSeconds)}
            className="text-mds-setting-item disabled:border-border disabled:bg-muted/40 disabled:text-muted-foreground disabled:aria-pressed:border-primary/30 disabled:aria-pressed:bg-primary/30 disabled:aria-pressed:text-primary dark:disabled:aria-pressed:bg-primary/25 dark:disabled:aria-pressed:text-primary-foreground h-7 w-full disabled:opacity-100"
          >
            Seconds
          </Button>
        </SectionItem>
        <SectionItem disabled={!showTime} label="Time format">
          <ToggleGroup
            size="sm"
            spacing={0}
            type="single"
            variant="outline"
            disabled={!showTime}
            value={timeFormat}
            style={{ gridTemplateColumns: "repeat(2, minmax(0, 1fr))" }}
            onValueChange={(value) => {
              if (value) {
                void updateTimeSetting("timeFormat", value as TimeFormat);
              }
            }}
            className="grid h-7 w-full"
          >
            <ToggleGroupItem value="12h">12h</ToggleGroupItem>
            <ToggleGroupItem value="24h">24h</ToggleGroupItem>
          </ToggleGroup>
        </SectionItem>
      </SectionContent>
    </Section>
  );
}
