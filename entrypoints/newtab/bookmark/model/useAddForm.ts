import { useState, type FormEvent } from "react";

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

  function closeForm() {
    setIsAddingBookmark(false);
    setTitle("");
    setUrl("");
  }

  function resetForm() {
    setTitle("");
    setUrl("");
    setIsAddingBookmark(true);
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
    createBookmark,
    handleSubmit,
    isAddingBookmark,
    resetForm,
    setTitle,
    setUrl,
    title,
    toggleForm,
    url,
    isUrlValid,
  };
}
