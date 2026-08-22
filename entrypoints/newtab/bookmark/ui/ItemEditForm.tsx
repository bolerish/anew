import { useEffect, useId, useRef, type FocusEvent, type FormEvent } from "react";
import { UI_LANGUAGE } from "~shared/lib/language";
import { cn } from "~shared/lib/utils";
import { Input } from "~shared/ui/input";

import { deriveItemLabel, type BookmarkItemView } from "../lib/bookmark-item-view";
import { RemoveButton, SaveButton } from "./BookmarkActions";
import type { BookmarkContextValue } from "./BookmarkProvider";
import { ItemIcon } from "./ItemIcon";

type ItemEditFormProps = {
  inlineEditor: BookmarkContextValue["inlineEditor"];
  isInlineUrlValid: boolean;
  itemView: BookmarkItemView;
  onBlur: (event: FocusEvent<HTMLFormElement>) => void;
  onRemove: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

export function ItemEditForm({
  inlineEditor,
  isInlineUrlValid,
  itemView,
  onBlur,
  onRemove,
  onSubmit,
}: ItemEditFormProps) {
  const { icon, iconMarker, item, showBookmarkIcon } = itemView;
  const titleInputRef = useRef<HTMLInputElement | null>(null);
  const urlErrorId = useId();

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
          aria-label={UI_LANGUAGE.bookmark.label.title}
          className="text-mds-bookmark-item placeholder:text-mds-shortcut-label h-7 rounded-none border-0 bg-transparent px-0 font-normal caret-current focus-visible:ring-0"
          ref={titleInputRef}
          value={inlineEditor.inlineTitle}
          onChange={(event) => inlineEditor.setInlineTitle(event.target.value)}
        />
        <Input
          aria-label={UI_LANGUAGE.bookmark.label.url}
          aria-describedby={isInlineUrlValid ? undefined : urlErrorId}
          aria-invalid={!isInlineUrlValid}
          className="text-mds-bookmark-item placeholder:text-mds-shortcut-label h-7 rounded-none border-0 bg-transparent px-0 font-normal caret-current focus-visible:ring-0"
          title={isInlineUrlValid ? undefined : UI_LANGUAGE.bookmark.error.invalidUrl}
          value={inlineEditor.inlineUrl}
          onChange={(event) => inlineEditor.setInlineUrl(event.target.value)}
        />
        {!isInlineUrlValid ? (
          <p className="text-destructive text-mds-caption" id={urlErrorId} role="alert">
            {UI_LANGUAGE.bookmark.error.invalidUrl}
          </p>
        ) : null}
      </div>
      <div className="flex h-7 items-center justify-end gap-0">
        <SaveButton
          disabled={!isInlineUrlValid}
          label={UI_LANGUAGE.bookmark.action.save}
          onSave={() => {
            void inlineEditor.updateCurrentInlineEditor();
          }}
        />
        <RemoveButton label={UI_LANGUAGE.bookmark.action.remove} onRemove={onRemove} />
      </div>
    </form>
  );
}
