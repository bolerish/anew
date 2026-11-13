import { colorVars, sizeVars, radiusVars } from "@bolerish/tokens/semantic.stylex";
import { DotsSixVerticalIcon } from "@phosphor-icons/react";
import * as stylex from "@stylexjs/stylex";
import type { Ref, KeyboardEvent } from "react";

const styles = stylex.create({
  wrapper: {
    position: "absolute",
    top: 0,
    insetInlineStart: `calc(${sizeVars.controlSm} * -1)`,
    zIndex: 1,
    opacity: { default: "var(--bookmark-actions-opacity, 0)", ":hover": 1, ":focus-within": 1 },
    pointerEvents: "auto",
  },
  floating: { top: 0, margin: 0, transform: "none", insetInlineStart: `calc(${sizeVars.controlXs} * -1)` },
  compactHandle: { margin: 0, width: sizeVars.controlXs, height: sizeVars.controlXs },
  dragging: { opacity: 1 },
  editing: { opacity: 1, pointerEvents: "auto" },
  suppressed: { opacity: 0, ":focus-within": { opacity: 1 } },
  icon: { width: sizeVars.iconMd, height: sizeVars.iconMd },
  folderWrapper: { top: "50%", transform: "translateY(-50%)", insetInlineStart: `calc(${sizeVars.controlSm} * -1)` },
  folderHandle: { width: sizeVars.controlSm },
  handle: {
    appearance: "none",
    borderWidth: 0,
    backgroundColor: "transparent",
    padding: 0,
    display: "grid",
    placeItems: "center",
    width: sizeVars.controlSm,
    height: sizeVars.controlMd,
    color: colorVars.fgSecondary,
    cursor: "grab",
    borderRadius: radiusVars.sm,
    outlineStyle: "none",
    ":active": { cursor: "grabbing" },
    ":focus-visible": {
      backgroundColor: { default: colorVars.bgActionPrimary, "@media (forced-colors: active)": "Highlight" },
      color: { default: colorVars.fgOnActionPrimary, "@media (forced-colors: active)": "HighlightText" },
    },
  },
});

type DragHandleProps = {
  floating?: boolean;
  isDragging?: boolean;
  isEditMode?: boolean;
  suppressActions?: boolean;
  kind: "folder" | "item";
  label: string;
  onMove?: (direction: "down" | "up") => void;
  ref?: Ref<HTMLButtonElement>;
};

export function DragHandle({
  floating = false,
  isDragging = false,
  isEditMode = false,
  kind,
  label,
  onMove,
  ref,
  suppressActions = false,
}: DragHandleProps) {
  function handleKeyDown(e: KeyboardEvent<HTMLButtonElement>) {
    if (!onMove || !e.altKey || (e.key !== "ArrowUp" && e.key !== "ArrowDown")) {
      return;
    }

    e.preventDefault();
    e.stopPropagation();
    onMove(e.key === "ArrowUp" ? "up" : "down");
  }
  return (
    <div
      {...stylex.props(
        styles.wrapper,
        kind === "folder" && styles.folderWrapper,
        floating && styles.floating,
        isEditMode && styles.editing,
        isDragging && styles.dragging,
        suppressActions && styles.suppressed,
      )}
    >
      <button
        data-bookmark-drag=""
        aria-label={label}
        aria-keyshortcuts={onMove ? "Alt+ArrowUp Alt+ArrowDown" : undefined}
        {...stylex.props(styles.handle, kind === "folder" && styles.folderHandle, floating && styles.compactHandle)}
        tabIndex={onMove ? 0 : -1}
        title={onMove ? `${label} (Option+Up/Down)` : label}
        type="button"
        ref={ref}
        onKeyDown={handleKeyDown}
      >
        <DotsSixVerticalIcon aria-hidden="true" {...stylex.props(styles.icon)} />
      </button>
    </div>
  );
}
