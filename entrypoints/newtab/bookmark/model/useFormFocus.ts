import { useEffect, useRef } from "react";

type UseFormFocusInput = {
  isOpen: boolean;
  onOutsidePointerDown: () => void;
};

export function useFormFocus({ isOpen, onOutsidePointerDown }: UseFormFocusInput) {
  const formRef = useRef<HTMLFormElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const onOutsidePointerDownRef = useRef(onOutsidePointerDown);

  onOutsidePointerDownRef.current = onOutsidePointerDown;

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    inputRef.current?.focus();

    function handleDocumentPointerDown(event: PointerEvent) {
      if (event.target instanceof Node && formRef.current?.contains(event.target)) {
        return;
      }

      onOutsidePointerDownRef.current();
    }

    document.addEventListener("pointerdown", handleDocumentPointerDown);

    return () => {
      document.removeEventListener("pointerdown", handleDocumentPointerDown);
    };
  }, [isOpen]);

  return { formRef, inputRef };
}
