import { GearSixIcon } from "@phosphor-icons/react";
import { type CSSProperties, useEffect, useState } from "react";
import { DateTime } from "~newtab/date";
import { SearchBar, SearchProvider } from "~newtab/search";
import { cn } from "~shared/lib/utils";
import { Button } from "~shared/ui/button";
import { Kbd, KbdGroup } from "~shared/ui/kbd";
import { Sidebar, SidebarContent, SidebarHeader, SidebarInset, SidebarProvider, useSidebar } from "~shared/ui/sidebar";
import { Toaster } from "~shared/ui/sonner";
import { ThemeProvider } from "~shared/ui/ThemeProvider";

import { AddBookmarkDialog, BookmarkList, SourceSelect, useFolders } from "~/entrypoints/newtab/bookmark";

import {
  Appearance,
  appearanceStorage,
  getInitialAppearanceSettings,
  type BookmarkIconDisplayMode,
} from "./settings/appearance";
import { Date, Time } from "./settings/format";
import { getInitialShortcutSettings, Shortcut, shortcutStorage } from "./settings/shortcut";

export function App() {
  const { folders, selectedSourceId, selectedSourceTitle, sources, loadBookmarks, setSelectedSource } = useFolders();
  const [bookmarkIconMode, setBookmarkIconMode] = useState<BookmarkIconDisplayMode>(
    () => getInitialAppearanceSettings().bookmarkIconDisplayMode,
  );

  useEffect(() => {
    let isMounted = true;
    void appearanceStorage.getValue().then((settings) => {
      if (isMounted) setBookmarkIconMode(settings.bookmarkIconDisplayMode);
    });

    const unwatchAppearance = appearanceStorage.watch((settings) =>
      setBookmarkIconMode(settings.bookmarkIconDisplayMode),
    );

    return () => {
      isMounted = false;
      unwatchAppearance();
    };
  }, []);

  return (
    <ThemeProvider>
      <SidebarProvider
        className="flex-row-reverse"
        defaultOpen={false}
        style={{ "--sidebar-width": "min(calc(100vw - 3rem), 23rem)" } as CSSProperties}
      >
        <SettingsSidebar />
        <SidebarInset className="min-w-0 transition-[width] duration-200 ease-linear">
          <div className="bg-background text-foreground text-mds-content relative mx-auto flex h-dvh w-full max-w-3xl flex-col overflow-hidden font-sans">
            <h1 className="sr-only">Bookmarks</h1>
            <header className="text-foreground/75 mb-5 flex items-center gap-x-3 gap-y-2 px-8 pt-5 sm:pt-6">
              <DateTime />
              <div className="col-start-2 row-start-1 ml-auto flex max-w-full shrink-0 items-center gap-2">
                <SourceSelect
                  selectedSourceId={selectedSourceId}
                  sources={sources}
                  onSourceChange={setSelectedSource}
                />
                <AddBookmarkDialog
                  folders={folders}
                  rootBookmarkId={selectedSourceId}
                  rootBookmarkTitle={selectedSourceTitle}
                  onBookmarksChange={loadBookmarks}
                />
              </div>
            </header>
            <SearchProvider folders={folders}>
              <SearchBar />
              <BookmarkList
                bookmarkIconMode={bookmarkIconMode}
                rootBookmarkId={selectedSourceId}
                rootBookmarkTitle={selectedSourceTitle}
                onBookmarksChange={loadBookmarks}
              />
            </SearchProvider>
            <footer className="bg-background h-14 shrink-0 px-6">
              <div className="text-muted-foreground flex items-end justify-end gap-4">
                <ShortcutHints />
                <div className="ml-auto flex shrink-0 items-center gap-2">
                  <SettingsTrigger />
                </div>
              </div>
            </footer>
          </div>
        </SidebarInset>
      </SidebarProvider>
      <Toaster />
    </ThemeProvider>
  );
}

function SettingsSidebar() {
  return (
    <Sidebar aria-label="Settings" side="right">
      <SidebarHeader className="border-sidebar-border border-b px-4 py-3">
        <h2 className="text-sm font-medium">Settings</h2>
      </SidebarHeader>
      <SidebarContent className="gap-3 px-4 py-3">
        <Date />
        <Time />
        <Appearance />
        <Shortcut />
      </SidebarContent>
    </Sidebar>
  );
}

function SettingsTrigger() {
  const { open, toggleSidebar } = useSidebar();

  return (
    <Button
      aria-expanded={open}
      aria-label={open ? "Close settings" : "Open settings"}
      onClick={toggleSidebar}
      size="icon"
      variant="outline"
    >
      <GearSixIcon className="size-4" />
    </Button>
  );
}

function ShortcutHints() {
  const [showShortcutHints, setShowShortcutHints] = useState(() => getInitialShortcutSettings().showShortcutHints);

  useEffect(() => {
    let isMounted = true;
    void shortcutStorage.getValue().then((settings) => {
      if (isMounted) setShowShortcutHints(settings.showShortcutHints);
    });

    const unwatchShortcut = shortcutStorage.watch((settings) => setShowShortcutHints(settings.showShortcutHints));

    return () => {
      isMounted = false;
      unwatchShortcut();
    };
  }, []);

  return (
    <div
      className={cn(
        "mr-auto hidden min-w-0 flex-wrap items-center gap-x-4 gap-y-2 transition duration-150 sm:flex",
        showShortcutHints ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-2 opacity-0",
      )}
    >
      <ShortcutHint keys={["/"]} label="Focus search" />
      <ShortcutHint keys={["↑", "↓"]} label="Move selection" />
      <ShortcutHint keys={["Enter"]} label="Open" />
      <ShortcutHint keys={["E key"]} label="Edit" />
      <ShortcutHint keys={["Esc"]} label="Clear" />
    </div>
  );
}

type ShortcutHintProps = {
  keys: string[];
  label: string;
};

function ShortcutHint({ keys, label }: ShortcutHintProps) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <KbdGroup>
        {keys.map((key) => (
          <Kbd className="text-mds-shortcut-key h-4 min-w-4 rounded-none px-1" key={key}>
            {key}
          </Kbd>
        ))}
      </KbdGroup>
      <span className="text-mds-shortcut-label">{label}</span>
    </span>
  );
}
