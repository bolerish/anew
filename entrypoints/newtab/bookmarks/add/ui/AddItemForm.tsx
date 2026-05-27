import type { KeyboardEvent } from "react";
import { stopInteraction } from "~newtab/shared/lib/event";
import { UI_LANGUAGE } from "~newtab/shared/lib/language";
import { Collapsible, CollapsibleContent } from "~newtab/shared/ui/collapsible";
import { Input } from "~newtab/shared/ui/input";

import { RemoveButton, SaveButton } from "../../ui/BookmarkActions";
import type { useAddItemForm } from "../hooks/useAddItemForm";

type AddItemFormProps = {
  addItem: ReturnType<typeof useAddItemForm>;
  onCancel: () => void;
};

export function AddItemForm({ addItem, onCancel }: AddItemFormProps) {
  const urlHasError = addItem.url.trim().length > 0 && !addItem.urlIsValid;

  function handleInputKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key !== "Escape") {
      return;
    }

    stopInteraction(event);
    onCancel();
  }

  return (
    <Collapsible open={addItem.isAddingItem}>
      <CollapsibleContent className="collapsible-content">
        <form
          className="border-border grid grid-cols-[minmax(0,1fr)_auto_auto] items-start gap-x-2 gap-y-1 border-b p-1"
          onSubmit={addItem.handleSubmit}
        >
          <div className="grid min-w-0 gap-1">
            <Input
              aria-label={UI_LANGUAGE.bookmarks.label.title}
              className="text-mds-bookmark-item placeholder:text-mds-shortcut-label h-7 rounded-none border-0 bg-transparent px-0 caret-current placeholder:font-mono focus-visible:ring-0"
              value={addItem.title}
              onKeyDown={handleInputKeyDown}
              onChange={(event) => addItem.setTitle(event.target.value)}
              placeholder={UI_LANGUAGE.bookmarks.placeholder.title}
            />
            <Input
              aria-label={UI_LANGUAGE.bookmarks.label.url}
              aria-invalid={urlHasError}
              className="text-mds-bookmark-item placeholder:text-mds-shortcut-label h-7 rounded-none border-0 bg-transparent px-0 caret-current placeholder:font-mono focus-visible:ring-0"
              value={addItem.url}
              onKeyDown={handleInputKeyDown}
              onChange={(event) => addItem.setUrl(event.target.value)}
              placeholder={UI_LANGUAGE.bookmarks.placeholder.url}
              title={urlHasError ? UI_LANGUAGE.bookmarks.error.invalidUrl : undefined}
            />
          </div>
          <SaveButton
            disabled={!addItem.canSave}
            label={UI_LANGUAGE.bookmarks.action.save}
            onSave={() => {
              void addItem.createBookmark();
            }}
          />
          <RemoveButton label={UI_LANGUAGE.bookmarks.action.cancel} onRemove={onCancel} />
        </form>
      </CollapsibleContent>
    </Collapsible>
  );
}
