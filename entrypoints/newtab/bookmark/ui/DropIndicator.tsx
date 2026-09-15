import * as stylex from "@stylexjs/stylex";
import { colorVars, sizeVars } from "~shared/styles/semantic.stylex";

import type { DropEdge } from "../lib/dnd";

const styles = stylex.create({
  line: {
    position: "absolute",
    insetInline: 0,
    height: sizeVars.stroke,
    backgroundColor: colorVars.bgActionPrimary,
    pointerEvents: "none",
    zIndex: 2,
  },
  vertical: { top: 0, bottom: 0, left: "50%", right: "auto", width: sizeVars.stroke, height: "100%" },
  verticalBefore: { left: 0 },
  verticalAfter: { left: "auto", right: 0 },
  center: { top: "50%" },
  before: { top: 0 },
  after: { bottom: 0 },
});

type DropIndicatorProps = { edge: DropEdge; placement: "inside" | "outside" } | { placement: "center" };

export function DropIndicator(props: DropIndicatorProps & { vertical?: boolean }) {
  const center = props.placement === "center";
  const before = !center && props.edge === "before";
  let position: stylex.StyleXStyles = before ? styles.before : styles.after;
  if (center) position = styles.center;
  return (
    <div
      aria-hidden="true"
      {...stylex.props(
        styles.line,
        position,
        props.vertical && styles.vertical,
        props.vertical && !center && (before ? styles.verticalBefore : styles.verticalAfter),
      )}
    />
  );
}
