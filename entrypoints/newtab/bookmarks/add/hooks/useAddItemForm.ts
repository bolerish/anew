import { useState, type FormEvent } from "react";

import { canNormalizeUrl } from "../../lib/url";
import { createBookmarkItem } from "../lib/mutation";

type UseAddItemFormInput = {
  parentId: string | null;
  onCreated: () => Promise<void>;
};

export function useAddItemForm({ parentId, onCreated }: UseAddItemFormInput) {
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const urlIsValid = canNormalizeUrl(url);
  const canSave = Boolean(parentId) && urlIsValid;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await createBookmarkFromForm();
  }

  async function createBookmark() {
    await createBookmarkFromForm();
  }

  async function createBookmarkFromForm() {
    const trimmedTitle = title.trim();
    const trimmedUrl = url.trim();

    if (!parentId || !trimmedUrl || !urlIsValid) {
      return;
    }

    await createBookmarkItem({
      parentId,
      title: trimmedTitle || trimmedUrl,
      url: trimmedUrl,
    });
    closeForm();
    await onCreated();
  }

  function closeForm() {
    setIsAddingItem(false);
    setTitle("");
    setUrl("");
  }

  function resetForm() {
    setTitle("");
    setUrl("");
    setIsAddingItem(true);
  }

  function toggleForm() {
    if (isAddingItem) {
      closeForm();
      return;
    }

    setIsAddingItem(true);
  }

  return {
    canSave,
    closeForm,
    createBookmark,
    handleSubmit,
    isAddingItem,
    resetForm,
    setTitle,
    setUrl,
    title,
    toggleForm,
    url,
    urlIsValid,
  };
}
