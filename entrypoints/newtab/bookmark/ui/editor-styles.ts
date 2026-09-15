import * as stylex from "@stylexjs/stylex";
import { colorVars, spacingVars, sizeVars, typographyVars } from "~shared/styles/semantic.stylex";

export const editorStyles = stylex.create({
  group: {
    fontSize: typographyVars.fontSizeSm,
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
    fontSize: `calc(${typographyVars.fontSizeSm} * var(--mds-content-scale, 1))`,
    fontWeight: typographyVars.fontWeightRegular,
    lineHeight: typographyVars.lineHeightNormal,
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
