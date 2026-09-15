import { clamp, sumBy } from "es-toolkit";
import { useRef, useState, type KeyboardEvent, type PointerEvent } from "react";

import { saveColumnLayout, type ColumnLayout } from "../../settings/bookmark/model/settings";

const MIN_COLUMN_RATIO = 0.05;
const MAX_COLUMN_RATIO = 1 - MIN_COLUMN_RATIO;
const KEYBOARD_RESIZE_STEP = 0.05;

export { MIN_COLUMN_RATIO, MAX_COLUMN_RATIO };

/** Owns the column resize preview, pointer capture, keyboard controls and persistence. */
export function useColumnResize({
  layout,
  indices,
  editable,
  sourceId,
}: {
  layout: ColumnLayout;
  indices: readonly number[];
  editable: boolean;
  sourceId: string;
}) {
  const [resizing, setResizing] = useState<number[] | null>(null);
  const resize = useRef<{ x: number; widths: number[]; index: number; width: number } | null>(null);
  const container = useRef<HTMLDivElement>(null);
  const liveWidths = useRef<number[]>(layout.widths);
  const widths = resizing ?? layout.widths;

  function resetWidths() {
    if (!editable) return;
    resize.current = null;
    const next = [...layout.widths];
    for (const index of indices) next[index] = 1;
    liveWidths.current = next;
    setResizing(next);
    void saveColumnLayout(sourceId, { ...layout, widths: next }).then(() => setResizing(null));
  }

  function resizeTo(clientX: number) {
    const current = resize.current;
    if (!current) return;
    const next = [...current.widths];
    const total = sumBy(indices, (index) => next[index]);
    const pair = next[current.index] + next[current.index + 1];
    const delta = ((clientX - current.x) / current.width) * total;
    next[current.index] = clamp(
      current.widths[current.index] + delta,
      pair * MIN_COLUMN_RATIO,
      pair * MAX_COLUMN_RATIO,
    );
    next[current.index + 1] = pair - next[current.index];
    liveWidths.current = next;
    setResizing(next);
  }

  function handleResizeKeyDown(e: KeyboardEvent<HTMLDivElement>, index: number) {
    if (!editable) return;
    if (e.key === "Home") {
      e.preventDefault();
      resetWidths();
      return;
    }
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
    e.preventDefault();
    const next = [...widths];
    const pair = next[index - 1] + next[index];
    next[index - 1] = clamp(
      next[index - 1] + (e.key === "ArrowRight" ? KEYBOARD_RESIZE_STEP : -KEYBOARD_RESIZE_STEP) * pair,
      pair * MIN_COLUMN_RATIO,
      pair * MAX_COLUMN_RATIO,
    );
    next[index] = pair - next[index - 1];
    void saveColumnLayout(sourceId, { ...layout, widths: next });
  }

  function handleResizeStart(e: PointerEvent<HTMLDivElement>, index: number) {
    if (!editable) return;
    resize.current = {
      x: e.clientX,
      widths: [...widths],
      index: index - 1,
      width: container.current?.clientWidth || 1,
    };
    liveWidths.current = [...widths];
    e.currentTarget.setPointerCapture(e.pointerId);
  }

  function handleResizeEnd(e: PointerEvent<HTMLDivElement>) {
    if (!resize.current) return;
    e.currentTarget.releasePointerCapture(e.pointerId);
    resize.current = null;
    if (!resizing) return;
    void saveColumnLayout(sourceId, { ...layout, widths: liveWidths.current }).then(() => setResizing(null));
  }

  function cancelResize() {
    resize.current = null;
    setResizing(null);
  }
  return {
    container,
    widths,
    isResizing: resize.current !== null,
    resetWidths,
    resizeTo,
    handleResizeKeyDown,
    handleResizeStart,
    handleResizeEnd,
    cancelResize,
  };
}
