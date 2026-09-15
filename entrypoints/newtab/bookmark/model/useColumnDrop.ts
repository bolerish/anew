import { dropTargetForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { useEffect, useRef, useState } from "react";

import { moveLayoutFolder, moveLayoutFolderToRow, moveLayoutFolderBeside } from "../../settings/bookmark/lib/layout";
import { saveColumnLayout, type ColumnLayout } from "../../settings/bookmark/model/settings";
import { isFolderDragData } from "../lib/dnd";
import type { BookmarkFolder } from "./types";

export function useColumnDrop({
  index,
  layout,
  sourceId,
  editable,
  newColumn,
  newRow,
  row,
}: {
  index: number;
  layout: ColumnLayout;
  sourceId: string;
  editable: boolean;
  newColumn: boolean;
  newRow: boolean;
  row: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);
  useEffect(() => {
    if (!editable || !ref.current) return;
    return dropTargetForElements({
      element: ref.current,
      canDrop: ({ source }) => isFolderDragData(source.data),
      getData: ({ input, source }) => {
        let anchorId: string | undefined;
        if (newColumn) {
          let distance = Infinity;
          for (const folder of ref.current?.parentElement?.querySelectorAll<HTMLElement>("[id^='folder-']") ?? []) {
            if (isFolderDragData(source.data) && folder.id === `folder-${source.data.folder.id}`) continue;
            const bounds = folder.getBoundingClientRect();
            const next =
              Math.max(bounds.top - input.clientY, input.clientY - bounds.bottom, 0) +
              Math.abs(bounds.right - input.clientX);
            if (next < distance) {
              distance = next;
              anchorId = folder.id.slice("folder-".length);
            }
          }
        }
        return { kind: "layout-column", index, anchorId };
      },
      onDragEnter: () => setActive(true),
      onDragLeave: () => setActive(false),
      onDrop: ({ source, location, self }) => {
        setActive(false);
        if (
          location.current.dropTargets.find((target) => target.data.kind === "layout-column")?.element !== self.element
        )
          return;
        if (!isFolderDragData(source.data)) return;
        const target = location.current.dropTargets.find((target) => target.data.kind === "folder");
        const targetId = (target?.data.folder as BookmarkFolder | undefined)?.id;
        const ids = layout.columns[index] ?? [];
        const beforeId = target?.data.edge === "after" && targetId ? ids[ids.indexOf(targetId) + 1] : targetId;
        if (targetId === source.data.folder.id) return;
        let next: ColumnLayout;
        if (newRow) next = moveLayoutFolderToRow(layout, source.data.folder.id, row);
        else if (newColumn && typeof self.data.anchorId === "string") {
          next = moveLayoutFolderBeside(layout, source.data.folder.id, self.data.anchorId);
        } else {
          next = moveLayoutFolder(
            layout,
            source.data.folder.id,
            index,
            beforeId,
            newColumn ? row : undefined,
            !newColumn && !ids.includes(source.data.folder.id),
          );
        }
        void saveColumnLayout(sourceId, next);
      },
    });
  }, [editable, index, layout, sourceId, row, newRow, newColumn]);
  return { ref, active };
}
