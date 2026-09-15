import {
  DotsThreeVerticalIcon,
  DotsThreeIcon,
  CheckIcon,
  PencilSimpleIcon,
  TrashSimpleIcon,
  XIcon,
} from "@phosphor-icons/react";
import * as stylex from "@stylexjs/stylex";
import { useEffect, useId, useRef, type SubmitEvent, type MouseEvent } from "react";
import { stopInteraction } from "~shared/lib/event";
import { notifyError } from "~shared/lib/notify-error";
import { useLanguage } from "~shared/lib/preferences";
import {
  colorVars,
  spacingVars,
  sizeVars,
  radiusVars,
  motionVars,
  typographyVars,
} from "~shared/styles/semantic.stylex";
import { Button } from "~shared/ui/button";
import { ButtonGroup } from "~shared/ui/button-group";
import { ContentRow, ContentRowContent, ContentRowActions } from "~shared/ui/content-row";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "~shared/ui/dropdown-menu";
import { Field, FieldError } from "~shared/ui/field";
import { Input } from "~shared/ui/input";
import { InputGroup } from "~shared/ui/input-group";
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from "~shared/ui/tooltip";

import { moveItem as moveBookmarkItem } from "../api/move";
import { deleteItem as deleteBookmarkItem } from "../api/update";
import { deriveBookmarkItemView, deriveItemLabel, type BookmarkItemEntry } from "../lib/item-view";
import { canNormalizeUrl } from "../lib/url";
import { useBookmarkContext } from "../model/Provider";
import { useItemDnd } from "../model/useItemDnd";
import { DragHandle } from "./DragHandle";
import { DropIndicator } from "./DropIndicator";
import { editorStyles } from "./editor-styles";
import { ItemIcon } from "./ItemIcon";
import { SaveError } from "./SaveError";

