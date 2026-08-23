import { DotsSixVerticalIcon } from "@phosphor-icons/react";
import type { Ref } from "react";
import { cn } from "~shared/lib/utils";

type DragHandleProps = {
  isDragging?: boolean;
  kind: "folder" | "item";
  label: string;
  onMove?: (direction: "down" | "up") => void;
  ref?: Ref<HTMLButtonElement>;
};

export function DragHandle({ isDragging = false, kind, label, onMove, ref }: DragHandleProps) {
  const hoverClass =
    kind === "folder" ? "group-hover/bookmark-folder-header:opacity-100" : "group-hover/bookmark-row:opacity-100";

  return (
    <div
      className={cn(
        "absolute top-0 -left-6 z-10 flex h-6 justify-end opacity-0 transition-opacity group-data-suppress-bookmark-actions/bookmark-item:opacity-0! focus-within:opacity-100",
        hoverClass,
        isDragging && "opacity-100",
      )}
    >
      <button
        aria-label={label}
        aria-keyshortcuts={onMove ? "Alt+ArrowUp Alt+ArrowDown" : undefined}
        className={cn(
          "text-muted-foreground hover:text-muted-foreground rounded-mds grid h-6 w-6 cursor-grab place-items-center active:cursor-grabbing",
          isDragging && "bg-accent text-foreground",
        )}
        tabIndex={onMove ? 0 : -1}
        title={onMove ? `${label} (Option+Up/Down)` : label}
        type="button"
        ref={ref}
        onKeyDown={(event) => {
          if (!onMove || !event.altKey || (event.key !== "ArrowUp" && event.key !== "ArrowDown")) {
            return;
          }

          event.preventDefault();
          event.stopPropagation();
          onMove(event.key === "ArrowUp" ? "up" : "down");
        }}
      >
        <DotsSixVerticalIcon className="h-4 w-4" />
      </button>
    </div>
  );
}
