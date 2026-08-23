import { useCallback, useState, type SubmitEvent } from "react";

import { createFolder } from "../api/create";

type UseAddFolderInput = {
  index?: number;
  parentId: string;
  onCreated: () => Promise<void>;
};

export function useAddFolder({ index, parentId, onCreated }: UseAddFolderInput) {
  const [isAdding, setIsAdding] = useState(false);
  const [title, setTitle] = useState("");
  const canSave = Boolean(title.trim());

  const closeForm = useCallback(() => {
    setIsAdding(false);
    setTitle("");
  }, []);

  async function handleSubmit(event: SubmitEvent) {
    event.preventDefault();

    if (!title.trim()) {
      return;
    }

    await createFolder({ index, parentId, title: title.trim() });
    closeForm();
    await onCreated();
  }

  function openForm() {
    setIsAdding(true);
  }

  return { canSave, closeForm, handleSubmit, isAdding, openForm, setTitle, title };
}
