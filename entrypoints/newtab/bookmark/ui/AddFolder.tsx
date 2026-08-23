import { CheckIcon, XIcon } from "@phosphor-icons/react";
import { useEffect, useState, type KeyboardEvent } from "react";
import { stopInteraction } from "~shared/lib/event";
import { UI_LANGUAGE } from "~shared/lib/language";
import { cn } from "~shared/lib/utils";
import { Button } from "~shared/ui/button";
import { Collapsible, CollapsibleContent } from "~shared/ui/collapsible";
import { Input } from "~shared/ui/input";

import { useBookmarkContext } from "../model/Provider";
import { useAddFolder } from "../model/useAddFolder";
import { useFormFocus } from "../model/useFormFocus";

type AddFolderProps = {
  alwaysVisible?: boolean;
  index?: number;
  parentId: string;
};

export function AddFolder({ alwaysVisible = false, index, parentId }: AddFolderProps) {
  const { editor, onBookmarksChange } = useBookmarkContext();
  const form = useAddFolder({ index, parentId, onCreated: onBookmarksChange });
  const [isHovered, setIsHovered] = useState(false);
  const focus = useFormFocus({
    isOpen: form.isAdding,
    onOutsidePointerDown: form.closeForm,
  });

  useEffect(() => {
    if (editor.inlineEditingBookmark && form.isAdding) {
      form.closeForm();
    }
  }, [editor.inlineEditingBookmark, form]);

  function handleInputKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key !== "Escape") {
      return;
    }

    stopInteraction(event);
    form.closeForm();
  }

  return (
    <div
      className={cn(
        "my-1 ml-5 h-fit p-0 transition-all duration-200",
        form.isAdding || alwaysVisible || isHovered ? "mb-2 opacity-100" : "h-px opacity-0 focus-within:opacity-100",
      )}
      onPointerMove={() => setIsHovered(true)}
      onPointerLeave={() => setIsHovered(false)}
    >
      <Collapsible open={!form.isAdding}>
        <CollapsibleContent className="overflow-hidden transition-[height,opacity] duration-200 ease-out data-ending-style:h-0 data-ending-style:opacity-0 data-starting-style:h-0 data-starting-style:opacity-0">
          <Button
            className="text-muted-foreground hover:text-foreground w-full justify-center gap-2 py-4"
            size="sm"
            type="button"
            variant="ghost"
            onClick={form.openForm}
          >
            <span aria-hidden="true" className="h-px flex-1 bg-current" />
            {UI_LANGUAGE.bookmark.action.addFolder}
            <span aria-hidden="true" className="h-px flex-1 bg-current" />
          </Button>
        </CollapsibleContent>
      </Collapsible>
      <Collapsible open={form.isAdding}>
        <CollapsibleContent>
          <form
            className="border-border grid-cols-mds-bookmark-folder relative mx-2 grid min-h-7 items-center gap-2 border-b p-1"
            ref={focus.formRef}
            onSubmit={form.handleSubmit}
          >
            <Input
              aria-label={UI_LANGUAGE.bookmark.label.folder}
              className="text-mds-bookmark-section h-7 min-w-0 rounded-none border-0 bg-transparent px-0 focus-visible:ring-0"
              placeholder={UI_LANGUAGE.bookmark.placeholder.folder}
              ref={focus.inputRef}
              value={form.title}
              onKeyDown={handleInputKeyDown}
              onChange={(event) => form.setTitle(event.target.value)}
            />
            <div className="flex w-30 items-center justify-end gap-1">
              <Button
                aria-label={UI_LANGUAGE.bookmark.action.save}
                className="text-muted-foreground hover:text-muted-foreground hover:bg-transparent"
                disabled={!form.canSave}
                size="icon-sm"
                title={UI_LANGUAGE.bookmark.action.save}
                type="submit"
                variant="ghost"
              >
                <CheckIcon className="h-4 w-4" />
              </Button>
              <Button
                aria-label={UI_LANGUAGE.bookmark.action.cancel}
                className="text-muted-foreground hover:text-muted-foreground hover:bg-transparent"
                size="icon-sm"
                title={UI_LANGUAGE.bookmark.action.cancel}
                type="button"
                variant="ghost"
                onClick={form.closeForm}
              >
                <XIcon className="h-4 w-4" />
              </Button>
            </div>
          </form>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
