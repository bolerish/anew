import { cn } from "~shared/lib/utils";

import type { DropEdge } from "../lib/dnd";

type DropIndicatorProps = { edge: DropEdge; placement: "inside" | "outside" } | { placement: "center" };

export function DropIndicator(props: DropIndicatorProps) {
  const className = getPlacementClassName(props);

  return (
    <div
      aria-hidden="true"
      className={cn("bg-primary pointer-events-none absolute right-0 left-0 z-20 h-px rounded-full", className)}
    />
  );
}

function getPlacementClassName(props: DropIndicatorProps): string {
  if (props.placement === "center") {
    return "top-1/2 -translate-y-1/2";
  }

  if (props.placement === "inside") {
    return props.edge === "before" ? "top-0" : "bottom-0";
  }

  return props.edge === "before" ? "top-0 -translate-y-1/2" : "bottom-0 translate-y-1/2";
}
