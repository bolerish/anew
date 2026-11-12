import { colorVars, sizeVars } from "@bolerish/tokens/semantic.stylex";
import * as stylex from "@stylexjs/stylex";

export const inputFocusStyles = stylex.create({
  underline: {
    outlineStyle: { default: "none", ":focus-within": "none", ":has(input:focus-visible)": "none" },
    borderBottomColor: {
      default: colorVars.strokeDefault,
      ":has(input:focus-visible)": {
        default: colorVars.strokeFocus,
        "@media (forced-colors: active)": "Highlight",
      },
      ":has(input:is([aria-invalid='true'], :user-invalid))": colorVars.strokeFeedbackError,
      ":has(input:is([aria-invalid='true'], :user-invalid)):has(input:focus-visible)": {
        default: colorVars.strokeFeedbackError,
        "@media (forced-colors: active)": "Highlight",
      },
    },
    borderBottomWidth: {
      default: sizeVars.stroke,
      ":has(input:focus-visible)": { "@media (forced-colors: active)": sizeVars.focusRing },
    },
    boxShadow: {
      default: "none",
      ":has(input:focus-visible)": {
        default: `inset 0 calc(${sizeVars.stroke} - ${sizeVars.focusRing}) 0 ${colorVars.strokeFocus}`,
        "@media (forced-colors: active)": "none",
      },
      ":has(input:is([aria-invalid='true'], :user-invalid)):has(input:focus-visible)": {
        default: `inset 0 calc(${sizeVars.stroke} - ${sizeVars.focusRing}) 0 ${colorVars.strokeFeedbackError}`,
        "@media (forced-colors: active)": "none",
      },
    },
  },
});
