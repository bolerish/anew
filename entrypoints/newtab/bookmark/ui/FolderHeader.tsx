import {
  GlobeIcon,
  CircleIcon,
  MinusIcon,
  ListIcon,
  SquaresFourIcon,
  DotsThreeIcon,
  CheckIcon,
  PencilSimpleIcon,
  TrashSimpleIcon,
  XIcon,
} from "@phosphor-icons/react";
import * as stylex from "@stylexjs/stylex";
import { useEffect, useRef, type Ref, type SubmitEvent, type MouseEvent } from "react";
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
import { AccordionTrigger } from "~shared/ui/accordion";
import { Button } from "~shared/ui/button";
import { ButtonGroup } from "~shared/ui/button-group";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuGroup,
  DropdownMenuCheckboxItem,
  DropdownMenuSeparator,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "~shared/ui/dropdown-menu";
import { Input } from "~shared/ui/input";

import { setFolderView, setFolderDisplay } from "../../settings/bookmark/model/settings";
import { deleteFolder as deleteBookmarkFolder } from "../api/update";
import { resolveBookmarkView } from "../lib/item-view";
import { useBookmarkContext } from "../model/Provider";
import { isRootBookmarkFolder, type BookmarkFolder } from "../model/types";
import { DragHandle } from "./DragHandle";
import { editorStyles } from "./editor-styles";
import { SaveError } from "./SaveError";

