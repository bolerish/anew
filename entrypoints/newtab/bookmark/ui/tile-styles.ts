import { spacingVars } from "@bolerish/tokens/semantic.stylex";
import * as stylex from "@stylexjs/stylex";

export const tileStyles = stylex.create({
  view: {
    paddingInline: 0,
    paddingBlock: 0,
    display: "flex",
    flexDirection: "column",
    height: "auto",
    minHeight: "var(--bookmark-tile-height)",
    justifyContent: "center",
  },
  content: { display: "flex", flexDirection: "column", alignItems: "center", gap: spacingVars.space1 },
  label: {
    width: "fit-content",
    maxWidth: "100%",
    height: "2lh",
    flexShrink: 0,
    display: "-webkit-box",
    WebkitBoxOrient: "vertical",
    WebkitLineClamp: 2,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "normal",
    overflowWrap: "anywhere",
  },
});
