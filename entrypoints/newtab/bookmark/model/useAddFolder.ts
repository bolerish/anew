import { useCallback, useRef, useState, type SubmitEvent } from "react";

import { createFolder } from "../api/create";

type UseAddFolderInput = {
  index?: number;
  parentId: string;
  onCreated: () => Promise<void>;
};

export function useAddFolder({ index, parentId, onCreated }: UseAddFolderInput) {
  const [isAdding, setIsAdding] = useState(false);
  const [title, setTitle] = useState("");
  const [hasSaveError, setHasSaveError] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const saving = useRef(false);
  const canSave = Boolean(title.trim()) && !isSaving;

  const closeForm = useCallback(() => {
    setIsAdding(false);
    setTitle("");
    setHasSaveError(false);
  }, []);

  async function handleSubmit(e: SubmitEvent) {
    e.preventDefault();
    if (saving.current) return;

    if (!title.trim()) {
      return;
    }

    saving.current = true;
    setIsSaving(true);
    setHasSaveError(false);
    try {
      await createFolder({ index, parentId, title: title.trim() });
      closeForm();
      await onCreated();
    } catch (error) {
      console.error("[min] Could not save bookmark", error);
      setHasSaveError(true);
    } finally {
      saving.current = false;
      setIsSaving(false);
    }
  }

  function openForm() {
    setIsAdding(true);
  }

  return { hasSaveError, isSaving, canSave, closeForm, handleSubmit, isAdding, openForm, setTitle, title };
}
