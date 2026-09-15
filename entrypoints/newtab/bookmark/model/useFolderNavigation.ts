import { useEffect, useRef, useState } from "react";

import { resolveActiveFolder } from "../lib/active-folder";
import type { BookmarkFolder } from "./types";

const FOLDER_HIGHLIGHT_DURATION_MS = 1500;

/** Owns scroll tracking and explicit table-of-contents navigation. */
export function useFolderNavigation(folders: readonly BookmarkFolder[]) {
  const [active, setActive] = useState<string | undefined>(folders[0]?.id);
  const selectedFolder = useRef(folders[0]?.id);
  const navigating = useRef(false);
  const highlightTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const highlightedFolder = useRef<HTMLElement | null>(null);
  useEffect(
    () => () => {
      clearTimeout(highlightTimer.current);
      if (highlightedFolder.current) delete highlightedFolder.current.dataset.contentsFocus;
    },
    [],
  );
  useEffect(() => {
    const scroll = document.querySelector<HTMLElement>("[data-bookmark-scroll]");
    if (!scroll) return;
    function update() {
      if (navigating.current && folders.some((folder) => folder.id === selectedFolder.current)) return;
      const top = scroll!.getBoundingClientRect().top;
      const selectedColumn = document
        .getElementById(`folder-${selectedFolder.current}`)
        ?.closest("[data-bookmark-column]");
      const positions: { id: string; top: number }[] = [];
      for (const folder of folders) {
        const element = document.getElementById(`folder-${folder.id}`);
        if (!element || (selectedColumn && element.closest("[data-bookmark-column]") !== selectedColumn)) continue;
        positions.push({ id: folder.id, top: scroll!.scrollTop + element.getBoundingClientRect().top - top });
      }
      setActive(
        resolveActiveFolder(
          positions,
          scroll!.scrollTop,
          scroll!.scrollHeight - scroll!.clientHeight,
          selectedFolder.current,
        ),
      );
    }
    update();
    function resumeTracking() {
      navigating.current = false;
    }
    function handleScrollKey(event: KeyboardEvent) {
      if (
        ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "PageUp", "PageDown", "Home", "End", " "].includes(
          event.key,
        )
      ) {
        resumeTracking();
      }
    }
    scroll.addEventListener("scroll", update, { passive: true });
    scroll.addEventListener("wheel", resumeTracking, { passive: true });
    scroll.addEventListener("touchstart", resumeTracking, { passive: true });
    scroll.addEventListener("pointerdown", resumeTracking);
    scroll.addEventListener("keydown", handleScrollKey);
    return () => {
      scroll.removeEventListener("scroll", update);
      scroll.removeEventListener("wheel", resumeTracking);
      scroll.removeEventListener("touchstart", resumeTracking);
      scroll.removeEventListener("pointerdown", resumeTracking);
      scroll.removeEventListener("keydown", handleScrollKey);
    };
  }, [folders]);
  function focusFolder(id: string) {
    selectedFolder.current = id;
    navigating.current = true;
    const target = document.getElementById(`folder-${id}`);
    target?.scrollIntoView({
      block: "start",
      inline: "nearest",
      behavior:
        document.documentElement?.dataset.motionReduced === "true" ||
        (document.documentElement?.dataset.motionReduced !== "false" &&
          window.matchMedia("(prefers-reduced-motion: reduce)").matches)
          ? "instant"
          : "smooth",
    });
    clearTimeout(highlightTimer.current);
    if (highlightedFolder.current) delete highlightedFolder.current.dataset.contentsFocus;
    highlightedFolder.current = target;
    if (target) {
      highlightTimer.current = setTimeout(() => {
        delete target.dataset.contentsFocus;
      }, FOLDER_HIGHLIGHT_DURATION_MS);
      target.dataset.contentsFocus = "true";
      target.focus({ preventScroll: true });
    }
    setActive(id);
  }

  return { active, focusFolder };
}