const styles = stylex.create({
  menuIcon: { width: sizeVars.iconLg, height: sizeVars.iconLg },
  icon: { width: sizeVars.iconMd, height: sizeVars.iconMd },
  tile: { marginBlock: 0, marginInlineStart: 0, marginInlineEnd: 0, minWidth: 0 },
  floatingActions: {
    flexDirection: "column",
    gap: 0,
    position: "absolute",
    top: 0,
    margin: 0,
    transform: "none",
    insetInlineEnd: 0,
    zIndex: 1,
  },
  tileView: {
    paddingInline: 0,
    paddingBlock: 0,
    display: "flex",
    flexDirection: "column",
    height: "4.5rem",
    minHeight: "4.5rem",
    justifyContent: "center",
  },
  tileContent: { display: "flex", flexDirection: "column", alignItems: "center", gap: spacingVars.space1 },
  tileMarkerContent: { flexDirection: "row", justifyContent: "center" },
  tileLabel: {
    width: "fit-content",
    maxWidth: "100%",
    height: "2lh",
    flexShrink: 0,
    display: "-webkit-box",
    WebkitBoxOrient: "vertical",
    WebkitLineClamp: 2,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "normal",
    overflowWrap: "anywhere",
  },
  tileTitleArea: { width: "100%" },
  labelWithUrl: { display: "flex", alignItems: "baseline", gap: spacingVars.space1 },
  titleText: { overflow: "hidden", textOverflow: "ellipsis", minWidth: 0 },
  domain: { color: colorVars.fgSecondary, overflow: "hidden", textOverflow: "ellipsis", minWidth: 0, flexShrink: 3 },
  tileLink: { paddingInline: 0, paddingBlock: 0, textAlign: "center" },
  actions: {
    alignSelf: "center",
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: spacingVars.space1,
  },
  input: { minWidth: 0, width: "100%", flexGrow: 1 },

  actionVisibility: {
    opacity: { default: "var(--bookmark-actions-opacity, 0)", ":focus-within": 1 },
    pointerEvents: { default: "var(--bookmark-actions-pointer-events, none)" as "auto", ":focus-within": "auto" },
    transitionProperty: "opacity",
    transitionDuration: motionVars.durationFast,
  },
  root: { position: "relative", marginInlineStart: 0, marginInlineEnd: spacingVars.space4 },
  dragging: { opacity: 0.2 },
  row: {
    position: "relative",
    "--bookmark-actions-pointer-events": { default: "none", ":hover": "auto", ":focus-within": "auto" },
    "--bookmark-actions-opacity": { default: 0, ":hover": 1, ":focus-within": 1 },
  },
  view: {
    borderWidth: 0,
    paddingBlock: 0,
    alignItems: "center",
    gap: spacingVars.space2,
    paddingInline: spacingVars.space2,
    minHeight: sizeVars.controlMd,
    borderRadius: radiusVars.sm,
    ":hover": { backgroundColor: colorVars.interactionHover },
  },
  active: { backgroundColor: colorVars.interactionSelected },
  titleArea: { alignSelf: "center", position: "relative", display: "grid", minWidth: 0, alignItems: "center" },
  linkArea: {
    ":focus-visible": {
      outlineStyle: "solid",
      outlineColor: colorVars.strokeFocus,
      outlineWidth: sizeVars.focusRing,
      outlineOffset: sizeVars.stroke,
    },
    color: colorVars.fgPrimary,
    textDecoration: "none",
    width: "100%",
    position: "relative",
    display: "grid",
    gridTemplateColumns: "minmax(0,1fr)",
    alignItems: "center",
    minWidth: 0,
  },
  withoutIcon: { paddingInlineStart: sizeVars.controlSm },
  withIcon: {
    gridTemplateColumns: `calc(${sizeVars.controlSm} - ${spacingVars.space2}) minmax(0,1fr)`,
    gap: spacingVars.space2,
  },
  link: {
    paddingInline: spacingVars.space1,
    pointerEvents: "auto",
    width: "100%",
    maxWidth: "100%",
    minWidth: 0,
    color: colorVars.fgPrimary,
    fontSize: `calc(${typographyVars.fontSizeSm} * var(--mds-content-scale, 1))`,
    fontWeight: typographyVars.fontWeightRegular,
    lineHeight: typographyVars.lineHeightNormal,
    textDecoration: "none",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    ":focus-visible": { outlineStyle: "solid", outlineColor: colorVars.strokeFocus, outlineWidth: sizeVars.focusRing },
  },
  form: {
    width: "100%",
    display: "grid",
    gridTemplateColumns: "minmax(0,1fr) auto",
    gap: spacingVars.space2,
    alignItems: "start",
    paddingInline: spacingVars.space2,
  },
  tileForm: { padding: 0, gridTemplateColumns: "minmax(0,1fr)", textAlign: "center" },
  tileMarkerForm: { gridTemplateColumns: "auto minmax(0,1fr)", textAlign: "start" },
  tileEditIcon: { justifyContent: "center" },
  tileEditActions: { gridColumn: "1 / -1", justifySelf: "center" },
  formWithIcon: { gridTemplateColumns: "auto minmax(0,1fr) auto" },
  editIcon: { display: "flex", alignItems: "center", minHeight: sizeVars.controlMd },
});

type ItemProps = {
  itemEntry: BookmarkItemEntry;
  showDropBefore?: boolean;
  showDropAfter?: boolean;
  onDropIndexChange: (index: number | null) => void;
};

