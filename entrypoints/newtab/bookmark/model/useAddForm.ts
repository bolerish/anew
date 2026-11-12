import { toast } from "@bolerish/ui/toast";
import { useEffect, useRef, useState, type SubmitEvent } from "react";
import { useLanguage } from "~shared/lib/preferences";

import { createItem } from "../api/create";
import { canNormalizeUrl, normalizeUrl } from "../lib/url";

type UseAddFormInput = {
  parentId: string | null;
  onCreated: () => Promise<void>;
};

export function useAddForm({ parentId, onCreated }: UseAddFormInput) {
  const copy = useLanguage().bookmark;
  const [isAddingBookmark, setIsAddingBookmark] = useState(false);
  const [title, setTitle] = useState("");
  const [hasSaveError, setHasSaveError] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const saving = useRef(false);
  const [url, setUrl] = useState("");
  const [recentlyCreatedUrl, setRecentlyCreatedUrl] = useState<string | null>(null);
  useEffect(() => {
    if (!recentlyCreatedUrl) return;
    const timeout = window.setTimeout(() => setRecentlyCreatedUrl(null), 1800);
    return () => window.clearTimeout(timeout);
  }, [recentlyCreatedUrl]);
  const isUrlValid = canNormalizeUrl(url);
  const canSave = Boolean(parentId) && isUrlValid && !isSaving;

  function closeForm() {
    setIsAddingBookmark(false);
    setTitle("");
    setHasSaveError(false);
    setUrl("");
  }

  async function handleSubmit(e: SubmitEvent) {
    e.preventDefault();
    if (saving.current) return;
    const trimmedTitle = title.trim();
    const trimmedUrl = url.trim();

    if (!parentId || !trimmedUrl || !isUrlValid) {
      return;
    }

    saving.current = true;
    setIsSaving(true);
    setHasSaveError(false);
    try {
      const result = await createItem({
        parentId,
        title: trimmedTitle || trimmedUrl,
        url: trimmedUrl,
      });
      if (result === "duplicate") {
        toast.add({ id: "duplicate-bookmark", title: copy.duplicateBookmark });
        return;
      }
      closeForm();
      setRecentlyCreatedUrl(normalizeUrl(trimmedUrl));
      await onCreated();
    } catch (error) {
      console.error("[min] Could not save bookmark", error);
      setHasSaveError(true);
    } finally {
      saving.current = false;
      setIsSaving(false);
    }
  }

  function toggleForm() {
    if (isAddingBookmark) {
      closeForm();
      return;
    }

    setIsAddingBookmark(true);
  }

  return {
    parentId,
    recentlyCreatedUrl,
    hasSaveError,
    isSaving,
    canSave,
    closeForm,
    handleSubmit,
    isAddingBookmark,
    setTitle,
    setUrl,
    title,
    toggleForm,
    url,
    isUrlValid,
  };
}
