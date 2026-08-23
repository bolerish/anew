import { useState, type SubmitEvent } from "react";

import { createItem } from "../api/create";
import { canNormalizeUrl } from "../lib/url";

type UseAddFormInput = {
  parentId: string | null;
  onCreated: () => Promise<void>;
};

export function useAddForm({ parentId, onCreated }: UseAddFormInput) {
  const [isAddingBookmark, setIsAddingBookmark] = useState(false);
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const isUrlValid = canNormalizeUrl(url);
  const canSave = Boolean(parentId) && isUrlValid;

  function closeForm() {
    setIsAddingBookmark(false);
    setTitle("");
    setUrl("");
  }

  async function handleSubmit(event: SubmitEvent) {
    event.preventDefault();
    const trimmedTitle = title.trim();
    const trimmedUrl = url.trim();

    if (!parentId || !trimmedUrl || !isUrlValid) {
      return;
    }

    await createItem({
      parentId,
      title: trimmedTitle || trimmedUrl,
      url: trimmedUrl,
    });
    closeForm();
    await onCreated();
  }

  function toggleForm() {
    if (isAddingBookmark) {
      closeForm();
      return;
    }

    setIsAddingBookmark(true);
  }

  return {
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
