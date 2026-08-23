import { GearSixIcon } from "@phosphor-icons/react";
import { DateTime } from "~newtab/date";
import { SearchBar, useSearch } from "~newtab/search";
import { cn } from "~shared/lib/utils";
import { Button } from "~shared/ui/button";
import { Kbd, KbdGroup } from "~shared/ui/kbd";
import { SidebarInset, useSidebar } from "~shared/ui/sidebar";

import { AddDialog, Bookmark, LocationPicker, useFolders } from "~/entrypoints/newtab/bookmark";
import { useStorageValue } from "~/entrypoints/shared/hooks/useStorageValue";

import { appearanceStorage, getInitialAppearanceSettings } from "./settings/appearance";
import { getInitialShortcutSettings, shortcutStorage } from "./settings/shortcut";
import Sidebar from "./settings/ui/Sidebar";

export default function App() {
  const { folders, locations, selectedLocationId, loadBookmarks, setSelectedLocation } = useFolders();
  const search = useSearch(folders);
  const selectedLocation = locations.find((location) => location.id === selectedLocationId);
  const appearanceSettings = useStorageValue(appearanceStorage, getInitialAppearanceSettings);
  const shortcutSettings = useStorageValue(shortcutStorage, getInitialShortcutSettings);
  const { open, toggleSidebar } = useSidebar();

  return (
    <>
      <Sidebar />
      <SidebarInset className="min-w-0 transition-[width] duration-200 ease-linear">
        <div className="bg-background text-foreground text-mds-content relative mx-auto flex h-dvh w-full max-w-3xl flex-col overflow-hidden px-2 font-sans">
          <header className="text-foreground/75 mb-5 flex items-center gap-x-3 gap-y-2 px-4 pt-5 sm:pt-6">
            <h1 className="sr-only">Bookmarks</h1>
            <DateTime />
            <div className="col-start-2 row-start-1 ml-auto flex max-w-full shrink-0 items-center gap-2">
              <LocationPicker
                locations={locations}
                selectedLocationId={selectedLocationId}
                onLocationChange={setSelectedLocation}
                size="sm"
              />
              <AddDialog
                locations={locations}
                selectedLocationId={selectedLocationId}
                onBookmarksChange={loadBookmarks}
              />
            </div>
          </header>
          <SearchBar onSearch={search.search} onValueChange={search.setQuery} value={search.query} />
          <Bookmark
            bookmarkIconMode={appearanceSettings.bookmarkIconDisplayMode}
            folders={folders}
            isSearchActive={search.isActive}
            rootId={selectedLocationId}
            rootTitle={selectedLocation?.title ?? null}
            visibleFolders={search.visibleFolders}
            onBookmarksChange={loadBookmarks}
          />
          <footer className="bg-background h-14 shrink-0 px-4">
            <div className="text-muted-foreground flex items-center justify-between gap-4">
              <Button
                aria-expanded={open}
                aria-label={open ? "Close settings" : "Open settings"}
                onClick={toggleSidebar}
                size="icon"
                variant="outline"
              >
                <GearSixIcon className="size-4" />
              </Button>

              <div
                className={cn(
                  "hidden min-w-0 flex-wrap items-center gap-x-4 gap-y-2 transition duration-150 sm:flex",
                  shortcutSettings.showShortcutHints
                    ? "translate-y-0 opacity-100"
                    : "pointer-events-none translate-y-2 opacity-0",
                )}
              >
                <ShortcutHint keys={["/"]} label="Focus search" />
                <ShortcutHint keys={["↑", "↓"]} label="Move selection" />
                <ShortcutHint keys={["Enter"]} label="Open" />
                <ShortcutHint keys={["E key"]} label="Edit" />
                <ShortcutHint keys={["Esc"]} label="Clear" />
              </div>
            </div>
          </footer>
        </div>
      </SidebarInset>
    </>
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
