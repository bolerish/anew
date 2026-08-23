import {
  dateStorage,
  getInitialDateSettings,
  getInitialTimeSettings,
  timeStorage,
} from "~/entrypoints/newtab/settings/format";
import { useStorageValue } from "~/entrypoints/shared/hooks/useStorageValue";

import { formatCurrentDate, formatCurrentTime } from "../lib/format";
import { useCurrentDateTime } from "../model/useCurrentDateTime";

export function DateTime() {
  const dateSettings = useStorageValue(dateStorage, getInitialDateSettings);
  const timeSettings = useStorageValue(timeStorage, getInitialTimeSettings);
  const currentDateTime = useCurrentDateTime();
  const formattedDate = dateSettings.showDate ? formatCurrentDate(currentDateTime, dateSettings) : null;
  const formattedTime = formatCurrentTime(currentDateTime, timeSettings);

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
