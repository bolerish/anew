import {
  CaretRightIcon,
  GearSixIcon,
  XIcon,
  PaintBrushIcon,
  SlidersHorizontalIcon,
  WrenchIcon,
} from "@phosphor-icons/react";
import * as stylex from "@stylexjs/stylex";
import { lazy, Suspense, useEffect, type Dispatch, type SetStateAction, type ReactNode } from "react";
import { useLanguage, usePreferences } from "~shared/lib/preferences";
import { weatherMessages } from "~shared/locales/weather";
import { colorVars, sizeVars, spacingVars, typographyVars } from "~shared/styles/semantic.stylex";
import { Badge } from "~shared/ui/badge";
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbPage, BreadcrumbSeparator } from "~shared/ui/breadcrumb";
import { Button } from "~shared/ui/button";
import { Dialog, DialogContent, DialogTitle } from "~shared/ui/dialog";
import { Drawer, DrawerContent, DrawerTitle, DrawerTrigger, DrawerClose } from "~shared/ui/drawer";
import { Separator } from "~shared/ui/separator";
import { Stack } from "~shared/ui/stack/Stack";
import { useStack } from "~shared/ui/stack/useStack";
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from "~shared/ui/tooltip";

import { version } from "../../../../package.json";
import { useUpdatesPage } from "../../changelog/model/useUpdatesPage";
import { UpdateNotice } from "../../changelog/ui/UpdateNotice";
import { WeatherSettings } from "../../weather/ui/WeatherSettings";
import { CornerRadiusField } from "../appearance/ui/CornerRadius";
import { FontField } from "../appearance/ui/FontField";
import { ThemeSelect } from "../appearance/ui/ThemeSelect";
import { Date, Time } from "../format";
import { Shortcut } from "../shortcut";
import { LanguageSetting, EngineSetting, MotionSetting, WidthSetting, FolderDividersSetting } from "./Preferences";

const UpdatesPage = lazy(() =>
  import("~newtab/changelog/ui/UpdatesPage").then((module) => ({ default: module.UpdatesPage })),
);
const styles = stylex.create({
  reader: {
    position: "fixed",
    inset: 0,
    width: "100vw",
    height: "100dvh",
    maxWidth: "none",
    maxHeight: "none",
    borderWidth: 0,
    borderRadius: 0,
    backgroundColor: colorVars.bgSurface,
    padding: 0,
    gap: 0,
    justifyContent: "flex-start",
    ":is([data-starting-style], [data-ending-style])": { opacity: 0, transform: "none" },
  },
  readerBack: { position: "sticky", top: 0, alignSelf: "flex-start", margin: spacingVars.space4 },

  heading: {
    color: colorVars.fgPrimary,
    fontWeight: typographyVars.fontWeightSemibold,
    fontFamily: typographyVars.fontFamilyHeading,
    fontSize: `calc(${typographyVars.fontSizeSm} * var(--mds-heading-scale, 1))`,
  },
  current: {
    display: "inline-flex",
    alignItems: "center",
    height: sizeVars.controlSm,
    paddingInline: spacingVars.space3,
    borderWidth: sizeVars.stroke,
    borderStyle: "solid",
    borderColor: "transparent",
    lineHeight: typographyVars.lineHeightTight,
  },
  hiddenTitle: {
    position: "absolute",
    width: 1,
    height: 1,
    overflow: "hidden",
    clipPath: "inset(50%)",
    whiteSpace: "nowrap",
  },
  ancestor: { color: colorVars.fgSecondary, fontWeight: typographyVars.fontWeightRegular },
  screen: {
    flexGrow: 1,
    flexShrink: 0,
    "--settings-label-color": colorVars.fgSecondary,
    "--settings-control-width": "100%",
    "--settings-toggle-flex": 1,
    display: "flex",
    flexDirection: "column",
    paddingBlock: spacingVars.space6,
    paddingInline: `calc(${spacingVars.space6} + ${spacingVars.space4})`,
    gap: spacingVars.space6,
  },
  header: {
    display: "grid",
    gridTemplateColumns: `minmax(0, 1fr) ${sizeVars.controlSm}`,
    alignItems: "center",
    gap: spacingVars.space2,
    height: sizeVars.controlLg,
  },
  content: {
    backgroundColor: colorVars.bgSurface,
    overflowY: "auto",
    scrollbarGutter: "stable",
  },
  close: { gridColumn: 2 },
  breadcrumbBack: { marginInlineStart: `calc(${spacingVars.space3} * -1)` },
  linkLabel: { display: "inline-flex", alignItems: "center", gap: spacingVars.space2 },

  navigation: { marginInline: `calc(${spacingVars.space4} * -1)` },
  navigationList: {
    display: "grid",
    gap: 0,
    paddingBlock: spacingVars.space1,
    marginInlineStart: `calc(${sizeVars.iconMd} + ${spacingVars.space2})`,
  },
  sectionIcon: { width: sizeVars.iconMd, height: sizeVars.iconMd },
  sectionHeading: {
    display: "flex",
    alignItems: "center",
    gap: spacingVars.space2,
    color: colorVars.fgSecondary,
    fontWeight: typographyVars.fontWeightSemibold,
    fontFamily: typographyVars.fontFamilyHeading,
    fontSize: `calc(${typographyVars.fontSizeSm} * var(--mds-heading-scale, 1))`,
    marginBottom: spacingVars.space2,
  },
  notes: {
    whiteSpace: "pre-wrap",
    overflowWrap: "anywhere",
    fontFamily: "inherit",
    fontSize: typographyVars.fontSizeSm,
    color: colorVars.fgSecondary,
  },
  links: {
    display: "flex",
    flexWrap: "wrap",
    gap: spacingVars.space3,
    color: colorVars.fgSecondary,
    fontSize: typographyVars.fontSizeXs,
  },
  link: { color: "inherit", textDecoration: "none" },
  home: { display: "grid", gap: spacingVars.space6 },
});

