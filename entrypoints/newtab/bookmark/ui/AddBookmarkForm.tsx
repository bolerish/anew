import { useId, type KeyboardEvent } from "react";
import { stopInteraction } from "~shared/lib/event";
import { UI_LANGUAGE } from "~shared/lib/language";
import { Collapsible, CollapsibleContent } from "~shared/ui/collapsible";
import { Input } from "~shared/ui/input";

import type { useAddBookmarkForm } from "../model/useAddBookmarkForm";
import { RemoveButton, SaveButton } from "./BookmarkActions";

type AddBookmarkFormProps = {
  addBookmark: ReturnType<typeof useAddBookmarkForm>;
  onCancel: () => void;
};

export function AddBookmarkForm({ addBookmark, onCancel }: AddBookmarkFormProps) {
  const hasUrlError = addBookmark.url.trim().length > 0 && !addBookmark.isUrlValid;
  const urlErrorId = useId();

  function handleInputKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key !== "Escape") {
      return;
    }

    stopInteraction(event);
    onCancel();
  }

  return (
    <Collapsible open={addBookmark.isAddingBookmark}>
      <CollapsibleContent className="collapsible-content">
        <form
          className="border-border grid grid-cols-[minmax(0,1fr)_auto_auto] items-start gap-x-2 gap-y-1 border-b p-1"
          onSubmit={addBookmark.handleSubmit}
        >
          <div className="grid min-w-0 gap-1">
            <Input
              aria-label={UI_LANGUAGE.bookmark.label.title}
              className="text-mds-bookmark-item placeholder:text-mds-shortcut-label h-7 rounded-none border-0 bg-transparent px-0 caret-current placeholder:font-mono focus-visible:ring-0"
              value={addBookmark.title}
              onKeyDown={handleInputKeyDown}
              onChange={(event) => addBookmark.setTitle(event.target.value)}
              placeholder={UI_LANGUAGE.bookmark.placeholder.title}
            />
            <Input
              aria-label={UI_LANGUAGE.bookmark.label.url}
              aria-describedby={hasUrlError ? urlErrorId : undefined}
              aria-invalid={hasUrlError}
              className="text-mds-bookmark-item placeholder:text-mds-shortcut-label h-7 rounded-none border-0 bg-transparent px-0 caret-current placeholder:font-mono focus-visible:ring-0"
              value={addBookmark.url}
              onKeyDown={handleInputKeyDown}
              onChange={(event) => addBookmark.setUrl(event.target.value)}
              placeholder={UI_LANGUAGE.bookmark.placeholder.url}
              title={hasUrlError ? UI_LANGUAGE.bookmark.error.invalidUrl : undefined}
            />
            {hasUrlError ? (
              <p className="text-destructive text-mds-caption" id={urlErrorId} role="alert">
                {UI_LANGUAGE.bookmark.error.invalidUrl}
              </p>
            ) : null}
          </div>
          <SaveButton
            disabled={!addBookmark.canSave}
            label={UI_LANGUAGE.bookmark.action.save}
            onSave={() => {
              void addBookmark.createBookmark();
            }}
          />
          <RemoveButton label={UI_LANGUAGE.bookmark.action.cancel} onRemove={onCancel} />
        </form>
      </CollapsibleContent>
    </Collapsible>
  );
}
