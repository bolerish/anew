"use client";

import { ScrollArea as ScrollAreaPrimitive } from "@base-ui/react/scroll-area";
import * as stylex from "@stylexjs/stylex";
import type { ComponentProps, ReactNode } from "react";
import { colorVars, motionVars, radiusVars, spacingVars } from "~shared/styles/semantic.stylex";

const styles = stylex.create({
  root: { overflow: "hidden", position: "relative" },
  viewport: { height: "100%", width: "100%" },
  content: { minWidth: "100%" },
  scrollbar: {
    display: "flex",
    padding: spacingVars.space0_5,
    touchAction: "none",
    transitionDuration: motionVars.durationFast,
    transitionProperty: "background-color",
    transitionTimingFunction: motionVars.easingStandard,
    userSelect: "none",
  },

  autoHide: {
    opacity: { default: 0, ":is([data-hovering], [data-scrolling], :active)": 1 },
    pointerEvents: { default: "none", ":is([data-hovering], [data-scrolling], :active)": "auto" },
    transitionProperty: "opacity",
  },
  thumb: {
    backgroundColor: colorVars.strokeDefault,
    borderRadius: radiusVars.full,
    flex: 1,
    minHeight: 0,
    minWidth: 0,
    transitionDuration: motionVars.durationFast,
    transitionProperty: "background-color",
    transitionTimingFunction: motionVars.easingStandard,
    ":hover": { backgroundColor: colorVars.strokeStrong },
  },
  corner: { backgroundColor: "transparent" },
});

const orientationStyles = stylex.create({
  horizontal: { flexDirection: "column", height: 10, width: "100%", paddingBlock: 3 },
  vertical: { height: "100%", width: 10, paddingInline: 3 },
});

const thumbOrientationStyles = stylex.create({
  horizontal: { minWidth: 20 },
  vertical: { minHeight: 20 },
});

export type ScrollAreaProps = Omit<ComponentProps<typeof ScrollAreaPrimitive.Root>, "className" | "style"> & {
  children: ReactNode;
  autoHide?: boolean;
  scrollbars?: "both" | "horizontal" | "vertical";
  xstyle?: stylex.StyleXStyles;
};

export function ScrollArea({ children, scrollbars = "vertical", autoHide = false, xstyle, ...props }: ScrollAreaProps) {
  return (
    <ScrollAreaPrimitive.Root {...props} {...stylex.props(styles.root, xstyle)}>
      {children}
      {scrollbars === "vertical" || scrollbars === "both" ? (
        <ScrollBar orientation="vertical" xstyle={autoHide && styles.autoHide} />
      ) : null}
      {scrollbars === "horizontal" || scrollbars === "both" ? (
        <ScrollBar orientation="horizontal" xstyle={autoHide && styles.autoHide} />
      ) : null}
      <ScrollAreaPrimitive.Corner {...stylex.props(styles.corner)} />
    </ScrollAreaPrimitive.Root>
  );
}

export function ScrollBar({
  xstyle,
  orientation = "vertical",
  ...props
}: Omit<ComponentProps<typeof ScrollAreaPrimitive.Scrollbar>, "className" | "style"> & {
  xstyle?: stylex.StyleXStyles;
}) {
  return (
    <ScrollAreaPrimitive.Scrollbar
      {...props}
      {...stylex.props(styles.scrollbar, orientationStyles[orientation], xstyle)}
      orientation={orientation}
    >
      <ScrollAreaPrimitive.Thumb {...stylex.props(styles.thumb, thumbOrientationStyles[orientation])} />
    </ScrollAreaPrimitive.Scrollbar>
  );
}

export function ScrollAreaViewport({
  xstyle,
  ...props
}: Omit<ComponentProps<typeof ScrollAreaPrimitive.Viewport>, "className" | "style"> & {
  xstyle?: stylex.StyleXStyles;
}) {
  return <ScrollAreaPrimitive.Viewport {...props} {...stylex.props(styles.viewport, xstyle)} />;
}

export function ScrollAreaContent({
  xstyle,
  ...props
}: Omit<ComponentProps<typeof ScrollAreaPrimitive.Content>, "className" | "style"> & {
  xstyle?: stylex.StyleXStyles;
}) {
  return <ScrollAreaPrimitive.Content {...props} {...stylex.props(styles.content, xstyle)} />;
}