type SettingsPage = "theme" | "text" | "layout" | "dateTime" | "search" | "language" | "motion" | "weather";

type SettingProps = {
  xstyle?: import("~shared/ui/control-layout").ControlLayoutStyles;
  open: boolean;
  onOpenChange: Dispatch<SetStateAction<boolean>>;
};

export function Setting({ open, onOpenChange, xstyle }: SettingProps) {
  const UI_LANGUAGE = useLanguage();
  return (
    <Drawer open={open} onOpenChange={onOpenChange} swipeDirection="right" modal={false} overlay="none">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger
            render={
              <DrawerTrigger
                aria-label={UI_LANGUAGE.settings.settings}
                render={
                  <Button data-settings-trigger="" variant="outline" size="icon-sm" xstyle={xstyle}>
                    <GearSixIcon aria-hidden="true" />
                    <UpdateNotice floating />
                  </Button>
                }
              />
            }
          />
          <TooltipContent>{UI_LANGUAGE.settings.settings}</TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <DrawerContent xstyle={styles.content}>
        <Stack>
          <Screens />
        </Stack>
      </DrawerContent>
    </Drawer>
  );
}

function Screens() {
  const UI_LANGUAGE = useLanguage();
  const stack = useStack<Record<"home" | SettingsPage, Record<string, never>>>({
    id: "settings-stack",
    initial: { step: "home", context: {} },
  });
  useEffect(() => {
    function restoreSettings() {
      const index = window.history.state?.minSettingsIndex ?? 0;
      if (Number.isInteger(index) && index !== stack.index) void stack.history.go(index - stack.index);
    }
    window.addEventListener("popstate", restoreSettings);
    return () => window.removeEventListener("popstate", restoreSettings);
  }, [stack.index, stack.history]);
  function navigateSettings(page: SettingsPage) {
    window.history.pushState({ ...window.history.state, minSettingsIndex: stack.index + 1 }, "");
    void stack.history.push(page, {});
  }
  const labels = UI_LANGUAGE.settings;
  const titles = {
    home: labels.settings,
    theme: labels.theme,
    text: labels.text,
    layout: labels.layout,
    language: labels.language,
    motion: labels.motion,
    weather: weatherMessages[usePreferences().language].title,
    dateTime: labels.dateTime,
    search: UI_LANGUAGE.search.label,
  };

  return (
    <div {...stylex.props(styles.screen)}>
      <div {...stylex.props(styles.header)}>
        <div {...stylex.props(styles.hiddenTitle)}>
          <DrawerTitle>{titles[stack.step]}</DrawerTitle>
        </div>
        <Breadcrumb aria-label={labels.settings}>
          <BreadcrumbList>
            {stack.index > 0 ? (
              <>
                <BreadcrumbItem>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    xstyle={styles.breadcrumbBack}
                    onClick={() => window.history.back()}
                    aria-label={labels.back}
                  >
                    <span {...stylex.props(styles.heading, styles.ancestor)}>{labels.settings}</span>
                  </Button>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
              </>
            ) : null}
            <BreadcrumbItem>
              <BreadcrumbPage xstyle={[styles.current, stack.index === 0 && styles.breadcrumbBack]}>
                <span {...stylex.props(styles.heading)}>{titles[stack.step]}</span>
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <DrawerClose
          aria-label={labels.close}
          render={
            <Button variant="ghost" size="icon-sm" xstyle={styles.close}>
              <XIcon aria-hidden="true" />
            </Button>
          }
        />
      </div>

      <Separator />
      <stack.Render
        home={() => <SettingsHome onNavigate={navigateSettings} />}
        dateTime={() => (
          <div {...stylex.props(styles.home)}>
            <Date />
            <Time />
          </div>
        )}
        theme={() => <ThemeSelect />}
        text={() => <FontField />}
        layout={() => (
          <div {...stylex.props(styles.home)}>
            <WidthSetting />
            <CornerRadiusField />
            <FolderDividersSetting />
            <Shortcut />
          </div>
        )}
        language={() => <LanguageSetting />}
        motion={() => <MotionSetting />}
        weather={() => <WeatherSettings />}
        search={() => <EngineSetting />}
      />
    </div>
  );
}

