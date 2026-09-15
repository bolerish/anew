/* oxlint-disable jsx-a11y/prefer-tag-over-role -- A focusable window splitter needs the interactive separator pattern. */
import * as stylex from "@stylexjs/stylex";
import { Fragment, type ReactNode } from "react";
import { useLanguage } from "~shared/lib/preferences";
import { spacingVars } from "~shared/styles/semantic.stylex";

import { resolveColumnLayout, moveLayoutFolder } from "../../settings/bookmark/lib/layout";
import { type ColumnLayout as Layout, saveColumnLayout } from "../../settings/bookmark/model/settings";
import type { BookmarkFolder } from "../model/types";
import { useColumnDrop } from "../model/useColumnDrop";
import { useColumnResize, MIN_COLUMN_RATIO, MAX_COLUMN_RATIO } from "../model/useColumnResize";
import { DropIndicator } from "./DropIndicator";
import { Folder } from "./Folder";
import { resizeStyles } from "./resize-styles";
const styles = stylex.create({
  grid: {
    position: "relative",
    width: "100%",
    minWidth: 0,
    display: "grid",
    alignItems: "start",
    gap: spacingVars.space2,
    gridTemplateColumns: "var(--column-tracks)",
    transition: "grid-template-columns 200ms ease",
    ':is([data-motion-reduced="true"] *)': { transition: "none" },
  },
  resizing: { transition: "none" },
  rows: { display: "grid", minWidth: 0 },
  newRow: { position: "relative", height: spacingVars.space2, minHeight: 0, width: "100%" },
  tracks: (value: string) => ({ "--column-tracks": value }),
  column: { position: "relative", minWidth: 0, minHeight: "4rem" },
  resize: { display: "block", alignSelf: "stretch", minHeight: "4rem" },
  newColumn: {
    position: "absolute",
    top: 0,
    right: `calc(${spacingVars.space4} * -1)`,
    width: spacingVars.space4,
    display: "block",
    zIndex: 1,
    height: "100%",
  },
  columnIndicator: { position: "absolute", inset: 0, pointerEvents: "none", opacity: 0 },
  indicatorActive: { opacity: 1 },
  inactiveDropArea: { pointerEvents: "none" },
});

export function ColumnLayout({
  folders,
  sourceId,
  saved,
  initialColumns,
  editable,
}: {
  folders: readonly BookmarkFolder[];
  sourceId: string;
  saved?: Layout;
  initialColumns: number;
  editable: boolean;
}) {
  const layout = resolveColumnLayout(
    folders.map((folder) => folder.id),
    saved,
    initialColumns,
  );
  const rows: number[][] = [];
  layout.columns.forEach((_, index) => {
    const row = layout.rows?.[index] ?? 0;
    (rows[row] ??= []).push(index);
  });
  return (
    <div {...stylex.props(styles.rows)}>
      {rows.map((indices, row) => (
        <Fragment key={indices.map((index) => layout.columns[index].join(",")).join("|")}>
          <ColumnRow
            folders={folders}
            sourceId={sourceId}
            layout={layout}
            indices={indices}
            row={row}
            editable={editable}
          />
          {editable ? (
            <Column index={layout.columns.length} row={row + 1} layout={layout} sourceId={sourceId} editable newRow>
              {null}
            </Column>
          ) : null}
        </Fragment>
      ))}
    </div>
  );
}

