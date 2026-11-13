import { dropTargetForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { colorVars, spacingVars, sizeVars, typo } from "@bolerish/tokens/semantic.stylex";
import { Accordion, AccordionContent, AccordionItem } from "@bolerish/ui/accordion";
import { Button } from "@bolerish/ui/button";
import { Item as BookmarkRow } from "@bolerish/ui/item";
import { PlusIcon } from "@phosphor-icons/react";
import * as stylex from "@stylexjs/stylex";
import { Fragment, useEffect, useState } from "react";
import { useStorageValue } from "~shared/hooks/useStorageValue";
import { useLanguage, usePreferences } from "~shared/lib/preferences";

import { setFolderDisplay } from "../../settings/bookmark/model/settings";
import { isItemDragData } from "../lib/dnd";
import { resolveBookmarkView } from "../lib/item-view";
import { collapsedFoldersStorage, getInitialCollapsedFolders, setFolderExpanded } from "../model/expansion";
import { useBookmarkContext } from "../model/Provider";
import type { BookmarkFolder } from "../model/types";
import { useAddForm } from "../model/useAddForm";
import { useFolderDnd } from "../model/useFolderDnd";
import { useFolderResize } from "../model/useFolderResize";
import { AddFolder } from "./AddFolder";
import { AddForm } from "./AddForm";
import { DropIndicator } from "./DropIndicator";
import { FolderHeader } from "./FolderHeader";
import { Item } from "./Item";
import { resizeStyles } from "./resize-styles";
import { rowStyles } from "./row-styles";
import { tileStyles } from "./tile-styles";

const styles = stylex.create({
  addLabel: {
    width: "100%",
    color: colorVars.fgSecondary,
    fontSize: `calc(${typo.fontSizeSm} * var(--mds-content-scale, 1))`,
  },
  addText: { minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", textAlign: "start" },
  addIcon: {
    width: `calc(${sizeVars.iconMd} * var(--mds-content-scale, 1))`,
    height: `calc(${sizeVars.iconMd} * var(--mds-content-scale, 1))`,
  },
  fullWidth: { width: "100%" },
  root: {
    ':focus[data-contents-focus="true"]': {
      outlineStyle: "solid",
      outlineWidth: sizeVars.focusRing,
      outlineColor: colorVars.strokeFocus,
      transition: "none",
      outlineOffset: `calc(${sizeVars.focusRing} * -1)`,
    },
    outlineStyle: "solid",
    outlineWidth: sizeVars.focusRing,
    outlineColor: "transparent",
    outlineOffset: `calc(${sizeVars.focusRing} * -1)`,
    transition: "outline-color 200ms ease",
    ':is([data-motion-reduced="true"] *)': { transition: "none" },
    position: "relative",
    display: "grid",
    alignContent: "start",
    justifyItems: "stretch",
    width: "100%",
    minWidth: 0,
  },
  list: { paddingInlineStart: sizeVars.controlSm },
  iconGrid: {
    gridTemplateColumns:
      "repeat(auto-fill, minmax(min(100%, max(5rem, calc(5rem * var(--mds-content-scale, 1)))), 1fr))",
    "--bookmark-tile-height": "max(4.5rem, calc(4.5rem * var(--mds-content-scale, 1)))",
    gap: 0,
    paddingInlineStart: sizeVars.controlXs,
  },
  draggingContent: {
    opacity: 0.5,
    outlineStyle: "dashed",
    outlineWidth: sizeVars.stroke,
    outlineColor: colorVars.strokeFocus,
    outlineOffset: `calc(${sizeVars.stroke} * -1)`,
  },
  accordion: { borderWidth: 0, borderRadius: 0, overflow: "visible" },
  item: { position: "relative", width: "100%", borderBottomWidth: 0 },
  divider: {
    borderBottomWidth: sizeVars.stroke,
    borderBottomStyle: "solid",
    borderBottomColor: colorVars.strokeDefault,
  },
  content: { paddingBottom: spacingVars.space4, paddingInlineEnd: 0 },
  height: (value: number) => ({ minHeight: `${value}rem` }),
  heightTransition: {
    transition: "min-height 200ms ease",
    ':is([data-motion-reduced="true"] *)': { transition: "none" },
  },
  resizeHeight: {
    position: "absolute",
    insetInline: 0,
    bottom: 0,
    display: "block",
    width: "100%",
    height: spacingVars.space2,
    zIndex: 1,
  },
  items: { position: "relative", display: "grid", alignContent: "start", alignItems: "start" },
  gridAdd: { minWidth: 0 },
  gridEditor: { gridColumn: "1 / -1", width: "100%", maxWidth: "24rem" },
  gridAddContent: { width: "100%", fontWeight: typo.fontWeightRegular, lineHeight: typo.lineHeightNormal },
  gridAddIcon: {
    width: `calc(${sizeVars.iconLg} * var(--mds-content-scale, 1))`,
    height: `calc(${sizeVars.iconLg} * var(--mds-content-scale, 1))`,
  },
  add: { marginInlineStart: sizeVars.controlSm },
  placeholder: {
    position: "relative",
    marginInlineStart: 0,
    height: 0,
  },
  start: { position: "relative", marginBottom: `calc(${spacingVars.space3} * -1)`, height: spacingVars.space3 },
});

type FolderProps = {
  folder: BookmarkFolder;
  parentId: string;
  onMove: (direction: "down" | "up") => void;
};

type ItemStartDropZoneProps = {
  folderId: string;
  onDropIndexChange: (index: number | null) => void;
};

export function Folder({ folder, parentId, onMove }: FolderProps) {
  const UI_LANGUAGE = useLanguage();
  const { folderDividers } = usePreferences();
  const { folderViews, folderDisplays, bookmarkIconMode, defaultView, isSearchActive, isEditMode, onBookmarksChange } =
    useBookmarkContext();
  const view = resolveBookmarkView(
    folderDisplays?.[folder.id]?.icon ?? bookmarkIconMode,
    folderViews[folder.id] ?? defaultView,
  );
  const { drop, sort } = useFolderDnd(folder);
  const [dropIndex, setDropIndex] = useState<number | null>(null);
  const addForm = useAddForm({
    parentId: folder.id,
    onCreated: onBookmarksChange,
  });
  const display = folderDisplays?.[folder.id] ?? { icon: bookmarkIconMode, showTitle: true };
  const heightResize = useFolderResize((minHeight) => setFolderDisplay(folder.id, { ...display, minHeight }));
  const collapsedFolders = useStorageValue(collapsedFoldersStorage, getInitialCollapsedFolders);
  const isExpanded = addForm.isAddingBookmark || collapsedFolders?.[folder.id] !== true;
  const expanded = isExpanded ? [folder.id] : [];
  const activeDropIndex = drop.isDropTarget ? folder.items.length : dropIndex;

  return (
    <>
      <section
        id={`folder-${folder.id}`}
        tabIndex={-1}
        onPointerDown={(e) => {
          delete e.currentTarget.dataset.contentsFocus;
        }}
        onBlur={(e) => {
          delete e.currentTarget.dataset.contentsFocus;
        }}
        {...stylex.props(styles.root)}
        ref={sort.ref}
      >
        {sort.isDropTarget && sort.dropEdge ? (
          <DropIndicator edge={sort.dropEdge} placement="outside" offset={sort.dropOffset} />
        ) : null}
        {sort.isSelfDrop ? <DropIndicator edge="before" placement="inside" /> : null}
        <Accordion
          xstyle={[styles.accordion, sort.isDragSource && styles.draggingContent]}
          value={expanded}
          onValueChange={(value) => void setFolderExpanded(folder.id, value.includes(folder.id))}
        >
          <AccordionItem xstyle={[styles.item, folderDividers && styles.divider]} value={folder.id}>
            <FolderHeader folder={folder} handleRef={sort.handleRef} isDragging={sort.isDragSource} onMove={onMove} />
            <AccordionContent xstyle={styles.content}>
              <div
                {...stylex.props(
                  styles.items,
                  !heightResize.isResizing && styles.heightTransition,
                  styles.height(heightResize.height ?? display.minHeight ?? 0),
                )}
                ref={drop.ref}
              >
                <div {...stylex.props(styles.items, view === "icons" ? styles.iconGrid : styles.list)}>
                  {view === "list" ? <ItemStartDropZone folderId={folder.id} onDropIndexChange={setDropIndex} /> : null}
                  {folder.items.map((item, itemIndex) => (
                    <Fragment key={item.id}>
                      {view === "list" ? <ItemDropPlaceholder isActive={activeDropIndex === itemIndex} /> : null}
                      <Item
                        itemEntry={{ item, itemIndex }}
                        isRecentlyCreated={item.url === addForm.recentlyCreatedUrl}
                        onDropIndexChange={setDropIndex}
                        showDropBefore={view === "icons" && activeDropIndex === itemIndex}
                        showDropAfter={
                          view === "icons" &&
                          itemIndex === folder.items.length - 1 &&
                          activeDropIndex === folder.items.length
                        }
                      />
                    </Fragment>
                  ))}
                  {view === "list" ? <ItemDropPlaceholder isActive={activeDropIndex === folder.items.length} /> : null}
                  {view === "icons" && !isSearchActive ? (
                    <div {...stylex.props(styles.gridAdd, addForm.isAddingBookmark && styles.gridEditor)}>
                      {!addForm.isAddingBookmark ? (
                        <Button
                          xstyle={styles.fullWidth}
                          style={{
                            height: "var(--bookmark-tile-height)",
                            minHeight: "var(--bookmark-tile-height)",
                            borderWidth: 0,
                            paddingInline: 0,
                            paddingBlock: 0,
                          }}
                          size="sm"
                          type="button"
                          variant="ghost"
                          aria-label={UI_LANGUAGE.bookmark.addBookmark}
                          title={UI_LANGUAGE.bookmark.addBookmark}
                          data-add-bookmark={folder.id}
                          onClick={addForm.toggleForm}
                        >
                          <span {...stylex.props(tileStyles.content, styles.addLabel, styles.gridAddContent)}>
                            <PlusIcon aria-hidden="true" {...stylex.props(styles.gridAddIcon)} />
                            {display.showTitle ? (
                              <span {...stylex.props(tileStyles.label)}>{UI_LANGUAGE.bookmark.addBookmark}</span>
                            ) : null}
                          </span>
                        </Button>
                      ) : null}
                      <AddForm form={addForm} view="icons" />
                    </div>
                  ) : null}
                </div>
                {view === "list" && !isSearchActive ? (
                  <div {...stylex.props(styles.add)}>
                    {!addForm.isAddingBookmark ? (
                      <BookmarkRow size="xs" xstyle={rowStyles.inset}>
                        <Button
                          xstyle={styles.fullWidth}
                          style={{ borderWidth: 0, paddingInline: 0 }}
                          align="start"
                          size="sm"
                          type="button"
                          variant="ghost"
                          data-add-bookmark={folder.id}
                          onClick={addForm.toggleForm}
                        >
                          <span {...stylex.props(rowStyles.columns, styles.addLabel)}>
                            <span aria-hidden="true" {...stylex.props(rowStyles.iconSlot)}>
                              <PlusIcon aria-hidden="true" {...stylex.props(styles.addIcon)} />
                            </span>
                            <span {...stylex.props(rowStyles.labelInset, styles.addText)}>
                              {UI_LANGUAGE.bookmark.addBookmark}
                            </span>
                          </span>
                        </Button>
                      </BookmarkRow>
                    ) : null}
                    <AddForm form={addForm} />
                  </div>
                ) : null}
              </div>
            </AccordionContent>
            {!isSearchActive && expanded.includes(folder.id) ? (
              <button
                type="button"
                data-bookmark-resize=""
                aria-label={UI_LANGUAGE.settings.resizeFolderHeight}
                {...stylex.props(
                  resizeStyles.handle,
                  resizeStyles.horizontal,
                  isEditMode && [resizeStyles.editing, resizeStyles.horizontalGrip],
                  styles.resizeHeight,
                )}
                onPointerDown={heightResize.handleStart}
                onPointerMove={heightResize.handleMove}
                onPointerUp={heightResize.handleEnd}
                onPointerCancel={heightResize.cancel}
                onDoubleClick={heightResize.reset}
                onKeyDown={heightResize.handleKeyDown}
              />
            ) : null}
          </AccordionItem>
        </Accordion>
      </section>
      <AddFolder index={(folder.bookmarkIndex ?? 0) + 1} parentId={parentId} />
    </>
  );
}

function ItemDropPlaceholder({ isActive }: { isActive: boolean }) {
  return (
    <div aria-hidden="true" {...stylex.props(styles.placeholder)}>
      {isActive ? <DropIndicator edge="before" placement="inside" /> : null}
    </div>
  );
}

function ItemStartDropZone({ folderId, onDropIndexChange }: ItemStartDropZoneProps) {
  const [element, setElement] = useState<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!element) return;

    return dropTargetForElements({
      element,
      canDrop: ({ source }) => isItemDragData(source.data),
      getData: () => ({ kind: "item-start", parentId: folderId }),
      onDragEnter: () => onDropIndexChange(0),
      onDragLeave: () => onDropIndexChange(null),
      onDrop: () => onDropIndexChange(null),
    });
  }, [element, folderId, onDropIndexChange]);

  return <div aria-hidden="true" {...stylex.props(styles.start)} ref={setElement} />;
}
