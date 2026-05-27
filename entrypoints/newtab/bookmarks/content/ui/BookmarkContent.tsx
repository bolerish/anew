import { DragDropProvider } from "@dnd-kit/react";

import { useBookmarkContext } from "../bookmark-provider";
import { useBookmarkKeyboardNavigation } from "../hooks/useBookmarkKeyboardNavigation";
import { EmptyBookmarkList } from "./EmptyBookmarkList";
import { Folder } from "./Folder";

export function BookmarkContent() {
  const { activeBookmark, inlineTitle, movement, setActiveBookmark, visibleFolders } = useBookmarkContext();

  useBookmarkKeyboardNavigation({
    activeBookmark,
    inlineTitle,
    setActiveBookmark,
    visibleFolders,
  });

  return (
    <DragDropProvider onDragEnd={movement.handleDragEnd}>
      <div
        className="mt-5 mr-6 mb-3 ml-0 grid h-full scrollbar-thin content-start gap-7 overflow-y-auto pr-1 pb-6 pl-6"
        key={movement.forceReconcileKey}
      >
        {visibleFolders.length > 0 ? (
          visibleFolders.map((folder) => <Folder folder={folder} key={folder.id} />)
        ) : (
          <EmptyBookmarkList />
        )}
      </div>
    </DragDropProvider>
  );
}
