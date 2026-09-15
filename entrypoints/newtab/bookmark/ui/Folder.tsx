import { dropTargetForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { PlusIcon } from "@phosphor-icons/react";
import * as stylex from "@stylexjs/stylex";
import { Fragment, useEffect, useState } from "react";
import { useStorageValue } from "~shared/hooks/useStorageValue";
import { useLanguage, usePreferences } from "~shared/lib/preferences";
import { colorVars, spacingVars, sizeVars, motionVars } from "~shared/styles/semantic.stylex";
import { Accordion, AccordionContent, AccordionItem } from "~shared/ui/accordion";
import { Button } from "~shared/ui/button";

import { setFolderDisplay } from "../../settings/bookmark/model/settings";
import { isItemDragData } from "../lib/dnd";
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

const styles = stylex.create({
  addLabel: {
    display: "grid",
    gridTemplateColumns: `calc(${sizeVars.controlSm} - ${spacingVars.space2}) minmax(0,1fr)`,
    alignItems: "center",
    gap: spacingVars.space2,
    color: colorVars.fgSecondary,
  },
  fullWidth: { width: "100%" },
  root: {
    ':focus[data-contents-focus="true"]': {
      outlineStyle: "solid",
      outlineWidth: sizeVars.focusRing,
      outlineColor: colorVars.strokeFocus,
      outlineOffset: `calc(${sizeVars.focusRing} * -1)`,
    },
    outline: "none",
    position: "relative",
    display: "grid",
    alignContent: "start",
    justifyItems: "stretch",
    width: "100%",
    minWidth: 0,
  },
  list: { paddingInlineStart: sizeVars.controlSm },
  iconGrid: {
    gridTemplateColumns: "repeat(auto-fill, min(100%, 5rem))",
    justifyContent: "start",
    gap: 0,
    paddingInline: sizeVars.controlXs,
  },
  dragging: { opacity: 0.2 },
  accordion: { borderWidth: 0, borderRadius: 0, overflow: "visible" },
  item: { position: "relative", width: "100%", borderBottomWidth: 0 },
  divider: {
    borderBottomWidth: sizeVars.stroke,
    borderBottomStyle: "solid",
    borderBottomColor: colorVars.strokeDefault,
  },
  content: { padding: 0 },
  height: (value: number) => ({ minHeight: `${value}rem` }),
  heightTransition: {
    transition: "min-height 200ms ease",
    ':is([data-motion-reduced="true"] *)': { transition: "none" },
  },
  resizeHeight: {
    position: "absolute",
    insetInline: 0,
    bottom: 0,
    transform: "translateY(50%)",
    display: "block",
    width: "100%",
    height: spacingVars.space2,
    zIndex: 1,
  },
  items: { position: "relative", display: "grid", alignContent: "start", alignItems: "start" },
  gridAdd: { marginTop: spacingVars.space2 },
  add: { marginInlineStart: sizeVars.controlSm, marginInlineEnd: spacingVars.space4 },
  placeholder: {
    position: "relative",
    marginInlineStart: 0,
    marginInlineEnd: spacingVars.space4,
    overflow: "hidden",
    height: 0,
    transitionProperty: "height",
    transitionDuration: motionVars.durationFast,
    transitionTimingFunction: motionVars.easingStandard,
  },
  placeholderActive: { height: sizeVars.controlMd, backgroundColor: colorVars.bgSubtle },
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
  const { folderViews, folderDisplays, bookmarkIconMode, defaultView, isSearchActive, onBookmarksChange } =
    useBookmarkContext();
  const view =
    (folderDisplays?.[folder.id]?.icon ?? bookmarkIconMode) === "original"
      ? (folderViews[folder.id] ?? defaultView)
      : "list";
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
    <section
      id={`folder-${folder.id}`}
      tabIndex={-1}
      onPointerDown={(e) => {
        delete e.currentTarget.dataset.contentsFocus;
      }}
      onBlur={(e) => {
        delete e.currentTarget.dataset.contentsFocus;
      }}
      {...stylex.props(styles.root, sort.isDragSource && styles.dragging)}
      ref={sort.ref}
    >
      {sort.isDropTarget && sort.dropEdge ? <DropIndicator edge={sort.dropEdge} placement="outside" /> : null}
      <Accordion
        xstyle={styles.accordion}
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
              </div>
              {!isSearchActive ? (
                <div {...stylex.props(styles.add, view === "icons" && styles.gridAdd)}>
                  {!addForm.isAddingBookmark ? (
                    <Button
                      xstyle={styles.fullWidth}
                      align="start"
                      size="sm"
                      type="button"
                      variant="ghost"
                      data-add-bookmark={folder.id}
                      onClick={addForm.toggleForm}
                    >
                      <span {...stylex.props(styles.addLabel)}>
                        <PlusIcon aria-hidden="true" />
                        {UI_LANGUAGE.bookmark.addBookmark}
                      </span>
                    </Button>
                  ) : null}
                  <AddForm form={addForm} />
                </div>
              ) : null}
            </div>
          </AccordionContent>
          {!isSearchActive && expanded.includes(folder.id) ? (
            <button
              type="button"
              aria-label={UI_LANGUAGE.settings.resizeFolderHeight}
              {...stylex.props(resizeStyles.handle, resizeStyles.horizontal, styles.resizeHeight)}
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
      <AddFolder index={(folder.bookmarkIndex ?? 0) + 1} parentId={parentId} />
    </section>
  );
}

function ItemDropPlaceholder({ isActive }: { isActive: boolean }) {
  return (
    <div aria-hidden="true" {...stylex.props(styles.placeholder, isActive && styles.placeholderActive)}>
      <div hidden={!isActive}>
        <DropIndicator edge="before" placement="inside" />
      </div>
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
