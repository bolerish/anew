import { CheckIcon, XIcon, ArrowLeftIcon, ArrowRightIcon } from "@phosphor-icons/react";
import * as stylex from "@stylexjs/stylex";
import { useEffect, useLayoutEffect, useState } from "react";
import { DateTime } from "~newtab/date";
import { SearchBar, useSearch } from "~newtab/search";
import { useLanguage, usePreferences } from "~shared/lib/preferences";
import { useThemeSync } from "~shared/lib/theme";
import {
  colorVars,
  spacingVars,
  typographyVars,
  sizeVars,
  motionVars,
  shadowVars,
  radiusVars,
  layerVars,
} from "~shared/styles/semantic.stylex";
import { Badge } from "~shared/ui/badge";
import { Banner, BannerDescription } from "~shared/ui/banner";
import { Button } from "~shared/ui/button";
import { Kbd, KbdGroup } from "~shared/ui/kbd";
import { Separator } from "~shared/ui/separator";
import { Toaster } from "~shared/ui/toast";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "~shared/ui/tooltip";

import { Bookmark, LocationPicker, useFolders } from "~/entrypoints/newtab/bookmark";
import { useStorageValue } from "~/entrypoints/shared/hooks/useStorageValue";

import { undoEditing, redoEditing } from "./bookmark/model/edit-session";
import { useEditMode } from "./bookmark/model/useEditMode";
import { contentLayout } from "./layout.stylex";
import { appearanceStorage, getInitialAppearanceSettings } from "./settings/appearance";
import {
  bookmarkSettingsStorage,
  getInitialBookmarkSettings,
  sanitizeBookmarkSettings,
} from "./settings/bookmark/model/settings";
import { getInitialShortcutSettings, shortcutStorage } from "./settings/shortcut";
import { Setting } from "./settings/ui/Setting";
import { Weather } from "./weather/ui/Weather";

const editPulse = stylex.keyframes({
  "0%": { opacity: 0, filter: "blur(0.75rem)" },
  "30%": { opacity: 0.8, filter: "blur(0.25rem)" },
  "100%": { opacity: 0, filter: "blur(1rem)" },
});
const styles = stylex.create({
  skip: {
    position: "fixed",
    top: 0,
    left: 0,
    zIndex: layerVars.popup,
    padding: spacingVars.space3,
    backgroundColor: colorVars.bgSurface,
    color: colorVars.fgPrimary,
    transform: { default: "translateY(-100%)", ":focus": "translateY(0)" },
  },
  layout: {
    paddingRight: 0,
    transitionProperty: "padding-right",
    transitionDuration: motionVars.durationSlow,
    transitionTimingFunction: motionVars.easingEnter,
    ':is([data-motion-reduced="true"] *)': { transitionDuration: motionVars.durationInstant },
  },
  drawerOpen: { paddingRight: { default: 0, "@media (min-width: 900px)": `min(75vw, ${sizeVars.contentSm})` } },
  root: {
    marginInline: "auto",
    width: "100%",
    maxWidth: "72rem",
    height: "100dvh",
    display: "flex",
    flexDirection: "column",
    paddingBlock: spacingVars.space6,
  },
  headerInfo: {
    display: "flex",
    alignItems: "center",
    flexWrap: "wrap",
    gap: spacingVars.space3,
    justifyContent: { default: "flex-start", "@media (width < 600px)": "flex-end" },
    width: { default: "auto", "@media (width < 600px)": "100%" },
  },
  header: {
    display: "flex",
    alignItems: "center",
    flexWrap: "wrap",
    gap: spacingVars.space3,
    marginBottom: spacingVars.space6,
    paddingInline: spacingVars.space4,
  },
  editFrame: {
    position: "fixed",
    inset: 0,
    pointerEvents: "none",
    zIndex: layerVars.modalBackdrop,
    border: `${sizeVars.stroke} solid transparent`,
    opacity: 0,
    transition: "opacity 160ms ease",
    ':is([data-motion-reduced="true"] *)': { transition: "none", transform: "none" },
  },
  editFrameActive: {
    borderColor: colorVars.fgSecondary,
    borderWidth: spacingVars.space1,
    boxShadow: `inset 0 0 4rem 0.5rem color-mix(in srgb, ${colorVars.fgSecondary} 45%, transparent)`,
    animationName: editPulse,
    animationDuration: "1000ms",
    animationTimingFunction: motionVars.easingStandard,
    animationFillMode: "both",
    ':is([data-motion-reduced="true"] *)': { animationName: "none", opacity: 0 },
  },
  editMessage: { color: colorVars.fgSecondary, fontSize: typographyVars.fontSizeXs },
  searchRow: { display: "flex", alignItems: "center", flexWrap: "wrap", gap: spacingVars.space2 },
  search: { flex: 1, minWidth: "12rem" },
  location: { maxWidth: "100%", marginInlineStart: "auto" },
  editMenubar: {
    transform: "translateY(12px)",
    position: "fixed",
    bottom: `max(5dvh, ${spacingVars.space6})`,
    left: "50%",
    translate: "-50% 0",
    zIndex: layerVars.popup,
    width: "max-content",
    maxWidth: `calc(100vw - ${spacingVars.space4} * 2)`,
    padding: spacingVars.space1,
    backgroundColor: colorVars.bgRaised,
    borderWidth: sizeVars.stroke,
    borderStyle: "solid",
    borderColor: colorVars.strokeDefault,
    borderRadius: radiusVars.full,
    boxShadow: shadowVars.floating,
    fontSize: typographyVars.fontSizeXs,
    display: "flex",
    alignItems: "center",
    gap: spacingVars.space2,
    opacity: 0,
    visibility: "hidden",
    pointerEvents: "none",
    transitionProperty: "opacity, transform, visibility",
    transitionDuration: motionVars.durationSlow,
    transitionTimingFunction: motionVars.easingStandard,
    ':is([data-motion-reduced="true"] *)': { transition: "none", transform: "none" },
  },
  editMenubarDivider: { alignSelf: "center", height: sizeVars.iconMd, minHeight: 0 },
  editMenubarOpen: { transform: "translateY(0)", opacity: 1, visibility: "visible", pointerEvents: "auto" },
  editMenubarGroup: { display: "flex", alignItems: "center", gap: spacingVars.space1 },
  editMenubarMessage: {
    position: "absolute",
    bottom: "calc(100% + 8px)",
    left: 0,
    right: 0,
    backgroundColor: colorVars.bgRaised,
    borderColor: colorVars.strokeDefault,
    borderStyle: "solid",
    borderWidth: sizeVars.stroke,
    boxShadow: shadowVars.floating,
  },
  hiddenTitle: {
    position: "absolute",
    width: 1,
    height: 1,
    overflow: "hidden",
    clipPath: "inset(50%)",
    whiteSpace: "nowrap",
  },
  footer: { padding: spacingVars.space4, flexShrink: 0 },

  footerRow: {
    position: "relative",
    display: "grid",
    alignItems: "center",
    justifyItems: "end",
    minHeight: sizeVars.controlLg,
  },
  footerControls: {
    display: "flex",
    width: "100%",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: spacingVars.space4,
  },
  hints: {
    marginInlineEnd: "auto",
    display: { default: "none", "@media (min-width: 700px)": "flex" },
    flexWrap: "wrap",
    justifyContent: "flex-start",
    gap: spacingVars.space4,
    color: colorVars.fgSecondary,
    fontSize: typographyVars.fontSizeXs,
  },
  hideHints: { visibility: "hidden", pointerEvents: "none" },
  hint: { display: "inline-flex", alignItems: "center", gap: spacingVars.space2 },
});

