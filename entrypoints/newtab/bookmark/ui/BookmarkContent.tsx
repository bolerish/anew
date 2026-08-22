import { monitorForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { useEffect } from "react";

import { useBookmarkKeyboardNavigation } from "../model/useBookmarkKeyboardNavigation";
import { useBookmarkContext } from "./BookmarkProvider";
import { EmptyBookmarkList } from "./EmptyBookmarkList";
import { Folder } from "./Folder";

export function BookmarkContent() {
  const { activeBookmark, inlineEditor, movement, setActiveBookmark, visibleFolders } = useBookmarkContext();

  useEffect(() => {
    return monitorForElements({
      onDrop: movement.handleDrop,
    });
  }, [movement.handleDrop]);

  useBookmarkKeyboardNavigation({
    activeBookmark,
    inlineEditor,
    setActiveBookmark,
    visibleFolders,
  });

  return (
    <div className="over grid h-full scrollbar-thin content-start gap-2 overflow-x-hidden overflow-y-auto pt-5 pr-7 pb-9 pl-6">
      {visibleFolders.length > 0 ? (
        visibleFolders.map((folder) => <Folder folder={folder} key={folder.id} />)
      ) : (
        <EmptyBookmarkList />
      )}
    </div>
  );
}
