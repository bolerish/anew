import { useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";

export function useUpdatesPage() {
  const [reader, setReader] = useState<"updates" | null>(null);
  const readerTransition = useRef<ViewTransition | null>(null);
  function renderReader(next: "updates" | null) {
    const update = () => flushSync(() => setReader(next));
    readerTransition.current?.skipTransition();
    if (document.startViewTransition && document.documentElement.dataset.motionReduced !== "true") {
      document.documentElement.dataset.readerTransition = next ? "forward" : "back";
      const transition = document.startViewTransition(update);
      readerTransition.current = transition;
      void transition.finished.finally(() => {
        if (readerTransition.current === transition) {
          delete document.documentElement.dataset.readerTransition;
          readerTransition.current = null;
        }
      });
    } else update();
  }
  useEffect(() => {
    function restoreReader() {
      const value = window.history.state?.minHelp;
      renderReader(value === "updates" ? value : null);
    }
    window.addEventListener("popstate", restoreReader);
    return () => window.removeEventListener("popstate", restoreReader);
  }, []);
  function changeReader(next: "updates" | null) {
    if (next === null && window.history.state?.minHelp) {
      window.history.back();
      return;
    }
    if (next !== null) window.history.pushState({ ...window.history.state, minHelp: next }, "");
    renderReader(next);
  }

  useEffect(() => () => readerTransition.current?.skipTransition(), []);
  return { isOpen: reader !== null, open: () => changeReader("updates"), close: () => changeReader(null) };
}
