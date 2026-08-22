import { useEffect, useState } from "react";

import {
  dateStorage,
  getInitialDateSettings,
  getInitialTimeSettings,
  timeStorage,
  type DateSettings,
  type TimeSettings,
} from "~/entrypoints/newtab/settings/format";

import { formatCurrentDate, formatCurrentTime } from "../lib/format";
import { useCurrentDateTime } from "../model/useCurrentDateTime";

export function DateTime() {
  const [settings, setSettings] = useState<DateSettings & TimeSettings>(deriveInitialDateTimeSettings);
  const currentDateTime = useCurrentDateTime();
  const formattedDate = settings.showDate ? formatCurrentDate(currentDateTime, settings) : null;
  const formattedTime = formatCurrentTime(currentDateTime, settings);

  useEffect(() => {
    let isMounted = true;
    void Promise.all([dateStorage.getValue(), timeStorage.getValue()]).then(([dateSettings, timeSettings]) => {
      if (isMounted) setSettings({ ...dateSettings, ...timeSettings });
    });

    const unwatchDateSettings = dateStorage.watch((dateSettings) => {
      setSettings((currentSettings) => ({ ...currentSettings, ...dateSettings }));
    });
    const unwatchTimeSettings = timeStorage.watch((timeSettings) => {
      setSettings((currentSettings) => ({ ...currentSettings, ...timeSettings }));
    });

    return () => {
      isMounted = false;
      unwatchDateSettings();
      unwatchTimeSettings();
    };
  }, []);

  if (!formattedDate && !formattedTime) {
    return null;
  }

  return (
    <div className="col-start-1 row-start-1 flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 overflow-hidden">
      <div className="text-mds-content flex min-w-0 items-center gap-1 whitespace-nowrap">
        {formattedDate ? <p className="min-w-0">{formattedDate}</p> : null}
        {formattedDate && formattedTime ? <span aria-hidden="true">·</span> : null}
        {formattedTime ? <time dateTime={currentDateTime.toISOString()}>{formattedTime}</time> : null}
      </div>
    </div>
  );
}

function deriveInitialDateTimeSettings(): DateSettings & TimeSettings {
  return {
    ...getInitialDateSettings(),
    ...getInitialTimeSettings(),
  };
}
