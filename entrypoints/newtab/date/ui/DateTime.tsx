import { colorVars, spacingVars, typo } from "@bolerish/tokens/semantic.stylex";
import * as stylex from "@stylexjs/stylex";
import { usePreferences } from "~shared/lib/preferences";

import {
  dateStorage,
  getInitialDateSettings,
  getInitialTimeSettings,
  timeStorage,
} from "~/entrypoints/newtab/settings/format";
import { useStorageValue } from "~/entrypoints/shared/hooks/useStorageValue";

import { formatCurrentDate, formatCurrentTime } from "../lib/format";
import { useCurrentDateTime } from "../model/useCurrentDateTime";

const styles = stylex.create({
  root: { minWidth: 0 },
  content: {
    display: "flex",
    alignItems: "center",
    flexWrap: "wrap",
    gap: spacingVars.space2,
    color: colorVars.fgSecondary,
    fontFamily: typo.fontFamilyHeading,
    fontSize: `calc(${typo.fontSizeSm} * var(--mds-heading-scale, 1))`,
    lineHeight: typo.lineHeightNormal,
  },
});

export function DateTime() {
  const { language } = usePreferences();
  const dateSettings = useStorageValue(dateStorage, getInitialDateSettings);
  const timeSettings = useStorageValue(timeStorage, getInitialTimeSettings);
  const currentDateTime = useCurrentDateTime();
  const formattedDate = dateSettings.showDate ? formatCurrentDate(currentDateTime, dateSettings, language) : null;
  const formattedTime = formatCurrentTime(currentDateTime, timeSettings, language);

  if (!formattedDate && !formattedTime) {
    return null;
  }

  return (
    <div {...stylex.props(styles.root)}>
      <div {...stylex.props(styles.content)}>
        {formattedDate ? <p>{formattedDate}</p> : null}
        {formattedDate && formattedTime ? <span aria-hidden="true">·</span> : null}
        {formattedTime ? <time dateTime={currentDateTime.toISOString()}>{formattedTime}</time> : null}
      </div>
    </div>
  );
}
