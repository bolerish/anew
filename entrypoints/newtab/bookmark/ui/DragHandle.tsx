import { DotsSixVerticalIcon } from "@phosphor-icons/react";
import type { Ref } from "react";
import { cn } from "~shared/lib/utils";

type DragHandleProps = {
  isDragging?: boolean;
  label: string;
  ref?: Ref<HTMLButtonElement>;
};

export function DragHandle({ isDragging = false, label, ref }: DragHandleProps) {
  return (
    <div
      className={cn(
        "absolute top-1 -left-6 z-10 flex h-7 justify-end opacity-0 transition-opacity group-hover/bookmark-folder:opacity-100 group-hover/bookmark-item:opacity-100 group-hover/bookmark-row:opacity-100 group-data-suppress-bookmark-actions/bookmark-item:opacity-0! focus-within:opacity-100",
      )}
    >
      <button
        aria-hidden="true"
        className={cn(
          "text-muted-foreground hover:text-muted-foreground rounded-mds grid h-7 w-6 cursor-grab place-items-center active:cursor-grabbing",
          isDragging && "bg-accent text-foreground",
        )}
        tabIndex={-1}
        title={label}
        type="button"
        ref={ref}
      >
        <DotsSixVerticalIcon className="h-4 w-4" />
      </button>
    </div>
  );
}
