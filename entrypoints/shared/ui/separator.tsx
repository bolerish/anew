"use client";

import { Separator as SeparatorPrimitive } from "@base-ui/react/separator";
import * as stylex from "@stylexjs/stylex";
import type { ComponentProps } from "react";
import { colorVars, sizeVars } from "~shared/styles/semantic.stylex";

const styles = stylex.create({
  root: { backgroundColor: colorVars.strokeDefault, flexShrink: 0 },
});

const orientationStyles = stylex.create({
  horizontal: { height: sizeVars.stroke, width: "100%" },
  vertical: { alignSelf: "stretch", minHeight: sizeVars.touchTarget, width: sizeVars.stroke },
});

export type SeparatorProps = Omit<ComponentProps<typeof SeparatorPrimitive>, "className" | "style"> & {
  decorative?: boolean;
  xstyle?: stylex.StyleXStyles;
};

export function Separator({ decorative = true, orientation = "horizontal", xstyle, ...props }: SeparatorProps) {
  return (
    <SeparatorPrimitive
      {...props}
      aria-hidden={decorative || undefined}
      orientation={orientation}
      role={decorative ? "presentation" : undefined}
      {...stylex.props(styles.root, orientationStyles[orientation], xstyle)}
    />
  );
}
