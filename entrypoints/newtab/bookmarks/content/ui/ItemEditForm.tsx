import { useEffect, useRef, type FocusEvent, type FormEvent } from "react";
import { UI_LANGUAGE } from "~newtab/shared/lib/language";
import { cn } from "~newtab/shared/lib/utils";
import { Input } from "~newtab/shared/ui/input";

import { RemoveButton, SaveButton } from "../../ui/BookmarkActions";
import type { BookmarkContextValue } from "../bookmark-provider";
import { deriveItemLabel, type BookmarkItemView } from "../lib";
import { ItemIcon } from "./ItemIcon";

type ItemEditFormProps = {
  inlineTitle: BookmarkContextValue["inlineTitle"];
  inlineUrlIsValid: boolean;
  itemView: BookmarkItemView;
  onBlur: (event: FocusEvent<HTMLFormElement>) => void;
  onRemove: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

export function ItemEditForm({
  inlineTitle,
  inlineUrlIsValid,
  itemView,
  onBlur,
  onRemove,
  onSubmit,
}: ItemEditFormProps) {
  const { icon, iconMarker, item, showBookmarkIcon } = itemView;
  const titleInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const titleInput = titleInputRef.current;

    titleInput?.focus();
    titleInput?.select();
  }, []);

  return (
    <form
      className={cn(
        "border-border grid min-w-0 items-start gap-x-2 gap-y-1 border-b p-1",
        showBookmarkIcon ? "grid-cols-mds-bookmark-item-icon" : "grid-cols-[minmax(0,1fr)_auto]",
      )}
      data-inline-bookmark-editor=""
      onBlur={onBlur}
      onSubmit={onSubmit}
    >
      {showBookmarkIcon ? (
        <div className="row-span-2 flex h-7 items-center" data-bookmark-edit-icon="">
          <ItemIcon icon={icon} label={deriveItemLabel(item)} marker={iconMarker} />
        </div>
      ) : null}
      <div className="grid min-w-0 gap-1">
        <Input
          aria-label={UI_LANGUAGE.bookmarks.label.title}
          className="text-mds-bookmark-item placeholder:text-mds-shortcut-label h-7 rounded-none border-0 bg-transparent px-0 font-normal caret-current focus-visible:ring-0"
          ref={titleInputRef}
          value={inlineTitle.inlineTitle}
          onChange={(event) => inlineTitle.setInlineTitle(event.target.value)}
        />
        <Input
          aria-label={UI_LANGUAGE.bookmarks.label.url}
          aria-invalid={!inlineUrlIsValid}
          className="text-mds-bookmark-item placeholder:text-mds-shortcut-label h-7 rounded-none border-0 bg-transparent px-0 font-normal caret-current focus-visible:ring-0"
          title={inlineUrlIsValid ? undefined : UI_LANGUAGE.bookmarks.error.invalidUrl}
          value={inlineTitle.inlineUrl}
          onChange={(event) => inlineTitle.setInlineUrl(event.target.value)}
        />
      </div>
      <div className="flex h-7 items-center justify-end gap-0">
        <SaveButton
          disabled={!inlineUrlIsValid}
          label={UI_LANGUAGE.bookmarks.action.save}
          onSave={() => {
            void inlineTitle.updateCurrentInlineEditor();
          }}
        />
        <RemoveButton label={UI_LANGUAGE.bookmarks.action.remove} onRemove={onRemove} />
      </div>
    </form>
  );
}
