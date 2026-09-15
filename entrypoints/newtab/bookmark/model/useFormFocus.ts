import { useEffect, useEffectEvent, useRef } from "react";

export function useFormFocus({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const formRef = useRef<HTMLFormElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const dismiss = useEffectEvent(onClose);
  useEffect(() => {
    if (!isOpen) return;
    inputRef.current?.focus();
    function outside(event: Event) {
      if (event.target instanceof Node && !formRef.current?.contains(event.target)) dismiss();
    }
    document.addEventListener("pointerdown", outside, { capture: true });
    document.addEventListener("focusin", outside, { capture: true });
    window.addEventListener("popstate", dismiss);
    return () => {
      document.removeEventListener("pointerdown", outside, { capture: true });
      document.removeEventListener("focusin", outside, { capture: true });
      window.removeEventListener("popstate", dismiss);
    };
  }, [isOpen]);
  return { formRef, inputRef };
}
