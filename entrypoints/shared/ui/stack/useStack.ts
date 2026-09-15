import { createUseFunnel, type AnyFunnelState } from "@use-funnel/core";
import { useContext, useState } from "react";

import { StackTransitionContext } from "./Stack";

/** Manages in-memory screen history within a Stack viewport. */
function useStackRouter({ initialState }: { initialState: AnyFunnelState }) {
  const transition = useContext(StackTransitionContext);
  const [state, setState] = useState(() => ({ history: [initialState], index: 0 }));
  if (!transition) throw new Error("useStack must be used within Stack");

  return {
    history: state.history,
    currentIndex: state.index,
    push(next: AnyFunnelState) {
      return transition(() => {
        setState((previous) => ({
          history: [...previous.history.slice(0, previous.index + 1), next],
          index: previous.index + 1,
        }));
      }, "forward");
    },
    replace(next: AnyFunnelState) {
      return transition(() => {
        setState((previous) => {
          const history = [...previous.history];
          history[previous.index] = next;
          return { ...previous, history };
        });
      }, "forward");
    },
    go(delta: number) {
      const index = state.index + delta;
      if (!Number.isInteger(delta) || index < 0 || index >= state.history.length || index === state.index) return;
      return transition(() => setState((previous) => ({ ...previous, index })), delta < 0 ? "back" : "forward");
    },
    // Memory history is discarded with this hook; there is no external router to clean up.
    cleanup() {},
  };
}

export const useStack = createUseFunnel<Record<string, never>>(useStackRouter);
