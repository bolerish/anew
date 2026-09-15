import { monitorForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { act, renderHook } from "@testing-library/react";
import { expect, test, vi } from "vitest";

import { useColumnDrop } from "./useColumnDrop";

vi.mock("@atlaskit/pragmatic-drag-and-drop/element/adapter", () => ({
  monitorForElements: vi.fn<() => () => void>(() => () => {}),
  dropTargetForElements: vi.fn<() => () => void>(() => () => {}),
}));

test("extra column hit areas activate only for a folder drag", () => {
  const { result } = renderHook(() =>
    useColumnDrop({
      index: 1,
      layout: { columns: [["a"], ["b"]], widths: [1, 1] },
      sourceId: "root",
      editable: true,
      newColumn: true,
      newRow: false,
      row: 0,
    }),
  );
  const monitor = vi.mocked(monitorForElements).mock.calls[0][0];
  expect(result.current.isFolderDragging).toBe(false);
  expect(
    monitor.canMonitor!({ source: { data: { kind: "item" } } } as unknown as Parameters<
      NonNullable<typeof monitor.canMonitor>
    >[0]),
  ).toBe(false);
  act(() => monitor.onDragStart!({} as Parameters<NonNullable<typeof monitor.onDragStart>>[0]));
  expect(result.current.isFolderDragging).toBe(true);
  act(() => monitor.onDrop!({} as Parameters<NonNullable<typeof monitor.onDrop>>[0]));
  expect(result.current.isFolderDragging).toBe(false);
});
