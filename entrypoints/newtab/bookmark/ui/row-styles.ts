import { sizeVars, spacingVars } from "@bolerish/tokens/semantic.stylex";
import * as stylex from "@stylexjs/stylex";

export const rowStyles = stylex.create({
  inset: { borderWidth: 0, paddingInlineStart: spacingVars.space2, paddingInlineEnd: 0 },
  columns: {
    display: "grid",
    gridTemplateColumns: `calc(${sizeVars.controlSm} - ${spacingVars.space2}) minmax(0,1fr)`,
    alignItems: "center",
    gap: spacingVars.space2,
    minWidth: 0,
  },
  iconSlot: {
    width: `calc(${sizeVars.iconLg} * var(--mds-content-scale, 1))`,
    height: `calc(${sizeVars.iconLg} * var(--mds-content-scale, 1))`,
    display: "grid",
    placeItems: "center",
    flexShrink: 0,
  },
  labelInset: { paddingInline: spacingVars.space1 },
});
