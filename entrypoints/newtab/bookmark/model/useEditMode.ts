import { useEffect, useEffectEvent, useState } from "react";
import { useLanguage } from "~shared/lib/preferences";

import { saveEditedBookmarkSettings, type BookmarkSettings } from "../../settings/bookmark/model/settings";
import { useEditSession, beginEditing, saveEditing, cancelEditing } from "./edit-session";
import { isKeyboardShortcutTarget } from "./useKeyboardNavigation";

export function useEditMode({
  open,
  setOpen,
  settings: storedBookmarkSettings,
  loadBookmarks,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
  settings: BookmarkSettings;
  loadBookmarks: () => Promise<void>;
}) {
  const UI_LANGUAGE = useLanguage();
  const session = useEditSession();
  const isEditMode = session.active;
  const [hasDraft, setHasDraft] = useState(false);
  useEffect(() => {
    const update = () => setHasDraft(Boolean(document.querySelector("[data-bookmark-draft]")));
    const observer = new MutationObserver(update);
    observer.observe(document.body, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: ["data-bookmark-draft"],
    });
    update();
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    function preventLoss(e: BeforeUnloadEvent) {
      if (session.active) {
        e.preventDefault();
        e.returnValue = "";
      }
    }
    window.addEventListener("beforeunload", preventLoss);
    return () => window.removeEventListener("beforeunload", preventLoss);
  }, [session.active]);
  const [editMessage, setEditMessage] = useState("");
  const saveFromShortcut = useEffectEvent(() => {
    void finishEditing();
  });
  useEffect(() => {
    function handleEditShortcut(e: KeyboardEvent) {
      const isEventHandled = open || e.defaultPrevented || e.isComposing;
      const isSettingsTrigger = e.target instanceof HTMLElement && Boolean(e.target.closest("[data-settings-trigger]"));
      const isFolderEditShortcut =
        e.code === "KeyE" && e.target instanceof HTMLElement && Boolean(e.target.closest("[data-folder-trigger]"));
      const isInteractiveTarget = isKeyboardShortcutTarget(e.target);
      if (e.key === "Escape" && !isEventHandled) {
        if (!document.querySelector("[data-bookmark-draft]")) {
          if (isEditMode) {
            cancelEditing();
            setEditMessage("");
            e.preventDefault();
          } else if (
            (!isInteractiveTarget || isSettingsTrigger) &&
            !document.querySelector('[role="menu"], [role="listbox"]')
          ) {
            e.preventDefault();
            setOpen(true);
          }
        }
        return;
      }
      const hasModifier = e.metaKey || e.ctrlKey || e.altKey || e.shiftKey;
      const isTargetBlocked = isInteractiveTarget && !isFolderEditShortcut;
      if (isEventHandled || e.repeat || hasModifier || isTargetBlocked) return;
      if (e.key === "Enter" && isEditMode) {
        e.preventDefault();
        saveFromShortcut();
        return;
      }
      if (e.code === "KeyE") {
        e.preventDefault();
        void beginEditing(storedBookmarkSettings).catch((error) => {
          console.error("[bookmark] Could not start editing", error);
          setEditMessage(UI_LANGUAGE.bookmark.saveError);
        });
      }
    }
    window.addEventListener("keydown", handleEditShortcut);
    return () => window.removeEventListener("keydown", handleEditShortcut);
  }, [open, isEditMode, storedBookmarkSettings, setOpen, UI_LANGUAGE.bookmark.saveError]);

  function restoreToolbarFocus() {
    const focused = document.activeElement;
    if (focused instanceof HTMLElement && focused.closest("[data-edit-toolbar]")) {
      document.querySelector<HTMLButtonElement>("[data-settings-trigger]")?.focus();
    }
  }
  async function finishEditing() {
    const draft = document.querySelector<HTMLElement>("[data-bookmark-draft]");
    if (draft) {
      setEditMessage(UI_LANGUAGE.bookmark.finishDraft);
      draft.querySelector<HTMLInputElement>("input")?.focus();
      return;
    }
    try {
      setEditMessage("");
      restoreToolbarFocus();
      await saveEditing(saveEditedBookmarkSettings);
      await loadBookmarks();
    } catch (error) {
      console.error("[bookmark] Could not save editing", error);
      setEditMessage(UI_LANGUAGE.bookmark.saveError);
    }
  }
  function discardEditing() {
    restoreToolbarFocus();
    cancelEditing();
    setEditMessage("");
  }

  return { session, hasDraft, editMessage, finishEditing, discardEditing };
}
