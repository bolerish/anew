import { colorVars, sizeVars } from "@bolerish/tokens/semantic.stylex";
import * as stylex from "@stylexjs/stylex";

export const resizeStyles = stylex.create({
  handle: {
    padding: 0,
    margin: 0,
    appearance: "none",
    borderWidth: 0,
    borderStyle: "none",
    outlineStyle: "none",
    ":focus-visible": {
      outlineStyle: "solid",
      outlineColor: colorVars.strokeFocus,
      outlineWidth: sizeVars.focusRing,
      outlineOffset: sizeVars.stroke,
    },
    boxShadow: "none",
    touchAction: "none",
    backgroundColor: "transparent",
    backgroundImage: "linear-gradient(currentColor, currentColor)",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    color: {
      default: "transparent",
      ":active": colorVars.strokeFocus,
      ":focus-visible": colorVars.strokeFocus,
    },
  },
  vertical: { cursor: "col-resize", backgroundSize: `${sizeVars.focusRing} 100%` },
  horizontal: { cursor: "row-resize", backgroundSize: `100% ${sizeVars.focusRing}` },
  editing: {
    color: {
      default: colorVars.fgSecondary,
      ":hover": colorVars.strokeFocus,
      ":active": colorVars.strokeFocus,
      ":focus-visible": colorVars.strokeFocus,
    },
  },
  horizontalGrip: { backgroundSize: `${sizeVars.controlSm} ${sizeVars.focusRing}` },
  verticalGrip: { backgroundSize: `${sizeVars.focusRing} ${sizeVars.controlSm}` },
});