type ShortcutHintProps = {
  keys: string[];
  label: string;
};

export default function App() {
  useThemeSync();
  const UI_LANGUAGE = useLanguage();
  const preferences = usePreferences();
  useLayoutEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => {
      document.documentElement.dataset.motionReduced = String(
        preferences.motion === "off" || (preferences.motion === "system" && media.matches),
      );
    };
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, [preferences.motion]);
  useEffect(() => {
    document.documentElement.lang = preferences.language;
  }, [preferences.language]);
  const { folders, locations, selectedLocationId, loadBookmarks, setSelectedLocation } = useFolders();
  const search = useSearch(folders);
  const selectedLocation = locations.find((location) => location.id === selectedLocationId);
  const appearanceSettings = useStorageValue(appearanceStorage, getInitialAppearanceSettings);
  const storedBookmarkSettings = sanitizeBookmarkSettings(
    useStorageValue(bookmarkSettingsStorage, getInitialBookmarkSettings),
  );
  const shortcutSettings = useStorageValue(shortcutStorage, getInitialShortcutSettings);

  const [open, setOpen] = useState(false);
  const { session, hasDraft, editMessage, finishEditing, discardEditing } = useEditMode({
    open,
    setOpen,
    settings: storedBookmarkSettings,
    loadBookmarks,
  });
  const isEditMode = session.active;
  const canEditBookmarks = isEditMode && !session.busy && !session.failed;
  const isToolbarBlocked = session.busy || hasDraft;
  const hasChangesToSave = session.canUndo || session.failed;
  const bookmarkSettings = session.draft?.settings ?? storedBookmarkSettings;

  return (
    <div {...stylex.props(styles.layout, open && styles.drawerOpen)}>
      <div aria-hidden="true" {...stylex.props(styles.editFrame, isEditMode && styles.editFrameActive)} />
      <a href="#bookmark-content" {...stylex.props(styles.skip)}>
        {UI_LANGUAGE.bookmark.skipToBookmarks}
      </a>
      <main {...stylex.props(styles.root, contentLayout.page, contentLayout.width(preferences.width))}>
        <Toaster
          position="top-right"
          closeLabel={UI_LANGUAGE.feedback.close}
          clearAllProps={{ children: UI_LANGUAGE.feedback.clearAll }}
        />
        <header {...stylex.props(styles.header)}>
          <h1 {...stylex.props(styles.hiddenTitle)}>{UI_LANGUAGE.settings.bookmarks}</h1>
          <div {...stylex.props(styles.headerInfo)}>
            <DateTime />
            <Weather />
          </div>
          <div {...stylex.props(styles.location)}>
            {locations.length > 1 ? (
              <LocationPicker
                locations={locations}
                selectedLocationId={selectedLocationId}
                onLocationChange={setSelectedLocation}
                size="sm"
              />
            ) : null}
          </div>
        </header>
        {preferences.searchEnabled ? (
          <div {...stylex.props(styles.searchRow)}>
            <div {...stylex.props(styles.search)}>
              <SearchBar
                results={search.visibleFolders.flatMap((folder) => folder.items)}
                onSearch={search.search}
                onValueChange={search.setQuery}
                value={search.query}
              />
            </div>
          </div>
        ) : null}
        <Bookmark
          disabled={session.busy || session.failed}
          key={String(isEditMode)}
          isEditMode={canEditBookmarks}
          settings={bookmarkSettings}
          bookmarkIconMode={appearanceSettings.bookmarkIconDisplayMode}
          folders={folders}
          isSearchActive={false}
          rootTitle={selectedLocation?.title ?? null}
          selectedLocationId={selectedLocationId}
          visibleFolders={folders}
          onBookmarksChange={loadBookmarks}
        />
        <footer {...stylex.props(styles.footer)}>
          <div {...stylex.props(styles.footerRow)}>
            <div
              role="toolbar"
              aria-label={UI_LANGUAGE.bookmark.editMode}
              data-edit-toolbar=""
              inert={!isEditMode}
              {...stylex.props(styles.editMenubar, isEditMode && styles.editMenubarOpen)}
            >
              <Badge variant="primary">{UI_LANGUAGE.bookmark.editMode}</Badge>
              <Separator orientation="vertical" xstyle={styles.editMenubarDivider} />
              <TooltipProvider>
                <div {...stylex.props(styles.editMenubarGroup)}>
                  <Tooltip>
                    <TooltipTrigger
                      render={
                        <Button
                          size="icon-sm"
                          shape="circle"
                          variant="ghost"
                          aria-label={UI_LANGUAGE.bookmark.undo}
                          disabled={!session.canUndo || isToolbarBlocked}
                          onClick={undoEditing}
                        >
                          <ArrowLeftIcon aria-hidden="true" />
                        </Button>
                      }
                    />
                    <TooltipContent>{UI_LANGUAGE.bookmark.undo}</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger
                      render={
                        <Button
                          size="icon-sm"
                          shape="circle"
                          variant="ghost"
                          aria-label={UI_LANGUAGE.bookmark.redo}
                          disabled={!session.canRedo || isToolbarBlocked}
                          onClick={redoEditing}
                        >
                          <ArrowRightIcon aria-hidden="true" />
                        </Button>
                      }
                    />
                    <TooltipContent>{UI_LANGUAGE.bookmark.redo}</TooltipContent>
                  </Tooltip>
                </div>
                <Separator orientation="vertical" xstyle={styles.editMenubarDivider} />
                <div {...stylex.props(styles.editMenubarGroup)}>
                  <Tooltip>
                    <TooltipTrigger
                      render={
                        <Button
                          size="icon-sm"
                          shape="circle"
                          variant="ghost"
                          aria-label={UI_LANGUAGE.bookmark.save}
                          disabled={isToolbarBlocked || !hasChangesToSave}
                          onClick={() => void finishEditing()}
                        >
                          <CheckIcon aria-hidden="true" />
                        </Button>
                      }
                    />
                    <TooltipContent>{UI_LANGUAGE.bookmark.save}</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger
                      render={
                        <Button
                          size="icon-sm"
                          shape="circle"
                          variant="ghost"
                          aria-label={UI_LANGUAGE.bookmark.cancel}
                          disabled={session.busy || session.failed}
                          onClick={discardEditing}
                        >
                          <XIcon aria-hidden="true" />
                        </Button>
                      }
                    />
                    <TooltipContent>{UI_LANGUAGE.bookmark.cancel}</TooltipContent>
                  </Tooltip>
                </div>
              </TooltipProvider>
              {editMessage ? (
                <Banner announce="assertive" size="sm" xstyle={styles.editMenubarMessage}>
                  <BannerDescription>{editMessage}</BannerDescription>
                </Banner>
              ) : null}
            </div>
            <div {...stylex.props(styles.footerControls)}>
              <div {...stylex.props(styles.hints, !shortcutSettings.showShortcutHints && styles.hideHints)}>
                {preferences.searchEnabled ? <ShortcutHint keys={["/"]} label={UI_LANGUAGE.search.label} /> : null}
                <ShortcutHint keys={["E"]} label={UI_LANGUAGE.bookmark.editMode} />
                <ShortcutHint keys={["↑", "↓", "←", "→"]} label={UI_LANGUAGE.bookmark.moveSelection} />
              </div>
              <Setting open={open} onOpenChange={setOpen} />
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}

function ShortcutHint({ keys, label }: ShortcutHintProps) {
  return (
    <span {...stylex.props(styles.hint)}>
      <KbdGroup>
        {keys.map((key) => (
          <Kbd key={key}>{key}</Kbd>
        ))}
      </KbdGroup>
      <span>{label}</span>
    </span>
  );
}
