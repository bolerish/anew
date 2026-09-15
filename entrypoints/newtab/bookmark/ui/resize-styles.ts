import * as stylex from "@stylexjs/stylex";
import { colorVars, sizeVars } from "~shared/styles/semantic.stylex";

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
      ":hover": colorVars.fgSecondary,
      ":active": colorVars.strokeFocus,
      ":focus-visible": colorVars.strokeFocus,
    },
  },
  vertical: { cursor: "col-resize", backgroundSize: `${sizeVars.focusRing} 100%` },
  horizontal: { cursor: "row-resize", backgroundSize: `100% ${sizeVars.focusRing}` },
});
