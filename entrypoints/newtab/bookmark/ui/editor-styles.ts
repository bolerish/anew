import { colorVars, spacingVars, sizeVars, typo } from "@bolerish/tokens/semantic.stylex";
import * as stylex from "@stylexjs/stylex";

export const editorStyles = stylex.create({
  group: {
    fontSize: typo.fontSizeSm,
    borderRadius: 0,
    marginBottom: spacingVars.space3,
    borderBottomWidth: sizeVars.stroke,
    borderBottomStyle: "solid",
    borderBottomColor: colorVars.strokeDefault,
    ":focus-within": { borderBottomColor: colorVars.strokeFocus },
  },
  inputGroup: {
    backgroundColor: "transparent",
    borderWidth: 0,
    borderBottomWidth: sizeVars.stroke,
    ":focus-within": { outlineStyle: "none" },
  },
  invalid: {
    borderBottomColor: colorVars.strokeFeedbackError,
    ":focus-within": { borderBottomColor: colorVars.strokeFeedbackError },
  },
  fields: {
    display: "grid",
    minWidth: 0,
    fontSize: `calc(${typo.fontSizeSm} * var(--mds-content-scale, 1))`,
    fontWeight: typo.fontWeightRegular,
    lineHeight: typo.lineHeightNormal,
  },
  actions: {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    alignSelf: "center",
    height: sizeVars.controlMd,
    gap: 0,
  },
});
