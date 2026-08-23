import { CheckIcon, XIcon } from "@phosphor-icons/react";
import { useId, type KeyboardEvent } from "react";
import { stopInteraction } from "~shared/lib/event";
import { UI_LANGUAGE } from "~shared/lib/language";
import { Button } from "~shared/ui/button";
import { Collapsible, CollapsibleContent } from "~shared/ui/collapsible";
import { Input } from "~shared/ui/input";

import type { useAddForm } from "../model/useAddForm";
import { useFormFocus } from "../model/useFormFocus";

type AddFormProps = {
  form: ReturnType<typeof useAddForm>;
};

export function AddForm({ form }: AddFormProps) {
  const focus = useFormFocus({
    isOpen: form.isAddingBookmark,
    onOutsidePointerDown: form.closeForm,
  });
  const hasUrlError = form.url.trim().length > 0 && !form.isUrlValid;
  const urlErrorId = useId();

  function handleInputKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key !== "Escape") {
      return;
    }

    stopInteraction(event);
    form.closeForm();
  }

  return (
    <Collapsible open={form.isAddingBookmark}>
      <CollapsibleContent>
        <form
          className="border-border mb-2 ml-6 grid min-w-0 grid-cols-[minmax(0,1fr)_auto] items-start gap-x-2 gap-y-1 border-b pb-2 pl-2"
          ref={focus.formRef}
          onSubmit={form.handleSubmit}
        >
          <div className="grid min-w-0 gap-2">
            <Input
              aria-label={UI_LANGUAGE.bookmark.label.title}
              className="text-mds-bookmark-item placeholder:text-mds-shortcut-label md:text-mds-bookmark-item h-7 rounded-none border-0 bg-transparent px-0 font-normal caret-current placeholder:font-mono focus-visible:ring-0"
              ref={focus.inputRef}
              value={form.title}
              onKeyDown={handleInputKeyDown}
              onChange={(event) => form.setTitle(event.target.value)}
              placeholder={UI_LANGUAGE.bookmark.placeholder.title}
            />
            <Input
              aria-label={UI_LANGUAGE.bookmark.label.url}
              aria-describedby={hasUrlError ? urlErrorId : undefined}
              aria-invalid={hasUrlError}
              className="text-mds-bookmark-item placeholder:text-mds-shortcut-label md:text-mds-bookmark-item h-7 rounded-none border-0 bg-transparent px-0 font-normal caret-current placeholder:font-mono focus-visible:ring-0"
              value={form.url}
              onKeyDown={handleInputKeyDown}
              onChange={(event) => form.setUrl(event.target.value)}
              placeholder={UI_LANGUAGE.bookmark.placeholder.url}
              title={hasUrlError ? UI_LANGUAGE.bookmark.error.invalidUrl : undefined}
            />
            {hasUrlError ? (
              <p className="text-destructive text-mds-caption" id={urlErrorId} role="alert">
                {UI_LANGUAGE.bookmark.error.invalidUrl}
              </p>
            ) : null}
          </div>
          <div className="flex h-7 items-center justify-end gap-0">
            <Button
              aria-label={UI_LANGUAGE.bookmark.action.save}
              className="text-muted-foreground hover:text-muted-foreground hover:bg-transparent"
              disabled={!form.canSave}
              size="icon-sm"
              title={UI_LANGUAGE.bookmark.action.save}
              type="submit"
              variant="ghost"
              onMouseDown={stopInteraction}
            >
              <CheckIcon className="h-4 w-4" />
            </Button>
            <Button
              aria-label={UI_LANGUAGE.bookmark.action.cancel}
              className="text-muted-foreground hover:text-muted-foreground hover:bg-transparent"
              size="icon-sm"
              title={UI_LANGUAGE.bookmark.action.cancel}
              variant="ghost"
              onMouseDown={stopInteraction}
              onClick={(event) => {
                stopInteraction(event);
                form.closeForm();
              }}
            >
              <XIcon className="h-4 w-4" />
            </Button>
          </div>
        </form>
      </CollapsibleContent>
    </Collapsible>
  );
}
