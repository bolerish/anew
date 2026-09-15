import { act, render } from "@testing-library/react";
import { expect, test, vi } from "vitest";
import { Toaster, toast } from "~shared/ui/toast";

import { notifyError } from "./notify-error";
import { preferenceStorage, preferenceDefaults } from "./preferences";

test("renders a localized failure toast without internal error details", async () => {
  await preferenceStorage.setValue({ ...preferenceDefaults, language: "ko" });
  const log = vi.spyOn(console, "error").mockImplementation(() => {});
  const { findByText, queryByText } = render(<Toaster />);
  await act(() => notifyError(new Error("Internal backend details")));
  expect(await findByText("작업을 완료하지 못했습니다. 다시 시도해 주세요.")).toBeTruthy();
  expect(queryByText("Internal backend details")).toBeNull();
  act(() => toast.close());
  log.mockRestore();
});