export function Item({ itemEntry, onDropIndexChange, showDropBefore, showDropAfter }: ItemProps) {
  const UI_LANGUAGE = useLanguage();
  const { item, itemIndex } = itemEntry;
  const label = deriveItemLabel(item);
  const {
    editor,
    activeBookmark,
    isEditMode,
    folderDisplays,
    folderViews,
    defaultView,
    bookmarkIconMode,
    folders,
    isSearchActive,
    onBookmarksChange,
  } = useBookmarkContext();

  const display = folderDisplays?.[item.parentId];
  const iconMode = display?.icon ?? bookmarkIconMode;
  const displayMode = iconMode === "original" ? (folderViews[item.parentId] ?? defaultView) : "list";
  let domain = "";
  if (displayMode === "list" && display?.showUrl) {
    try {
      domain = new URL(item.url).hostname;
    } catch {
      /* Invalid legacy URLs have no domain. */
    }
  }
  const hideTitle = displayMode === "icons" && iconMode === "original" && display?.showTitle === false;
  const view = deriveBookmarkItemView(item, iconMode);
  const { icon, iconMarker, showBookmarkIcon } = view;
  const titleInputRef = useRef<HTMLInputElement | null>(null);
  const urlErrorId = useId();
  const isActive = activeBookmark?.kind === "item" && activeBookmark.id === item.id;
  const isEditing = editor.inlineEditingBookmark?.kind === "item" && editor.inlineEditingBookmark.id === item.id;
  const isUrlValid = !isEditing || canNormalizeUrl(editor.inlineUrl);

  function openEditor(event: MouseEvent<HTMLElement>) {
    stopInteraction(event);
    editor.openInlineItemEditor(item);
  }

  async function handleSubmit(event: SubmitEvent) {
    event.preventDefault();
    await editor.updateCurrentInlineEditor();
  }

  const { handleRef, isDragSource, setItemElement } = useItemDnd({
    horizontal: displayMode === "icons",
    isActive,
    isEditing,
    item,
    itemIndex,
    onDropIndexChange,
  });

  function deleteItem() {
    void deleteBookmarkItem(item).catch(notifyError);
  }

  async function moveItem(direction: "down" | "up") {
    if (isSearchActive || item.bookmarkIndex === undefined) {
      return;
    }

    const parentFolder = folders.find((folder) => folder.id === item.parentId);
    const nextItem = parentFolder?.items[itemIndex + (direction === "up" ? -1 : 1)];

    if (!nextItem) {
      return;
    }

    const targetIndex = direction === "up" ? item.bookmarkIndex - 1 : item.bookmarkIndex + 2;

    try {
      await moveBookmarkItem(item, { index: targetIndex, parentId: item.parentId });
      await onBookmarksChange();
    } catch (error) {
      console.error("[newtab:bookmark] failed to move bookmark item", error);
    }
  }

  useEffect(() => {
    if (!isEditing) return;

    titleInputRef.current?.focus();
    titleInputRef.current?.select();
  }, [isEditing]);

  return (
    <div
      id={`bookmark-${item.id}`}
      {...stylex.props(styles.root, displayMode === "icons" && styles.tile, isDragSource && styles.dragging)}
      ref={setItemElement}
    >
      {showDropBefore ? <DropIndicator edge="before" placement="inside" vertical={displayMode === "icons"} /> : null}
      {showDropAfter ? <DropIndicator edge="after" placement="inside" vertical /> : null}
      <div {...stylex.props(styles.row)}>
        {!isEditing ? (
          <DragHandle
            floating={displayMode === "icons"}
            kind="item"
            isDragging={isDragSource}
            label={UI_LANGUAGE.bookmark.move}
            onMove={moveItem}
            ref={handleRef}
          />
        ) : null}
        {!isEditing ? (
          <ContentRow
            size="xs"
            xstyle={[styles.view, displayMode === "icons" && styles.tileView, isActive && styles.active]}
          >
            <ContentRowContent xstyle={[styles.titleArea, displayMode === "icons" && styles.tileTitleArea]}>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger
                    render={
                      <a
                        aria-label={label}
                        title={label}
                        href={item.url}
                        onClick={isEditMode ? openEditor : undefined}
                        {...stylex.props(
                          styles.linkArea,
                          displayMode !== "icons" && (showBookmarkIcon ? styles.withIcon : styles.withoutIcon),
                          displayMode === "icons" && styles.tileContent,
                          displayMode === "icons" && iconMarker && styles.tileMarkerContent,
                        )}
                      >
                        {showBookmarkIcon ? (
                          <ItemIcon
                            icon={icon}
                            label={label}
                            marker={iconMarker}
                            size={displayMode === "icons" ? "grid" : "default"}
                          />
                        ) : null}
                        {!hideTitle ? (
                          <span
                            title={label}
                            {...stylex.props(
                              styles.link,
                              Boolean(domain) && styles.labelWithUrl,
                              displayMode === "icons" && iconMode === "original" && styles.tileLabel,
                              displayMode === "icons" && !iconMarker && styles.tileLink,
                            )}
                          >
                            {domain ? (
                              <>
                                <span {...stylex.props(styles.titleText)}>{label}</span>
                                <span {...stylex.props(styles.domain)}>· {domain}</span>
                              </>
                            ) : (
                              label
                            )}
                          </span>
                        ) : null}
                      </a>
                    }
                  />
                  {hideTitle ? <TooltipContent>{label}</TooltipContent> : null}
                </Tooltip>
              </TooltipProvider>
            </ContentRowContent>
            <ContentRowActions
              xstyle={[styles.actions, styles.actionVisibility, displayMode === "icons" && styles.floatingActions]}
            >
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <Button variant="ghost" size="icon-xs" aria-label={`${label} ${UI_LANGUAGE.settings.actions}`}>
                      {displayMode === "icons" ? (
                        <DotsThreeVerticalIcon weight="bold" aria-hidden="true" {...stylex.props(styles.menuIcon)} />
                      ) : (
                        <DotsThreeIcon weight="bold" aria-hidden="true" {...stylex.props(styles.menuIcon)} />
                      )}
                    </Button>
                  }
                />
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={openEditor}>
                    <PencilSimpleIcon aria-hidden="true" />
                    {UI_LANGUAGE.bookmark.edit}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={deleteItem}>
                    <TrashSimpleIcon aria-hidden="true" />
                    {UI_LANGUAGE.bookmark.remove}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </ContentRowActions>
          </ContentRow>
        ) : null}
        {isEditing ? (
          <InputGroup
            invalid={!isUrlValid}
            xstyle={[editorStyles.group, editorStyles.inputGroup, !isUrlValid && editorStyles.invalid]}
          >
            <form
              {...stylex.props(
                styles.form,
                showBookmarkIcon && styles.formWithIcon,
                displayMode === "icons" && styles.tileForm,
                displayMode === "icons" && iconMarker && styles.tileMarkerForm,
              )}
              data-inline-bookmark-editor=""
              data-bookmark-draft=""
              onSubmit={handleSubmit}
            >
              {showBookmarkIcon ? (
                <div
                  {...stylex.props(styles.editIcon, displayMode === "icons" && styles.tileEditIcon)}
                  data-bookmark-edit-icon=""
                >
                  <ItemIcon
                    icon={icon}
                    label={label}
                    marker={iconMarker}
                    size={displayMode === "icons" ? "grid" : "default"}
                  />
                </div>
              ) : null}
              <div {...stylex.props(editorStyles.fields)}>
                <Input
                  variant="inline"
                  aria-label={UI_LANGUAGE.bookmark.title}
                  xstyle={styles.input}
                  ref={titleInputRef}
                  value={editor.inlineTitle}
                  onChange={(e) => editor.setInlineTitle(e.target.value)}
                />
                <Field invalid={!isUrlValid}>
                  <Input
                    variant="inline"
                    aria-label={UI_LANGUAGE.bookmark.url}
                    aria-describedby={isUrlValid ? undefined : urlErrorId}
                    aria-invalid={!isUrlValid}
                    xstyle={styles.input}
                    title={isUrlValid ? undefined : UI_LANGUAGE.bookmark.invalidUrl}
                    value={editor.inlineUrl}
                    onChange={(e) => editor.setInlineUrl(e.target.value)}
                  />
                  {!isUrlValid ? (
                    <FieldError match={true} id={urlErrorId} role="alert">
                      {UI_LANGUAGE.bookmark.invalidUrl}
                    </FieldError>
                  ) : null}
                </Field>
              </div>
              <ButtonGroup xstyle={[editorStyles.actions, displayMode === "icons" && styles.tileEditActions]}>
                <Button
                  aria-label={UI_LANGUAGE.bookmark.save}
                  disabled={!isUrlValid}
                  size="icon-sm"
                  title={UI_LANGUAGE.bookmark.save}
                  variant="ghost"
                  onMouseDown={stopInteraction}
                  onClick={(e) => {
                    stopInteraction(e);
                    void editor.updateCurrentInlineEditor();
                  }}
                >
                  <CheckIcon {...stylex.props(styles.icon)} />
                </Button>
                <Button
                  aria-label={UI_LANGUAGE.bookmark.cancel}
                  size="icon-sm"
                  title={UI_LANGUAGE.bookmark.cancel}
                  variant="ghost"
                  type="button"
                  onMouseDown={stopInteraction}
                  onClick={editor.cancelInlineEditor}
                >
                  <XIcon {...stylex.props(styles.icon)} />
                </Button>
              </ButtonGroup>
              {editor.hasSaveError ? <SaveError /> : null}
            </form>
          </InputGroup>
        ) : null}
      </div>
    </div>
  );
}
