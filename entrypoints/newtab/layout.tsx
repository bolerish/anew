import { type ReactNode } from "react";
import { AddBookmarkDialog } from "~newtab/bookmarks/add/ui/AddBookmarkDialog";
import type { BookmarkFolder, BookmarkSource } from "~newtab/bookmarks/lib/model";
import { useFolders } from "~newtab/bookmarks/source/hooks/useFolders";
import { SourceSelect } from "~newtab/bookmarks/source/ui/SourceSelect";
import { ThemeProvider } from "~newtab/shared/theme-provider";

import { DateTime } from "~/entrypoints/newtab/date";
import { SearchProvider } from "~/entrypoints/newtab/search/search-provider";

import { Setting, ShortcutHints } from "./settings";

type RootLayoutProps = {
  children: (props: RootLayoutContentProps) => ReactNode;
};

export type RootLayoutContentProps = {
  rootBookmarkId: string | null;
  rootBookmarkTitle: string | null;
  onBookmarksChange: () => Promise<void>;
};

export function RootLayout({ children }: RootLayoutProps) {
  const { folders, selectedSourceId, selectedSourceTitle, sources, loadBookmarks, setSelectedSource } = useFolders();

  return (
    <ThemeProvider>
      <main className="bg-background text-foreground text-mds-content relative mx-auto flex h-dvh w-full max-w-3xl flex-col overflow-hidden font-sans">
        <Header
          folders={folders}
          selectedSourceId={selectedSourceId}
          selectedSourceTitle={selectedSourceTitle}
          sources={sources}
          onBookmarksChange={loadBookmarks}
          onSourceChange={setSelectedSource}
        />
        <SearchProvider folders={folders}>
          {children({
            rootBookmarkId: selectedSourceId,
            rootBookmarkTitle: selectedSourceTitle,
            onBookmarksChange: loadBookmarks,
          })}
        </SearchProvider>
        <Footer />
      </main>
    </ThemeProvider>
  );
}

type HeaderProps = {
  folders: BookmarkFolder[];
  selectedSourceId: string | null;
  selectedSourceTitle: string | null;
  sources: BookmarkSource[];
  onBookmarksChange: () => Promise<void>;
  onSourceChange: (sourceId: string) => void;
};

function Header({
  folders,
  selectedSourceId,
  selectedSourceTitle,
  sources,
  onBookmarksChange,
  onSourceChange,
}: HeaderProps) {
  return (
    <header className="text-foreground/75 mb-5 flex items-center gap-x-3 gap-y-2 px-8 pt-5 sm:pt-6">
      <DateTime />
      <div className="col-start-2 row-start-1 ml-auto flex max-w-full shrink-0 items-center gap-2">
        <SourceSelect selectedSourceId={selectedSourceId} sources={sources} onSourceChange={onSourceChange} />
        <AddBookmarkDialog
          folders={folders}
          rootBookmarkId={selectedSourceId}
          rootBookmarkTitle={selectedSourceTitle}
          onBookmarksChange={onBookmarksChange}
        />
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="bg-background h-14 shrink-0 px-6">
      <div className="text-muted-foreground flex items-end justify-end gap-4">
        <ShortcutHints />
        <div className="ml-auto flex shrink-0 items-center gap-2">
          <Setting />
        </div>
      </div>
    </footer>
  );
}
