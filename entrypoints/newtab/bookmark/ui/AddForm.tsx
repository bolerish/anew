import { colorVars, spacingVars, sizeVars } from "@bolerish/tokens/semantic.stylex";
import { Button } from "@bolerish/ui/button";
import { ButtonGroup } from "@bolerish/ui/button-group";
import { Collapsible, CollapsibleContent, CollapsiblePanel } from "@bolerish/ui/collapsible";
import { Field, FieldError } from "@bolerish/ui/field";
import { Input } from "@bolerish/ui/input";
import { InputGroup } from "@bolerish/ui/input-group";
import { CheckIcon, XIcon, GlobeIcon, CircleIcon } from "@phosphor-icons/react";
import * as stylex from "@stylexjs/stylex";
import { useId, type KeyboardEvent } from "react";
import { stopInteraction } from "~shared/lib/event";
import { useLanguage } from "~shared/lib/preferences";
import { inputFocusStyles } from "~shared/styles/input-focus";

import { useBookmarkContext } from "../model/Provider";
import type { useAddForm } from "../model/useAddForm";
import { useFormFocus } from "../model/useFormFocus";
import { editorStyles } from "./editor-styles";
import { SaveError } from "./SaveError";

const styles = stylex.create({
  dot: { width: spacingVars.space1, height: spacingVars.space1 },
  icon: { width: sizeVars.iconMd, height: sizeVars.iconMd },
  input: { minWidth: 0, width: "100%", flexGrow: 1 },
  collapseContent: { padding: 0 },
  withIcon: { gridTemplateColumns: "auto minmax(0,1fr) auto" },
  iconSlot: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: sizeVars.iconLg,
    height: sizeVars.controlMd,
    color: colorVars.fgSecondary,
  },
  form: {
    width: "100%",
    display: "grid",
    gridTemplateColumns: "minmax(0,1fr) auto",
    alignItems: "start",
    gap: spacingVars.space2,
    paddingInline: spacingVars.space2,
  },
});

type AddFormProps = {
  form: ReturnType<typeof useAddForm>;
};

export function AddForm({ form }: AddFormProps) {
  const UI_LANGUAGE = useLanguage();
  const { bookmarkIconMode: defaultIconMode, folderDisplays } = useBookmarkContext();
  const bookmarkIconMode = (form.parentId ? folderDisplays?.[form.parentId]?.icon : undefined) ?? defaultIconMode;
  const showIcon = bookmarkIconMode !== "none";
  const focus = useFormFocus({
    onClose: form.closeForm,
    isOpen: form.isAddingBookmark,
  });
  const hasUrlError = form.url.trim().length > 0 && !form.isUrlValid;
  const urlErrorId = useId();

  function handleInputKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key !== "Escape") {
      return;
    }

    stopInteraction(e);
    form.closeForm();
  }

  return (
    <Collapsible open={form.isAddingBookmark}>
      <CollapsiblePanel>
        <CollapsibleContent xstyle={styles.collapseContent}>
          <InputGroup
            className={stylex.props(inputFocusStyles.underline).className}
            invalid={hasUrlError}
            xstyle={[editorStyles.group, editorStyles.inputGroup, hasUrlError && editorStyles.invalid]}
          >
            <form
              {...stylex.props(styles.form, showIcon && styles.withIcon)}
              ref={focus.formRef}
              data-bookmark-draft={form.isAddingBookmark ? "" : undefined}
              aria-busy={form.isSaving}
              onSubmit={form.handleSubmit}
            >
              {showIcon ? (
                <div aria-hidden="true" {...stylex.props(styles.iconSlot)}>
                  {bookmarkIconMode === "original" ? (
                    <GlobeIcon {...stylex.props(styles.icon)} />
                  ) : (
                    <span>
                      {bookmarkIconMode === "dot" ? (
                        <CircleIcon aria-hidden="true" weight="fill" {...stylex.props(styles.dot)} />
                      ) : (
                        "—"
                      )}
                    </span>
                  )}
                </div>
              ) : null}
              <div {...stylex.props(editorStyles.fields)}>
                <Input
                  variant="inline"
                  aria-label={UI_LANGUAGE.bookmark.title}
                  xstyle={styles.input}
                  ref={focus.inputRef}
                  value={form.title}
                  onKeyDown={handleInputKeyDown}
                  onChange={(e) => form.setTitle(e.target.value)}
                  placeholder={UI_LANGUAGE.bookmark.title}
                />
                <Field invalid={hasUrlError}>
                  <Input
                    variant="inline"
                    aria-label={UI_LANGUAGE.bookmark.url}
                    aria-describedby={hasUrlError ? urlErrorId : undefined}
                    aria-invalid={hasUrlError}
                    xstyle={styles.input}
                    value={form.url}
                    onKeyDown={handleInputKeyDown}
                    onChange={(e) => form.setUrl(e.target.value)}
                    placeholder={UI_LANGUAGE.bookmark.url}
                    title={hasUrlError ? UI_LANGUAGE.bookmark.invalidUrl : undefined}
                  />
                  {hasUrlError ? (
                    <FieldError match={true} id={urlErrorId} role="alert">
                      {UI_LANGUAGE.bookmark.invalidUrl}
                    </FieldError>
                  ) : null}
                </Field>
              </div>
              <ButtonGroup xstyle={editorStyles.actions}>
                <Button
                  aria-label={UI_LANGUAGE.bookmark.save}
                  disabled={!form.canSave}
                  size="icon"
                  style={{ height: sizeVars.controlSm, width: sizeVars.controlSm }}
                  title={UI_LANGUAGE.bookmark.save}
                  type="submit"
                  variant="ghost"
                  onMouseDown={stopInteraction}
                >
                  <CheckIcon {...stylex.props(styles.icon)} />
                </Button>
                <Button
                  type="button"
                  aria-label={UI_LANGUAGE.bookmark.cancel}
                  size="icon"
                  style={{ height: sizeVars.controlSm, width: sizeVars.controlSm }}
                  title={UI_LANGUAGE.bookmark.cancel}
                  variant="ghost"
                  onMouseDown={stopInteraction}
                  onClick={(e) => {
                    stopInteraction(e);
                    form.closeForm();
                  }}
                >
                  <XIcon {...stylex.props(styles.icon)} />
                </Button>
              </ButtonGroup>
              {form.hasSaveError ? <SaveError /> : null}
            </form>
          </InputGroup>
        </CollapsibleContent>
      </CollapsiblePanel>
    </Collapsible>
  );
}