function SettingsHome({ onNavigate }: { onNavigate: (page: SettingsPage) => void }) {
  const weatherLabel = weatherMessages[usePreferences().language].title;
  const { settings: labels, search } = useLanguage();
  const updates = useUpdatesPage();

  const sections: { title: string; icon: ReactNode; items: [SettingsPage, string][] }[] = [
    {
      title: labels.appearance,
      icon: <PaintBrushIcon aria-hidden="true" {...stylex.props(styles.sectionIcon)} />,
      items: [
        ["theme", labels.theme],
        ["text", labels.text],
        ["layout", labels.layout],
      ],
    },
    {
      title: labels.tools,
      icon: <WrenchIcon aria-hidden="true" {...stylex.props(styles.sectionIcon)} />,
      items: [
        ["dateTime", labels.dateTime],
        ["weather", weatherLabel],
        ["search", search.label],
      ],
    },
    {
      title: labels.usage,
      icon: <SlidersHorizontalIcon aria-hidden="true" {...stylex.props(styles.sectionIcon)} />,
      items: [
        ["language", labels.language],
        ["motion", labels.motion],
      ],
    },
  ];
  return (
    <div {...stylex.props(styles.home)}>
      {sections.map(({ title, icon, items }) => (
        <section key={title}>
          <h2 {...stylex.props(styles.sectionHeading)}>
            {icon} {title}
          </h2>
          <div {...stylex.props(styles.navigationList)}>
            {items.map(([page, label]) => (
              <Button
                key={page}
                type="button"
                variant="ghost"
                align="space-between"
                xstyle={styles.navigation}
                onClick={() => onNavigate(page)}
              >
                {label}
                <CaretRightIcon aria-hidden="true" />
              </Button>
            ))}
          </div>
        </section>
      ))}
      <Dialog
        open={updates.isOpen}
        onOpenChange={(open) => {
          if (!open) updates.close();
        }}
      >
        <DialogContent xstyle={styles.reader} showCloseButton={false}>
          <div {...stylex.props(styles.hiddenTitle)}>
            <DialogTitle>{labels.updates}</DialogTitle>
          </div>
          <Suspense fallback={<output>{labels.updates}</output>}>
            <UpdatesPage onBack={updates.close} />
          </Suspense>
        </DialogContent>
      </Dialog>
      <Separator />
      <div {...stylex.props(styles.navigationList)}>
        <Button type="button" variant="ghost" align="space-between" xstyle={styles.navigation} onClick={updates.open}>
          <span {...stylex.props(styles.linkLabel)}>
            {labels.updates}
            <Badge variant="secondary">{version}</Badge>
            <UpdateNotice />
          </span>
          <CaretRightIcon aria-hidden="true" />
        </Button>
      </div>
    </div>
  );
}
