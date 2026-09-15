/* oxlint-disable jsx-a11y/prefer-tag-over-role -- This labeled status dot is CSS, not an image resource. */
import * as stylex from "@stylexjs/stylex";
import { usePreferences } from "~shared/lib/preferences";
import { updatesMessages } from "~shared/locales/updates";
import { colorVars, radiusVars, spacingVars } from "~shared/styles/semantic.stylex";

import { useUnreadUpdates } from "../model/updates";

const styles = stylex.create({
  dot: {
    display: "inline-block",
    width: `calc(${spacingVars.space1} + ${spacingVars.space0_5})`,
    height: `calc(${spacingVars.space1} + ${spacingVars.space0_5})`,
    flexShrink: 0,
    borderRadius: radiusVars.full,
    backgroundColor: colorVars.bgActionPrimary,
  },
  floating: { position: "absolute", top: spacingVars.space0_5, right: spacingVars.space0_5 },
});

export function UpdateNotice({ floating = false }: { floating?: boolean }) {
  const unread = useUnreadUpdates();
  const { language } = usePreferences();
  if (!unread) return null;
  return (
    <span
      role="img"
      aria-label={updatesMessages[language].unread}
      {...stylex.props(styles.dot, floating && styles.floating)}
    />
  );
}
