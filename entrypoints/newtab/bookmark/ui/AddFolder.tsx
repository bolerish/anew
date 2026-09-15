import { monitorForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { CheckIcon, XIcon } from "@phosphor-icons/react";
import * as stylex from "@stylexjs/stylex";
import { useEffect, useState, type KeyboardEvent } from "react";
import { stopInteraction } from "~shared/lib/event";
import { useLanguage } from "~shared/lib/preferences";
import { spacingVars, sizeVars, typographyVars, motionVars } from "~shared/styles/semantic.stylex";
import { Button } from "~shared/ui/button";
import { ButtonGroup } from "~shared/ui/button-group";
import { Collapsible, CollapsibleContent, CollapsiblePanel } from "~shared/ui/collapsible";
import { Input } from "~shared/ui/input";

import { isFolderDragData } from "../lib/dnd";
import { useBookmarkContext } from "../model/Provider";
import { useAddFolder } from "../model/useAddFolder";
import { useFormFocus } from "../model/useFormFocus";
import { editorStyles } from "./editor-styles";
import { SaveError } from "./SaveError";

const styles = stylex.create({
  icon: { width: sizeVars.iconMd, height: sizeVars.iconMd },
  fullWidth: { width: "100%" },
  input: { minWidth: 0, width: "100%", flexGrow: 1 },
  collapseContent: { padding: 0 },
  root: {
    overflow: "clip",
    marginInlineStart: sizeVars.controlSm,
    marginInlineEnd: spacingVars.space4,
    marginBlock: spacingVars.space1,
    height: sizeVars.controlSm,
    transitionProperty: "height, opacity",
    transitionDuration: motionVars.durationFast,
  },
  expanded: { height: "auto", overflow: "visible" },
  hidden: {
    height: spacingVars.space2,
    opacity: 0,
    ":hover": { opacity: 1, height: sizeVars.controlSm },
    ":focus-within": { opacity: 1, height: sizeVars.controlSm },
  },
  form: {
    fontFamily: typographyVars.fontFamilyBody,
    fontSize: `calc(${typographyVars.fontSizeSm} * var(--mds-heading-scale, 1))`,
    display: "grid",
    gridTemplateColumns: "minmax(0,1fr) auto",
    alignItems: "center",
    gap: spacingVars.space2,
  },
  line: { height: sizeVars.stroke, flexGrow: 1, backgroundColor: "currentColor" },
});

type AddFolderProps = {
  alwaysVisible?: boolean;
  index?: number;
  parentId: string;
};

export function AddFolder({ alwaysVisible = false, index, parentId }: AddFolderProps) {
  const UI_LANGUAGE = useLanguage();
  const { onBookmarksChange } = useBookmarkContext();
  const form = useAddFolder({ index, parentId, onCreated: onBookmarksChange });
  const [isHovered, setIsHovered] = useState(false);
  const [isFolderDragging, setIsFolderDragging] = useState(false);
  useEffect(
    () =>
      monitorForElements({
        canMonitor: ({ source }) => isFolderDragData(source.data),
        onDragStart: () => {
          setIsHovered(false);
          setIsFolderDragging(true);
        },
        onDrop: () => setIsFolderDragging(false),
      }),
    [],
  );
  const focus = useFormFocus({
    onClose: form.closeForm,
    isOpen: form.isAdding,
  });

  function handleInputKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key !== "Escape") {
      return;
    }

    stopInteraction(e);
    form.closeForm();
  }

  return (
    <div
      hidden={isFolderDragging}
      {...stylex.props(
        styles.root,
        form.isAdding && styles.expanded,
        !(form.isAdding || alwaysVisible || isHovered) && styles.hidden,
      )}
      onPointerMove={() => setIsHovered(true)}
      onPointerLeave={() => setIsHovered(false)}
    >
      <Collapsible open={!form.isAdding}>
        <CollapsiblePanel>
          <CollapsibleContent xstyle={styles.collapseContent}>
            <Button
              xstyle={styles.fullWidth}
              align="start"
              size="sm"
              type="button"
              variant="ghost"
              data-add-folder={parentId}
              onClick={form.openForm}
            >
              <span aria-hidden="true" {...stylex.props(styles.line)} />
              {UI_LANGUAGE.bookmark.addFolder}
              <span aria-hidden="true" {...stylex.props(styles.line)} />
            </Button>
          </CollapsibleContent>
        </CollapsiblePanel>
      </Collapsible>
      <Collapsible open={form.isAdding}>
        <CollapsiblePanel>
          <CollapsibleContent xstyle={styles.collapseContent}>
            <form
              {...stylex.props(styles.form, editorStyles.group)}
              ref={focus.formRef}
              data-bookmark-draft={form.isAdding ? "" : undefined}
              aria-busy={form.isSaving}
              onSubmit={form.handleSubmit}
            >
              <Input
                variant="inline"
                aria-label={UI_LANGUAGE.bookmark.folderName}
                xstyle={styles.input}
                placeholder={UI_LANGUAGE.bookmark.folderName}
                ref={focus.inputRef}
                value={form.title}
                onKeyDown={handleInputKeyDown}
                onChange={(e) => form.setTitle(e.target.value)}
              />
              <ButtonGroup xstyle={editorStyles.actions}>
                <Button
                  aria-label={UI_LANGUAGE.bookmark.save}
                  disabled={!form.canSave}
                  size="icon-sm"
                  title={UI_LANGUAGE.bookmark.save}
                  type="submit"
                  variant="ghost"
                >
                  <CheckIcon {...stylex.props(styles.icon)} />
                </Button>
                <Button
                  aria-label={UI_LANGUAGE.bookmark.cancel}
                  size="icon-sm"
                  title={UI_LANGUAGE.bookmark.cancel}
                  type="button"
                  variant="ghost"
                  onClick={form.closeForm}
                >
                  <XIcon {...stylex.props(styles.icon)} />
                </Button>
              </ButtonGroup>
              {form.hasSaveError ? <SaveError /> : null}
            </form>
          </CollapsibleContent>
        </CollapsiblePanel>
      </Collapsible>
    </div>
  );
}
