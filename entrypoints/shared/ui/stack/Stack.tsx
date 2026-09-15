import * as stylex from "@stylexjs/stylex";
import { createContext, useCallback, useEffect, useRef, type ReactNode } from "react";
import { flushSync } from "react-dom";

import "./stack.css";

const styles = stylex.create({
  viewport: { minWidth: 0 },
});

type StackTransition = (update: () => void, direction: "forward" | "back") => Promise<void>;
export const StackTransitionContext = createContext<StackTransition | null>(null);

/** Owns the viewport, native transition lifecycle, and focus for one stack. */
export function Stack({ children }: { children: ReactNode }) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const activeTransition = useRef<ViewTransition | null>(null);

  useEffect(() => () => activeTransition.current?.skipTransition(), []);

  const transition = useCallback(async (update: () => void, direction: "forward" | "back") => {
    if (activeTransition.current) {
      activeTransition.current.skipTransition();
      await activeTransition.current.finished;
    }
    const viewport = viewportRef.current;
    function commit() {
      flushSync(update);
      viewport?.focus({ preventScroll: true });
    }
    if (
      !viewport ||
      !document.startViewTransition ||
      document.documentElement?.dataset.motionReduced === "true" ||
      (document.documentElement?.dataset.motionReduced !== "false" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches) ||
      document.documentElement.dataset.stackTransition
    ) {
      commit();
      return;
    }
    viewport.style.viewTransitionName = "stack-page";
    document.documentElement.dataset.stackTransition = direction;
    const animation = document.startViewTransition(commit);
    activeTransition.current = animation;
    try {
      await animation.finished;
    } finally {
      viewport.style.viewTransitionName = "";
      delete document.documentElement.dataset.stackTransition;
      activeTransition.current = null;
    }
  }, []);

  return (
    <StackTransitionContext value={transition}>
      <div ref={viewportRef} tabIndex={-1} {...stylex.props(styles.viewport)}>
        {children}
      </div>
    </StackTransitionContext>
  );
}
