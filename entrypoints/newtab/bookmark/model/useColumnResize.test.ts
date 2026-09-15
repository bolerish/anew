import { act, renderHook } from "@testing-library/react";
import type { KeyboardEvent, PointerEvent } from "react";
import { expect, test, vi } from "vitest";

import { saveColumnLayout } from "../../settings/bookmark/model/settings";
import { useColumnResize } from "./useColumnResize";
vi.mock("../../settings/bookmark/model/settings", () => ({
  saveColumnLayout: vi.fn<() => Promise<void>>(async () => {}),
}));
test("resize clamps, preserves total width, cancels and resets", async () => {
  const { result } = renderHook(() =>
    useColumnResize({
      layout: { columns: [["a"], ["b"]], widths: [1, 1] },
      indices: [0, 1],
      editable: true,
      sourceId: "root",
    }),
  );
  result.current.container.current = { clientWidth: 200 } as HTMLDivElement;
  const event = {
    clientX: 0,
    pointerId: 1,
    currentTarget: { setPointerCapture: vi.fn<() => void>(), releasePointerCapture: vi.fn<() => void>() },
  } as unknown as PointerEvent<HTMLDivElement>;
  act(() => {
    result.current.handleResizeStart(event, 1);
    result.current.resizeTo(10000);
  });
  expect(result.current.widths[0]).toBeCloseTo(1.9);
  expect(result.current.widths[1]).toBeCloseTo(0.1);
  await act(async () => result.current.handleResizeEnd(event));
  expect(saveColumnLayout).toHaveBeenCalledOnce();
  act(() => {
    result.current.handleResizeStart(event, 1);
    result.current.resizeTo(-10000);
  });
  act(() => result.current.cancelResize());
  expect(result.current.widths).toEqual([1, 1]);
  act(() =>
    result.current.handleResizeKeyDown(
      { key: "ArrowRight", preventDefault: vi.fn<() => void>() } as unknown as KeyboardEvent<HTMLDivElement>,
      1,
    ),
  );
  expect(vi.mocked(saveColumnLayout).mock.calls.at(-1)?.[1].widths[0]).toBeCloseTo(1.1);
  await act(async () => result.current.resetWidths());
  expect(vi.mocked(saveColumnLayout).mock.calls.at(-1)?.[1].widths).toEqual([1, 1]);
});
