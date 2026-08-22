import { useEffect, useState } from "react";

import { storage } from "#imports";

import { resolveSelectedSourceId } from "../lib/bookmark-tree";
import type { BookmarkSource } from "./bookmark-model";

const bookmarkSourceStorage = storage.defineItem<string | null>("local:newtab:bookmark-source-id:v1", {
  fallback: null,
});

type SelectedBookmarkSourceState = {
  selectedSourceId: string | null;
  selectedSourceTitle: string | null;
  setSelectedSource: (sourceId: string) => void;
};

export function useSelectedBookmarkSource(sources: BookmarkSource[]): SelectedBookmarkSourceState {
  const [storedSourceId, setStoredSourceId] = useState<string | null>(bookmarkSourceStorage.fallback);
  const selectedSourceId = resolveSelectedSourceId(sources, storedSourceId);
  const selectedSourceTitle = resolveSelectedSourceTitle(sources, selectedSourceId);

  useEffect(() => {
    void loadStoredSourceId();
    return bookmarkSourceStorage.watch(setStoredSourceId);

    async function loadStoredSourceId() {
      setStoredSourceId(await bookmarkSourceStorage.getValue());
    }
  }, []);

  function setSelectedSource(sourceId: string) {
    void bookmarkSourceStorage.setValue(sourceId);
  }

  return {
    selectedSourceId,
    selectedSourceTitle,
    setSelectedSource,
  };
}

function resolveSelectedSourceTitle(sources: BookmarkSource[], selectedSourceId: string | null): string | null {
  return sources.find((source) => source.id === selectedSourceId)?.title ?? null;
}
