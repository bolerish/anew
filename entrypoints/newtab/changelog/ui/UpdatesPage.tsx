import { CaretLeftIcon } from "@phosphor-icons/react";
import * as stylex from "@stylexjs/stylex";
import { useLanguage, usePreferences } from "~shared/lib/preferences";
import { updatesMessages } from "~shared/locales/updates";
import { colorVars, spacingVars, typographyVars } from "~shared/styles/semantic.stylex";
import { Badge } from "~shared/ui/badge";
import { Button } from "~shared/ui/button";
import {
  Timeline,
  TimelineItem,
  TimelineIndicator,
  TimelineContent,
  TimelineTitle,
  TimelineTime,
} from "~shared/ui/timeline";

import { contentLayout } from "../../layout.stylex";
import { getUpdateEntries } from "../model/updates";
const styles = stylex.create({
  page: {
    flexShrink: 0,
    minWidth: 0,
    color: colorVars.fgPrimary,
    fontFamily: typographyVars.fontFamilyBody,
  },
  header: {
    position: "sticky",
    top: 0,
    zIndex: 1,
    backgroundColor: colorVars.bgSurface,
    paddingBlock: spacingVars.space3,
    display: "flex",
    alignItems: "center",
    gap: spacingVars.space3,
    width: "100%",
    minWidth: 0,
  },
  back: { flexShrink: 0 },
  title: {
    fontSize: typographyVars.fontSizeSm,
    margin: 0,
    minWidth: 0,
    lineHeight: typographyVars.lineHeightNormal,
    overflowWrap: "anywhere",
  },
  content: {
    display: "grid",
    gap: spacingVars.space4,
    marginBlock: spacingVars.space6,
    paddingInline: 14,
    paddingBlock: 1,
  },
  version: { display: "flex", alignItems: "center", gap: spacingVars.space2 },
  releaseSection: { display: "grid", gap: spacingVars.space2, marginTop: spacingVars.space4 },
  releaseHeading: { margin: 0, fontSize: typographyVars.fontSizeSm, fontWeight: typographyVars.fontWeightSemibold },
  sectionTitle: { fontSize: typographyVars.fontSizeSm, fontWeight: typographyVars.fontWeightSemibold, margin: 0 },
  list: { paddingInlineStart: spacingVars.space5, margin: 0, display: "grid", gap: spacingVars.space2 },
  text: { whiteSpace: "pre-wrap", overflowWrap: "anywhere", lineHeight: typographyVars.lineHeightNormal },
});
export function UpdatesPage({ onBack }: { onBack?: () => void }) {
  const { width, language } = usePreferences();
  const copy = updatesMessages[language];
  const entries = getUpdateEntries(language);
  const dateFormat = new Intl.DateTimeFormat(language, { dateStyle: "long", timeZone: "UTC" });
  const { settings: labels } = useLanguage();
  return (
    <div {...stylex.props(styles.page, contentLayout.page, contentLayout.width(width))}>
      <header {...stylex.props(styles.header)}>
        {onBack ? (
          <Button
            variant="ghost"
            size="icon-sm"
            xstyle={styles.back}
            aria-label={labels.back}
            title={labels.back}
            onClick={onBack}
          >
            <CaretLeftIcon aria-hidden="true" />
          </Button>
        ) : null}
        <h1 {...stylex.props(styles.title)}>{labels.updates}</h1>
      </header>
      <div {...stylex.props(styles.content)}>
        <Timeline>
          {entries.map((entry, index) => (
            <TimelineItem key={entry.version}>
              <TimelineIndicator />
              <TimelineContent>
                <TimelineTitle>
                  <div {...stylex.props(styles.version)}>
                    <h2 {...stylex.props(styles.sectionTitle)}>{entry.version}</h2>
                    {index === 0 ? <Badge variant="primary">{copy.latest}</Badge> : null}
                  </div>
                </TimelineTitle>
                <TimelineTime dateTime={entry.date}>
                  {dateFormat.format(new Date(`${entry.date}T00:00:00Z`))}
                </TimelineTime>
                {entry.sections.map((section) => (
                  <div key={section.title} {...stylex.props(styles.releaseSection)}>
                    {section.title ? <h3 {...stylex.props(styles.releaseHeading)}>{section.title}</h3> : null}
                    <ul {...stylex.props(styles.list)}>
                      {section.items.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </TimelineContent>
            </TimelineItem>
          ))}
        </Timeline>
      </div>
    </div>
  );
}
