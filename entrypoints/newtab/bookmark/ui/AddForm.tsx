import { CheckIcon, XIcon } from "@phosphor-icons/react";
import { useId, type KeyboardEvent } from "react";
import { stopInteraction } from "~shared/lib/event";
import { UI_LANGUAGE } from "~shared/lib/language";
import { Button } from "~shared/ui/button";
import { Collapsible, CollapsibleContent } from "~shared/ui/collapsible";
import { Input } from "~shared/ui/input";

import type { useAddForm } from "../model/useAddForm";

type AddFormProps = {
  form: ReturnType<typeof useAddForm>;
  onCancel: () => void;
};

export function AddForm({ form, onCancel }: AddFormProps) {
  const hasUrlError = form.url.trim().length > 0 && !form.isUrlValid;
  const urlErrorId = useId();

  function handleInputKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key !== "Escape") {
      return;
    }

    stopInteraction(event);
    onCancel();
  }

  return (
    <Collapsible open={form.isAddingBookmark}>
      <CollapsibleContent className="collapsible-content">
        <form
          className="border-border grid grid-cols-[minmax(0,1fr)_auto_auto] items-start gap-x-2 gap-y-1 border-b p-1"
          onSubmit={form.handleSubmit}
        >
          <div className="grid min-w-0 gap-1">
            <Input
              aria-label={UI_LANGUAGE.bookmark.label.title}
              className="text-mds-bookmark-item placeholder:text-mds-shortcut-label h-7 rounded-none border-0 bg-transparent px-0 caret-current placeholder:font-mono focus-visible:ring-0"
              value={form.title}
              onKeyDown={handleInputKeyDown}
              onChange={(event) => form.setTitle(event.target.value)}
              placeholder={UI_LANGUAGE.bookmark.placeholder.title}
            />
            <Input
              aria-label={UI_LANGUAGE.bookmark.label.url}
              aria-describedby={hasUrlError ? urlErrorId : undefined}
              aria-invalid={hasUrlError}
              className="text-mds-bookmark-item placeholder:text-mds-shortcut-label h-7 rounded-none border-0 bg-transparent px-0 caret-current placeholder:font-mono focus-visible:ring-0"
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
          <Button
            aria-label={UI_LANGUAGE.bookmark.action.save}
            className="text-muted-foreground hover:text-muted-foreground hover:bg-transparent"
            disabled={!form.canSave}
            size="icon-sm"
            title={UI_LANGUAGE.bookmark.action.save}
            variant="ghost"
            onMouseDown={stopInteraction}
            onClick={(event) => {
              stopInteraction(event);
              void form.createBookmark();
            }}
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
              onCancel();
            }}
          >
            <XIcon className="h-4 w-4" />
          </Button>
        </form>
      </CollapsibleContent>
    </Collapsible>
  );
}
