import { render, fireEvent } from "@testing-library/react";
import { expect, test, vi } from "vitest";

import { useFormFocus } from "./useFormFocus";
test("creation form focuses input, closes outside and cleans up listeners", () => {
  const close = vi.fn<() => void>();
  function Form() {
    const { formRef, inputRef } = useFormFocus({ isOpen: true, onClose: close });
    return (
      <form ref={formRef}>
        <input aria-label="Title" ref={inputRef} />
      </form>
    );
  }
  const { getByRole, unmount } = render(<Form />);
  expect(document.activeElement).toBe(getByRole("textbox"));
  fireEvent.pointerDown(getByRole("textbox"));
  expect(close).not.toHaveBeenCalled();
  fireEvent.pointerDown(document.body);
  fireEvent(window, new PopStateEvent("popstate"));
  expect(close).toHaveBeenCalledTimes(2);
  unmount();
  fireEvent.pointerDown(document.body);
  expect(close).toHaveBeenCalledTimes(2);
});
