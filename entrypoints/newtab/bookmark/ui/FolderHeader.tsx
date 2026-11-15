import { colorVars, spacingVars, sizeVars, radiusVars, motionVars, typo } from "@bolerish/tokens/semantic.stylex";
import { AccordionTrigger } from "@bolerish/ui/accordion";
import { Button } from "@bolerish/ui/button";
import { ButtonGroup } from "@bolerish/ui/button-group";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuGroup,
  DropdownMenuCheckboxItem,
  DropdownMenuSeparator,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@bolerish/ui/dropdown-menu";
import { Input } from "@bolerish/ui/input";
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
import { useEffect, useRef, type ComponentProps, type Ref, type SubmitEvent, type MouseEvent } from "react";
import { stopInteraction } from "~shared/lib/event";
import { notifyError } from "~shared/lib/notify-error";
import { useLanguage } from "~shared/lib/preferences";
import { inputFocusStyles } from "~shared/styles/input-focus";

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
  dotPreview: { transform: "scale(0.25)" },
  menuIcon: { width: sizeVars.iconLg, height: sizeVars.iconLg },
  menuPreview: {
    position: "absolute",
    insetInlineStart: spacingVars.space2,
    width: sizeVars.iconMd,
    height: sizeVars.iconMd,
  },
  menuCheck: {
    marginInlineStart: "auto",
    flexShrink: 0,
    width: sizeVars.iconMd,
    height: sizeVars.iconMd,
  },
  menuCheckHidden: { visibility: "hidden" },
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
    fontFamily: typo.fontFamilyHeading,
    fontSize: `calc(${typo.fontSizeSm} / var(--mds-content-scale, 1) * var(--mds-heading-scale, 1))`,
    fontWeight: typo.fontWeightRegular,
    lineHeight: typo.lineHeightNormal,
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
    fontFamily: typo.fontFamilyHeading,
    fontSize: `calc(${typo.fontSizeSm} / var(--mds-content-scale, 1) * var(--mds-heading-scale, 1))`,
    lineHeight: typo.lineHeightNormal,
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

  function openEditor(event: MouseEvent<HTMLElement>) {
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
      aria-label={`${folder.displayTitle} ${UI_LANGUAGE.bookmark.toggleFolder}`}
      ref={toggleRef}
      style={{ minHeight: sizeVars.controlMd, paddingBlock: 0 }}
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
    <header {...stylex.props(styles.header, isEditing && [editorStyles.group, inputFocusStyles.underline])}>
      {!isEditing ? (
        <DragHandle
          kind="folder"
          isDragging={isDragging}
          isEditMode={isEditMode}
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
              aria-label={UI_LANGUAGE.bookmark.folderName}
              xstyle={styles.input}
              style={{ fontSize: typo.fontSizeSm }}
              ref={titleInputRef}
              value={editor.inlineTitle}
              onChange={(e) => editor.setInlineTitle(e.target.value)}
            />
          </div>
          <ButtonGroup xstyle={editorStyles.actions}>
            <Button
              aria-label={UI_LANGUAGE.bookmark.saveFolder}
              size="icon"
              style={{ height: sizeVars.controlSm, width: sizeVars.controlSm }}
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
              size="icon"
              style={{ height: sizeVars.controlSm, width: sizeVars.controlSm }}
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
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button
                    variant="ghost"
                    size="icon"
                    style={{ height: sizeVars.controlSm, width: sizeVars.controlSm }}
                    aria-label={UI_LANGUAGE.settings.folderOptions}
                  >
                    <DotsThreeIcon weight="bold" aria-hidden="true" {...stylex.props(styles.menuIcon)} />
                  </Button>
                }
              />
              <DropdownMenuContent>
                {canModify ? (
                  <>
                    <DropdownMenuItem onClick={openEditor}>
                      <PencilSimpleIcon aria-hidden="true" />
                      {UI_LANGUAGE.bookmark.edit}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </>
                ) : null}
                <DropdownMenuRadioGroup
                  value={view}
                  onValueChange={(value) => {
                    if (value === "list" || value === "icons") void setFolderView(folder.id, value);
                  }}
                >
                  <DropdownMenuLabel>{UI_LANGUAGE.settings.viewOptions}</DropdownMenuLabel>
                  <FolderMenuRadioItem value="list">
                    <ListIcon aria-hidden="true" {...stylex.props(styles.menuPreview)} />
                    {UI_LANGUAGE.settings.listView}
                  </FolderMenuRadioItem>
                  <FolderMenuRadioItem value="icons" disabled={display.icon !== "original"}>
                    <SquaresFourIcon aria-hidden="true" {...stylex.props(styles.menuPreview)} />
                    {UI_LANGUAGE.settings.iconView}
                  </FolderMenuRadioItem>
                </DropdownMenuRadioGroup>
                <DropdownMenuSeparator />
                <DropdownMenuRadioGroup
                  value={display.icon}
                  onValueChange={(icon) => {
                    if (icon === "original" || icon === "dot" || icon === "dash" || icon === "none")
                      void setFolderDisplay(folder.id, { ...display, icon });
                  }}
                >
                  <DropdownMenuLabel>{UI_LANGUAGE.settings.icons}</DropdownMenuLabel>
                  {(
                    [
                      ["original", UI_LANGUAGE.settings.websiteIcon, GlobeIcon],
                      ["dot", UI_LANGUAGE.settings.dot, CircleIcon],
                      ["dash", UI_LANGUAGE.settings.dash, MinusIcon],
                      ["none", UI_LANGUAGE.settings.none, null],
                    ] as const
                  ).map(([value, label, Icon]) => (
                    <FolderMenuRadioItem key={value} value={value}>
                      {Icon ? (
                        <Icon
                          aria-hidden="true"
                          weight={value === "dot" ? "fill" : "regular"}
                          {...stylex.props(styles.menuPreview, value === "dot" && styles.dotPreview)}
                        />
                      ) : null}
                      {label}
                    </FolderMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
                {view === "icons" ? (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuGroup>
                      <DropdownMenuLabel>{UI_LANGUAGE.settings.displayOptions}</DropdownMenuLabel>
                      <FolderMenuCheckboxItem
                        checked={display.showTitle}
                        onCheckedChange={(showTitle) => void setFolderDisplay(folder.id, { ...display, showTitle })}
                      >
                        {UI_LANGUAGE.settings.showTitle}
                      </FolderMenuCheckboxItem>
                    </DropdownMenuGroup>
                  </>
                ) : null}
                {view === "list" ? (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuGroup>
                      <DropdownMenuLabel>{UI_LANGUAGE.settings.displayOptions}</DropdownMenuLabel>
                      <FolderMenuCheckboxItem
                        checked={display.showUrl ?? false}
                        onCheckedChange={(showUrl) => void setFolderDisplay(folder.id, { ...display, showUrl })}
                      >
                        {UI_LANGUAGE.settings.showUrl}
                      </FolderMenuCheckboxItem>
                    </DropdownMenuGroup>
                  </>
                ) : null}
                {canModify ? (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={deleteFolder}>
                      <TrashSimpleIcon aria-hidden="true" />
                      {UI_LANGUAGE.bookmark.removeFolder}
                    </DropdownMenuItem>
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

// Replace the DS's fixed left indicator through its public render API,
// retaining its styles, interaction handlers, ref and accessibility attributes.
function FolderMenuRadioItem({ children, ...props }: Omit<ComponentProps<typeof DropdownMenuRadioItem>, "render">) {
  return (
    <DropdownMenuRadioItem
      {...props}
      render={(itemProps, { checked }) => (
        <div {...itemProps}>
          {children}
          <CheckIcon aria-hidden="true" {...stylex.props(styles.menuCheck, !checked && styles.menuCheckHidden)} />
        </div>
      )}
    />
  );
}

function FolderMenuCheckboxItem({
  children,
  ...props
}: Omit<ComponentProps<typeof DropdownMenuCheckboxItem>, "render">) {
  return (
    <DropdownMenuCheckboxItem
      {...props}
      render={(itemProps, { checked }) => (
        <div {...itemProps}>
          {children}
          <CheckIcon aria-hidden="true" {...stylex.props(styles.menuCheck, !checked && styles.menuCheckHidden)} />
        </div>
      )}
    />
  );
}
