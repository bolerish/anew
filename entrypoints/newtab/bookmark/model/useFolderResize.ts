import { clamp } from "es-toolkit";
import { useRef, useState, type PointerEvent, type KeyboardEvent } from "react";

import { MAX_FOLDER_HEIGHT_REM } from "../../settings/bookmark/model/settings";
const KEYBOARD_STEP_REM = 1;
/** Owns folder height preview and pointer/keyboard resizing; the caller persists display settings. */
export function useFolderResize(saveHeight: (height: number | undefined) => Promise<void>) {
  const [height, setHeight] = useState<number | null>(null);
  const resizing = useRef<{ y: number; height: number; unit: number } | null>(null);
  function handleStart(e: PointerEvent<HTMLButtonElement>) {
    const content = e.currentTarget.previousElementSibling?.firstElementChild as HTMLElement;
    const unit = parseFloat(getComputedStyle(document.documentElement).fontSize);
    resizing.current = { y: e.clientY, height: content.getBoundingClientRect().height / unit, unit };
    e.currentTarget.setPointerCapture(e.pointerId);
  }
  function handleMove(e: PointerEvent<HTMLButtonElement>) {
    const start = resizing.current;
    if (start) setHeight(clamp(start.height + (e.clientY - start.y) / start.unit, 0, MAX_FOLDER_HEIGHT_REM));
  }
  function handleEnd(e: PointerEvent<HTMLButtonElement>) {
    if (!resizing.current) return;
    e.currentTarget.releasePointerCapture(e.pointerId);
    resizing.current = null;
    if (height === null) return;
    void saveHeight(height).then(() => setHeight(null));
  }
  function cancel() {
    resizing.current = null;
    setHeight(null);
  }
  function reset() {
    resizing.current = null;
    setHeight(null);
    void saveHeight(undefined);
  }
  function handleKeyDown(e: KeyboardEvent<HTMLButtonElement>) {
    if (e.key !== "ArrowUp" && e.key !== "ArrowDown" && e.key !== "Home") return;
    e.preventDefault();
    if (e.key === "Home") {
      reset();
      return;
    }
    const content = e.currentTarget.previousElementSibling?.firstElementChild as HTMLElement;
    const current =
      content.getBoundingClientRect().height / parseFloat(getComputedStyle(document.documentElement).fontSize);
    const delta = e.key === "ArrowDown" ? KEYBOARD_STEP_REM : -KEYBOARD_STEP_REM;
    void saveHeight(clamp(current + delta, 0, MAX_FOLDER_HEIGHT_REM));
  }
  return {
    height,
    isResizing: resizing.current !== null,
    handleStart,
    handleMove,
    handleEnd,
    cancel,
    reset,
    handleKeyDown,
  };
}
