import { spacingVars, sizeVars } from "@bolerish/tokens/semantic.stylex";
import * as stylex from "@stylexjs/stylex";
export const contentLayout = stylex.create({
  page: {
    marginInline: "auto",
    paddingBlock: spacingVars.space6,
    "--page-padding-start": { default: spacingVars.space4, "@media (min-width: 600px)": spacingVars.space10 },
    paddingInlineStart: "var(--page-padding-start)",
    paddingInlineEnd: "var(--page-padding-end)",
    "--page-padding-end": {
      default: spacingVars.space4,
      "@media (min-width: 600px)": spacingVars.space10,
      "@media (min-width: 900px)": `calc(${sizeVars.controlSm} + 2.5rem + ${spacingVars.space4})`,
    },
  },
  width: (value: number) => ({
    maxWidth: "none",
    width: `min(100%, max(calc(28.75rem + var(--page-padding-start) + var(--page-padding-end)), ${value}%))`,
  }),
});