const styles = stylex.create({
  icon: { width: sizeVars.iconMd, height: sizeVars.iconMd },
  menuIcon: { width: sizeVars.iconLg, height: sizeVars.iconLg },
  actions: {
    alignSelf: "center",
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: spacingVars.space1,
  },
  input: { minWidth: 0, width: "100%", flexGrow: 1 },
  titleRow: {
    display: "flex",
    minWidth: 0,
    alignItems: "center",
    gap: spacingVars.space2,
    color: colorVars.fgSecondary,
    fontFamily: typographyVars.fontFamilyBody,
    fontSize: `calc(${typographyVars.fontSizeSm} * var(--mds-heading-scale, 1))`,
    fontWeight: typographyVars.fontWeightRegular,
    lineHeight: typographyVars.lineHeightNormal,
  },
  titleButton: {
    appearance: "none",
    padding: 0,
    borderWidth: 0,
    borderStyle: "none",
    outline: "none",
    ":focus-visible": {
      outlineWidth: sizeVars.focusRing,
      outlineStyle: "solid",
      outlineColor: colorVars.strokeFocus,
      outlineOffset: sizeVars.stroke,
    },
    backgroundColor: "transparent",
    textAlign: "start",
    cursor: "pointer",
    flexGrow: 1,
    minWidth: 0,
  },

  title: {
    paddingInline: spacingVars.space1,
    fontWeight: "inherit",
    color: colorVars.fgSecondary,
    fontFamily: typographyVars.fontFamilyBody,
    fontSize: `calc(${typographyVars.fontSizeSm} * var(--mds-heading-scale, 1))`,
    lineHeight: typographyVars.lineHeightNormal,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  actionVisibility: {
    opacity: { default: "var(--bookmark-actions-opacity, 0)", ":focus-within": 1 },
    pointerEvents: { default: "var(--bookmark-actions-pointer-events, none)" as "auto", ":focus-within": "auto" },
    transitionProperty: "opacity",
    transitionDuration: motionVars.durationFast,
  },
  header: {
    position: "relative",
    marginInline: 0,
    display: "grid",
    gridTemplateColumns: "minmax(0,1fr) auto",
    alignItems: "center",
    gap: spacingVars.space2,
    borderBottomWidth: 0,
    borderRadius: radiusVars.sm,
    "--bookmark-actions-pointer-events": { default: "none", ":hover": "auto", ":focus-within": "auto" },
    "--bookmark-actions-opacity": { default: 0, ":hover": 1, ":focus-within": 1 },
    ":hover": { backgroundColor: colorVars.interactionHover },
  },
  contents: { display: "contents" },
  folderToggle: {
    width: sizeVars.controlSm,
    flexShrink: 0,
    margin: 0,
  },
});

type FolderHeaderProps = {
  folder: BookmarkFolder;
  handleRef: Ref<HTMLButtonElement>;
  isDragging: boolean;
  onMove: (direction: "down" | "up") => void;
};

export function FolderHeader({ folder, handleRef, isDragging, onMove }: FolderHeaderProps) {
  const UI_LANGUAGE = useLanguage();
  const toggleRef = useRef<HTMLButtonElement | null>(null);
  const titleInputRef = useRef<HTMLInputElement | null>(null);
  const { editor, folderViews, folderDisplays, bookmarkIconMode, defaultView, isEditMode } = useBookmarkContext();
  const display = folderDisplays?.[folder.id] ?? { icon: bookmarkIconMode, showTitle: true };
  const view = resolveBookmarkView(display.icon, folderViews[folder.id] ?? defaultView);
  const canModify = !isRootBookmarkFolder(folder);
  const isEditing = editor.inlineEditingBookmark?.kind === "folder" && editor.inlineEditingBookmark.id === folder.id;

  function openEditor(event: MouseEvent<HTMLButtonElement>) {
    stopInteraction(event);
    editor.openInlineFolderEditor(folder);
  }

  async function handleSubmit(event: SubmitEvent) {
    event.preventDefault();
    await editor.updateCurrentInlineEditor();
  }

  const folderToggle = (
    <AccordionTrigger
      data-folder-trigger=""
      size="sm"
      aria-label={`${folder.displayTitle} ${UI_LANGUAGE.bookmark.toggleFolder}`}
      ref={toggleRef}
      xstyle={styles.folderToggle}
      type="button"
    />
  );

  function deleteFolder() {
    void deleteBookmarkFolder(folder).catch(notifyError);
  }

  useEffect(() => {
    if (!isEditing) return;

    titleInputRef.current?.focus();
    titleInputRef.current?.select();
  }, [isEditing]);

  return (
    <header {...stylex.props(styles.header, isEditing && editorStyles.group)}>
      {!isEditing ? (
        <DragHandle
          kind="folder"
          isDragging={isDragging}
          label={UI_LANGUAGE.bookmark.moveFolder}
          onMove={onMove}
          ref={handleRef}
        />
      ) : null}
      {isEditing && canModify ? (
        <form
          {...stylex.props(styles.contents)}
          data-inline-bookmark-editor=""
          data-bookmark-draft=""
          onSubmit={handleSubmit}
        >
          <div {...stylex.props(styles.titleRow)}>
            {folderToggle}
            <Input
              variant="inline"
              aria-label={UI_LANGUAGE.bookmark.renameFolder}
              xstyle={styles.input}
              ref={titleInputRef}
              value={editor.inlineTitle}
              onChange={(e) => editor.setInlineTitle(e.target.value)}
            />
          </div>
          <ButtonGroup xstyle={editorStyles.actions}>
            <Button
              aria-label={UI_LANGUAGE.bookmark.saveFolder}
              size="icon-sm"
              title={UI_LANGUAGE.bookmark.saveFolder}
              type="button"
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
              type="button"
              variant="ghost"
              onMouseDown={stopInteraction}
              onClick={(e) => {
                stopInteraction(e);
                editor.cancelInlineEditor();
              }}
            >
              <XIcon {...stylex.props(styles.icon)} />
            </Button>
          </ButtonGroup>
          {editor.hasSaveError ? <SaveError /> : null}
        </form>
      ) : (
        <>
          <div {...stylex.props(styles.titleRow)}>
            {folderToggle}
            <button
              data-folder-trigger=""
              type="button"
              {...stylex.props(styles.titleButton)}
              onClick={(e) => {
                if (isEditMode && canModify) openEditor(e);
                else toggleRef.current?.click();
              }}
            >
              <span {...stylex.props(styles.title)}>{folder.displayTitle}</span>
            </button>
          </div>
          <div {...stylex.props(styles.actions, styles.actionVisibility)}>
            {canModify ? (
              <>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label={UI_LANGUAGE.bookmark.renameFolder}
                  title={UI_LANGUAGE.bookmark.renameFolder}
                  onClick={openEditor}
                >
                  <PencilSimpleIcon {...stylex.props(styles.icon)} aria-hidden="true" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label={UI_LANGUAGE.bookmark.removeFolder}
                  title={UI_LANGUAGE.bookmark.removeFolder}
                  onClick={deleteFolder}
                >
                  <TrashSimpleIcon {...stylex.props(styles.icon)} aria-hidden="true" />
                </Button>
              </>
            ) : null}
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button variant="ghost" size="icon-sm" aria-label={UI_LANGUAGE.settings.folderOptions}>
                    <DotsThreeIcon weight="bold" aria-hidden="true" {...stylex.props(styles.menuIcon)} />
                  </Button>
                }
              />
              <DropdownMenuContent>
                <DropdownMenuRadioGroup
                  value={view}
                  onValueChange={(value) => {
                    if (value === "list" || value === "icons") void setFolderView(folder.id, value);
                  }}
                >
                  <DropdownMenuLabel>{UI_LANGUAGE.settings.viewOptions}</DropdownMenuLabel>
                  <DropdownMenuRadioItem value="list">
                    <ListIcon aria-hidden="true" />
                    {UI_LANGUAGE.settings.listView}
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="icons" disabled={display.icon !== "original"}>
                    <SquaresFourIcon aria-hidden="true" />
                    {UI_LANGUAGE.settings.iconView}
                  </DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
                <DropdownMenuSeparator />
                <DropdownMenuRadioGroup
                  value={display.icon}
                  onValueChange={(icon) => {
                    if (icon === "original" || icon === "square" || icon === "dash" || icon === "none")
                      void setFolderDisplay(folder.id, { ...display, icon });
                  }}
                >
                  <DropdownMenuLabel>{UI_LANGUAGE.settings.icons}</DropdownMenuLabel>
                  {(
                    [
                      ["original", UI_LANGUAGE.settings.websiteIcon, GlobeIcon],
                      ["square", UI_LANGUAGE.settings.square, CircleIcon],
                      ["dash", UI_LANGUAGE.settings.dash, MinusIcon],
                      ["none", UI_LANGUAGE.settings.none, null],
                    ] as const
                  ).map(([value, label, Icon]) => (
                    <DropdownMenuRadioItem key={value} value={value}>
                      {Icon ? <Icon aria-hidden="true" weight={value === "square" ? "fill" : "regular"} /> : null}
                      {label}
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
                {view === "icons" ? (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuGroup>
                      <DropdownMenuLabel>{UI_LANGUAGE.settings.displayOptions}</DropdownMenuLabel>
                      <DropdownMenuCheckboxItem
                        checked={display.showTitle}
                        onCheckedChange={(showTitle) => void setFolderDisplay(folder.id, { ...display, showTitle })}
                      >
                        {UI_LANGUAGE.settings.showTitle}
                      </DropdownMenuCheckboxItem>
                    </DropdownMenuGroup>
                  </>
                ) : null}
                {view === "list" ? (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuGroup>
                      <DropdownMenuLabel>{UI_LANGUAGE.settings.displayOptions}</DropdownMenuLabel>
                      <DropdownMenuCheckboxItem
                        checked={display.showUrl ?? false}
                        onCheckedChange={(showUrl) => void setFolderDisplay(folder.id, { ...display, showUrl })}
                      >
                        {UI_LANGUAGE.settings.showUrl}
                      </DropdownMenuCheckboxItem>
                    </DropdownMenuGroup>
                  </>
                ) : null}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </>
      )}
    </header>
  );
}
