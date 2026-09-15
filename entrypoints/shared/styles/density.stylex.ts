import * as stylex from "@stylexjs/stylex";

import { sizeVars, spacingVars, typographyVars } from "./semantic.stylex";

// Scale Min controls, spacing, and text together; preserve focus indicators.
const DENSITY = 0.875;

export const compactSpacingTheme = stylex.createTheme(spacingVars, {
  space0: "0",
  space0_5: `calc(0.125rem * ${DENSITY})`,
  space1: `calc(0.25rem * ${DENSITY})`,
  space2: `calc(0.5rem * ${DENSITY})`,
  space3: `calc(0.75rem * ${DENSITY})`,
  space4: `calc(1rem * ${DENSITY})`,
  space5: `calc(1.25rem * ${DENSITY})`,
  space6: `calc(1.5rem * ${DENSITY})`,
  space8: `calc(2rem * ${DENSITY})`,
  space10: `calc(2.5rem * ${DENSITY})`,
  space12: `calc(3rem * ${DENSITY})`,
});

export const compactSizeTheme = stylex.createTheme(sizeVars, {
  controlXs: "1.5rem",
  controlSm: `calc(2rem * ${DENSITY})`,
  controlMd: `calc(2.25rem * ${DENSITY})`,
  controlLg: `calc(2.5rem * ${DENSITY})`,
  controlXl: `calc(3rem * ${DENSITY})`,
  iconXs: `calc(0.75rem * ${DENSITY})`,
  iconSm: `calc(0.875rem * ${DENSITY})`,
  iconMd: `calc(1rem * ${DENSITY})`,
  iconLg: `calc(1.25rem * ${DENSITY})`,
  trackSm: `calc(0.375rem * ${DENSITY})`,
  trackMd: `calc(0.5rem * ${DENSITY})`,
});

export const compactTypographyTheme = stylex.createTheme(typographyVars, {
  fontFamily: "var(--mds-font-family, system-ui)",
  fontFamilyBody: "var(--mds-font-family, system-ui)",
  fontFamilyHeading: "var(--mds-heading-font-family, system-ui)",
  fontSizeXs: `calc(0.75rem * ${DENSITY})`,
  fontSizeSm: `calc(0.875rem * ${DENSITY})`,
  fontSizeMd: `calc(1rem * ${DENSITY})`,
  fontSizeLg: `calc(1.125rem * ${DENSITY})`,
  fontSizeXl: `calc(1.5rem * ${DENSITY})`,
});
