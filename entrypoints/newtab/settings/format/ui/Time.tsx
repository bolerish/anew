import { useEffect, useState } from "react";
import { Section, SectionContent, SectionHeader, SectionItem } from "~newtab/settings/ui/SettingsSection";
import { UI_LANGUAGE } from "~shared/lib/language";
import { Button } from "~shared/ui/button";
import { Switch } from "~shared/ui/switch";
import { ToggleGroup, ToggleGroupItem } from "~shared/ui/toggle-group";

import {
  getInitialTimeSettings,
  timeStorage,
  type TimeFormat,
  type TimeSettings,
  updateTimeSetting,
} from "../model/time";

export function Time() {
  const [{ showTime, showTimeSeconds, timeFormat }, setTimeSettings] = useState<TimeSettings>(getInitialTimeSettings);

  useEffect(() => {
    let isMounted = true;
    void timeStorage.getValue().then((settings) => {
      if (isMounted) setTimeSettings(settings);
    });

    const unwatchTime = timeStorage.watch(setTimeSettings);

    return () => {
      isMounted = false;
      unwatchTime();
    };
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
            aria-label="Time format"
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