function ColumnRow({
  folders,
  sourceId,
  layout,
  indices,
  row,
  editable,
}: {
  folders: readonly BookmarkFolder[];
  sourceId: string;
  layout: Layout;
  indices: readonly number[];
  row: number;
  editable: boolean;
}) {
  const labels = useLanguage().settings;
  const {
    container,
    widths,
    isResizing,
    resetWidths,
    resizeTo,
    handleResizeKeyDown,
    handleResizeStart,
    handleResizeEnd,
    cancelResize,
  } = useColumnResize({ layout, indices, editable, sourceId });
  function moveFolder(id: string, index: number, direction: "up" | "down") {
    const ids = layout.columns[index];
    const position = ids.indexOf(id);
    if (direction === "up" && position > 0) {
      void saveColumnLayout(sourceId, moveLayoutFolder(layout, id, index, ids[position - 1]));
    }
    if (direction === "down" && position < ids.length - 1) {
      void saveColumnLayout(sourceId, moveLayoutFolder(layout, id, index, ids[position + 2]));
    }
  }
  let totalWidth = 0;
  for (const index of indices) totalWidth += widths[index];
  const tracks = indices.flatMap((index, position) =>
    position
      ? [`${spacingVars.space3}`, `minmax(10rem, ${(widths[index] / totalWidth) * indices.length}fr)`]
      : [`minmax(10rem, ${(widths[index] / totalWidth) * indices.length}fr)`],
  );
  return (
    <div ref={container} {...stylex.props(styles.grid, styles.tracks(tracks.join(" ")), isResizing && styles.resizing)}>
      {indices.map((index, position) => {
        const ids = layout.columns[index];
        return (
          <Fragment key={ids[0] ?? index}>
            {position > 0 ? (
              <div
                role="separator"
                aria-label={labels.resizeColumn}
                aria-orientation="vertical"
                aria-valuenow={Math.round((widths[index - 1] / (widths[index - 1] + widths[index])) * 100)}
                aria-valuemin={MIN_COLUMN_RATIO * 100}
                aria-valuemax={MAX_COLUMN_RATIO * 100}
                tabIndex={editable ? 0 : -1}
                {...stylex.props(resizeStyles.handle, resizeStyles.vertical, styles.resize)}
                onPointerDown={(event) => handleResizeStart(event, index)}
                onPointerMove={(e) => resizeTo(e.clientX)}
                onPointerUp={handleResizeEnd}
                onPointerCancel={cancelResize}
                onDoubleClick={resetWidths}
                onKeyDown={(event) => handleResizeKeyDown(event, index)}
              />
            ) : null}
            <Column index={index} row={row} layout={layout} sourceId={sourceId} editable={editable}>
              {ids.map((id) => {
                const folder = folders.find((folder) => folder.id === id);
                return folder ? (
                  <Folder
                    key={id}
                    folder={folder}
                    parentId={sourceId}
                    onMove={(direction) => moveFolder(id, index, direction)}
                  />
                ) : null;
              })}
            </Column>
          </Fragment>
        );
      })}
    </div>
  );
}
function Column({
  index,
  layout,
  sourceId,
  editable,
  newColumn = false,
  newRow = false,
  row,
  children,
}: {
  index: number;
  layout: Layout;
  sourceId: string;
  editable: boolean;
  newColumn?: boolean;
  newRow?: boolean;
  row: number;
  children: ReactNode;
}) {
  const labels = useLanguage().settings;
  const { ref, active, isFolderDragging } = useColumnDrop({
    index,
    layout,
    sourceId,
    editable,
    newColumn,
    newRow,
    row,
  });
  let label: string | undefined;
  if (newRow) label = labels.newRow;
  else if (newColumn) label = labels.newColumn;
  return (
    <div
      ref={ref}
      data-bookmark-column={newColumn || newRow ? undefined : index}
      aria-label={label}
      {...stylex.props(
        styles.column,
        newColumn && styles.newColumn,
        newRow && styles.newRow,
        (newColumn || newRow) && !isFolderDragging && styles.inactiveDropArea,
      )}
    >
      {newColumn || newRow ? (
        <div {...stylex.props(styles.columnIndicator, active && styles.indicatorActive)}>
          <DropIndicator placement="center" vertical={!newRow} />
        </div>
      ) : null}
      {children}
      {editable && !newColumn && !newRow ? (
        <Column index={index + 1} row={row} layout={layout} sourceId={sourceId} editable newColumn>
          {null}
        </Column>
      ) : null}
    </div>
  );
}
