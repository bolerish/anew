import { colorVars, spacingVars, sizeVars, typo } from "@bolerish/tokens/semantic.stylex";
import { Button } from "@bolerish/ui/button";
import { Empty, EmptyDescription } from "@bolerish/ui/empty";
import { ScrollArea, ScrollAreaViewport, ScrollAreaContent } from "@bolerish/ui/scroll-area";
import * as stylex from "@stylexjs/stylex";
import { useLanguage } from "~shared/lib/preferences";

import { resolveColumnLayout } from "../../settings/bookmark/lib/layout";
import { type BookmarkSettings } from "../../settings/bookmark/model/settings";
import { BookmarkProvider, useBookmarkContext } from "../model/Provider";
import type { BookmarkFolder, BookmarkIconDisplayMode } from "../model/types";
import { useAddForm } from "../model/useAddForm";
import { useDndMove } from "../model/useDndMove";
import { useKeyboardNavigation } from "../model/useKeyboardNavigation";
import { AddFolder } from "./AddFolder";
import { AddForm } from "./AddForm";
import { ColumnLayout } from "./ColumnLayout";
import { FolderContents } from "./FolderContents";

const styles = stylex.create({
  title: {
    color: colorVars.fgSecondary,
    fontFamily: typo.fontFamilyHeading,
    fontSize: `calc(${typo.fontSizeSm} / var(--mds-content-scale, 1) * var(--mds-heading-scale, 1))`,
    lineHeight: typo.lineHeightNormal,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  root: { minHeight: 0, flexGrow: 1, overflow: "visible" },
  body: { anchorName: "--bookmark-content", position: "relative", display: "flex", height: "100%", minHeight: 0 },
  scroll: {
    flex: 1,
    minWidth: 0,
    height: "100%",
    marginInlineStart: `calc(${spacingVars.space4} - ${sizeVars.controlSm})`,
  },
  content: {
    minWidth: 0,
    display: "grid",
    gridTemplateColumns: "minmax(0, 1fr)",
    alignContent: "start",
    paddingBlock: spacingVars.space6,
    paddingInlineStart: sizeVars.controlSm,
    paddingInlineEnd: spacingVars.space4,
  },
  empty: { borderWidth: 0, padding: spacingVars.space4 },
  section: { marginInline: spacingVars.space4, display: "grid" },
  header: {
    display: "grid",
    alignItems: "center",
    minHeight: sizeVars.controlSm,
    padding: spacingVars.space1,
    borderBottomWidth: sizeVars.stroke,
    borderBottomStyle: "solid",
    borderBottomColor: colorVars.strokeDefault,
  },
});

type BookmarkProps = {
  disabled?: boolean;
  bookmarkIconMode: BookmarkIconDisplayMode;
  settings: BookmarkSettings;
  folders: BookmarkFolder[];
  isSearchActive: boolean;
  isEditMode: boolean;
  onBookmarksChange: () => Promise<void>;
  rootTitle: string | null;
  selectedLocationId: string | null;
  visibleFolders: BookmarkFolder[];
};

type ContentProps = Pick<BookmarkProps, "rootTitle" | "selectedLocationId" | "settings">;

type RootFolderProps = {
  parentId: string;
  title: string | null;
};

export function Bookmark({
  disabled,
  bookmarkIconMode,
  settings,
  folders,
  isSearchActive,
  isEditMode,
  onBookmarksChange,
  rootTitle,
  selectedLocationId,
  visibleFolders,
}: BookmarkProps) {
  return (
    <div inert={disabled} {...stylex.props(styles.root)}>
      <BookmarkProvider
        bookmarkIconMode={bookmarkIconMode}
        folderDisplays={settings.folderDisplays}
        folderViews={settings.folderViews}
        defaultView={settings.defaultView}
        folders={folders}
        isSearchActive={isSearchActive}
        isEditMode={isEditMode}
        onBookmarksChange={onBookmarksChange}
        visibleFolders={visibleFolders}
      >
        <Content settings={settings} rootTitle={rootTitle} selectedLocationId={selectedLocationId} />
      </BookmarkProvider>
    </div>
  );
}

function Content({ rootTitle, selectedLocationId, settings }: ContentProps) {
  const UI_LANGUAGE = useLanguage();
  const {
    activeBookmark,
    editor,
    folders,
    isEditMode,
    isSearchActive,
    onBookmarksChange,
    setActiveBookmark,
    visibleFolders,
  } = useBookmarkContext();
  useDndMove({ folders, isSearchActive, onBookmarksChange });

  const orderedIds = resolveColumnLayout(
    visibleFolders.map((folder) => folder.id),
    settings.layouts[selectedLocationId ?? ""],
    settings.initialColumns,
  ).columns.flat();
  const orderedFolders = orderedIds.map((id) => visibleFolders.find((folder) => folder.id === id)!);
  useKeyboardNavigation({ isEditMode, activeBookmark, editor, setActiveBookmark, visibleFolders: orderedFolders });

  return (
    <div {...stylex.props(styles.body)}>
      {visibleFolders.length > 1 ? <FolderContents folders={orderedFolders} /> : null}
      <ScrollArea xstyle={styles.scroll} scrollbars="both">
        <ScrollAreaViewport id="bookmark-content" tabIndex={-1} data-bookmark-scroll="">
          <ScrollAreaContent xstyle={styles.content}>
            {selectedLocationId && visibleFolders.length ? (
              <ColumnLayout
                folders={visibleFolders}
                sourceId={selectedLocationId}
                saved={settings.layouts[selectedLocationId]}
                initialColumns={settings.initialColumns}
                editable={!isSearchActive}
              />
            ) : null}

            {visibleFolders.length === 0 && isSearchActive ? (
              <Empty xstyle={styles.empty}>
                <EmptyDescription>
                  <output>{UI_LANGUAGE.bookmark.noResults}</output>
                </EmptyDescription>
              </Empty>
            ) : null}

            {visibleFolders.length === 0 && !isSearchActive && selectedLocationId ? (
              <RootFolder parentId={selectedLocationId} title={rootTitle} />
            ) : null}
          </ScrollAreaContent>
        </ScrollAreaViewport>
      </ScrollArea>
    </div>
  );
}

function RootFolder({ parentId, title }: RootFolderProps) {
  const { onBookmarksChange } = useBookmarkContext();
  const form = useAddForm({ parentId, onCreated: onBookmarksChange });
  const UI_LANGUAGE = useLanguage();
  return (
    <section {...stylex.props(styles.section)}>
      <header {...stylex.props(styles.header)}>
        <h2 {...stylex.props(styles.title)}>{title ?? UI_LANGUAGE.bookmark.rootTitle}</h2>
      </header>
      {!form.isAddingBookmark ? (
        <Button variant="ghost" align="start" data-add-bookmark={parentId} onClick={form.toggleForm}>
          {UI_LANGUAGE.bookmark.addBookmark}
        </Button>
      ) : null}
      <AddForm form={form} />
      <AddFolder parentId={parentId} />
    </section>
  );
}
