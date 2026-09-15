"use client";

import { Toggle as TogglePrimitive } from "@base-ui/react/toggle";
import { ToggleGroup as ToggleGroupPrimitive } from "@base-ui/react/toggle-group";
import * as stylex from "@stylexjs/stylex";
import { createContext, useMemo, useContext, type ComponentProps, type ReactNode } from "react";
import {
  colorVars,
  motionVars,
  radiusVars,
  shadowVars,
  sizeVars,
  spacingVars,
  typographyVars,
} from "~shared/styles/semantic.stylex";

import type { ControlLayoutStyles, ControlPlacementStyles } from "./control-layout";
import type { ToggleSize, ToggleVariant } from "./toggle";

const styles = stylex.create({
  root: {
    alignItems: "center",
    display: "inline-flex",
    width: "var(--settings-control-width, fit-content)",
    ":is([data-orientation=vertical])": { flexDirection: "column" },
  },

  outlineItem: {
    borderColor: "transparent",
    borderRadius: 0,
    marginInlineStart: -1,
  },
  item: {
    flex: "var(--settings-toggle-flex, 0 1 auto)",
    alignItems: "center",
    borderColor: "transparent",
    borderRadius: radiusVars.sm,
    borderStyle: "solid",
    borderWidth: sizeVars.stroke,
    color: colorVars.fgPrimary,
    cursor: "pointer",
    display: "inline-flex",
    fontSize: typographyVars.fontSizeSm,
    fontWeight: typographyVars.fontWeightMedium,
    gap: spacingVars.space1,
    justifyContent: "center",
    outline: "none",
    transitionDuration: motionVars.durationFast,
    transitionProperty: "background-color, border-color, color, opacity",
    transitionTimingFunction: motionVars.easingStandard,
    ":hover": { backgroundColor: colorVars.interactionHover },
    ":focus-visible": {
      outlineColor: colorVars.strokeFocus,
      outlineOffset: sizeVars.focusRing,
      outlineStyle: "solid",
      outlineWidth: sizeVars.focusRing,
    },
    ":disabled": { cursor: "not-allowed" },
  },

  softPressed: {
    backgroundColor: colorVars.interactionSelected,
    boxShadow: shadowVars.subtle,
    ":hover": { backgroundColor: colorVars.interactionSelected },
  },
  itemPressed: {
    backgroundColor: colorVars.interactionSelected,
    color: colorVars.fgPrimary,
    boxShadow: `inset 0 0 0 ${sizeVars.stroke} ${colorVars.strokeStrong}`,
  },
  itemDisabled: {
    backgroundColor: colorVars.interactionDisabled,
    borderColor: colorVars.strokeDefault,
    color: colorVars.fgDisabled,
    cursor: "not-allowed",
    ":hover": { backgroundColor: colorVars.interactionDisabled },
  },
});

const variantStyles = stylex.create({
  default: { gap: spacingVars.space1 },
  soft: {
    gap: spacingVars.space0_5,
    padding: spacingVars.space0_5,
    backgroundColor: colorVars.bgSubtle,
    borderColor: colorVars.strokeDefault,
    borderStyle: "solid",
    borderWidth: sizeVars.stroke,
    borderRadius: radiusVars.sm,
  },
  outline: {
    backgroundColor: colorVars.bgSurface,
    borderColor: colorVars.strokeDefault,
    borderRadius: radiusVars.sm,
    borderStyle: "solid",
    borderWidth: sizeVars.stroke,
    gap: 0,
    overflow: "hidden",
  },
});

const itemSizeStyles = stylex.create({
  xs: { height: sizeVars.iconLg, minWidth: sizeVars.iconLg, paddingInline: spacingVars.space1 },
  sm: {
    height: sizeVars.controlSm,
    minWidth: sizeVars.controlSm,
    paddingInline: spacingVars.space2,
  },
  md: {
    height: sizeVars.controlMd,
    minWidth: sizeVars.controlMd,
    paddingInline: spacingVars.space3,
  },
  lg: {
    height: sizeVars.controlLg,
    minWidth: sizeVars.controlLg,
    paddingInline: spacingVars.space4,
  },
});

const itemVariantStyles = stylex.create({
  default: { backgroundColor: "transparent" },
  soft: { backgroundColor: "transparent" },
  outline: { backgroundColor: colorVars.bgSurface, borderColor: colorVars.strokeDefault },
});

type ToggleGroupContextValue = { size: ToggleSize | "xs"; variant: ToggleVariant };

export type ToggleGroupProps = Omit<ComponentProps<typeof ToggleGroupPrimitive>, "className" | "style"> & {
  children: ReactNode;
  size?: ToggleSize | "xs";
  variant?: ToggleVariant;
  xstyle?: ControlLayoutStyles;
};

export type ToggleGroupItemProps = Omit<ComponentProps<typeof TogglePrimitive>, "className" | "style"> & {
  size?: ToggleSize | "xs";
  variant?: ToggleVariant;
  xstyle?: ControlPlacementStyles;
};
const ToggleGroupContext = createContext<ToggleGroupContextValue>({
  size: "md",
  variant: "default",
});

export function ToggleGroup({ children, size = "md", variant = "default", xstyle, ...props }: ToggleGroupProps) {
  const context = useMemo(() => ({ size, variant }), [size, variant]);
  return (
    <ToggleGroupPrimitive {...props} {...stylex.props(styles.root, variantStyles[variant], xstyle)}>
      <ToggleGroupContext value={context}>{children}</ToggleGroupContext>
    </ToggleGroupPrimitive>
  );
}

export function ToggleGroupItem({ size, variant, xstyle, ...props }: ToggleGroupItemProps) {
  const context = useContext(ToggleGroupContext);
  const finalSize = size ?? context.size;
  const finalVariant = variant ?? context.variant;
  function getToggleStyles(state: TogglePrimitive.State) {
    return stylex.props(
      styles.item,
      itemSizeStyles[finalSize],
      itemVariantStyles[finalVariant],
      state.pressed && styles.itemPressed,
      state.pressed && finalVariant === "soft" && styles.softPressed,
      state.disabled && styles.itemDisabled,
      finalVariant === "outline" && styles.outlineItem,
      xstyle,
    );
  }
  return (
    <TogglePrimitive
      {...props}
      className={(state) => getToggleStyles(state).className}
      style={(state) => getToggleStyles(state).style}
    />
  );
}
