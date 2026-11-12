import { colorVars, spacingVars, sizeVars, radiusVars, typo } from "@bolerish/tokens/semantic.stylex";
import { CircleIcon } from "@phosphor-icons/react";
import * as stylex from "@stylexjs/stylex";
import { useEffect, useState } from "react";
import { useTheme } from "~shared/lib/theme";

import { getIconAppearance } from "../lib/icon-appearance";

const styles = stylex.create({
  dot: {
    width: `calc(${spacingVars.space1} * var(--mds-content-scale, 1))`,
    height: `calc(${spacingVars.space1} * var(--mds-content-scale, 1))`,
  },
  marker: {
    width: `calc(${sizeVars.iconLg} * var(--mds-content-scale, 1))`,
    height: `calc(${sizeVars.iconLg} * var(--mds-content-scale, 1))`,
    display: "grid",
    placeItems: "center",
    flexShrink: 0,
    color: colorVars.fgSecondary,
    fontSize: `calc(${typo.fontSizeSm} * var(--mds-content-scale, 1))`,
  },
  fallback: {
    backgroundColor: colorVars.bgSubtle,
    borderRadius: radiusVars.sm,
    fontSize: `calc(${typo.fontSizeXs} * var(--mds-content-scale, 1))`,
  },
  image: {
    width: `calc(${sizeVars.iconMd} * var(--mds-content-scale, 1))`,
    height: `calc(${sizeVars.iconMd} * var(--mds-content-scale, 1))`,
    objectFit: "contain",
  },
  gridIcon: {
    width: `calc(${sizeVars.iconLg} * var(--mds-content-scale, 1))`,
    height: `calc(${sizeVars.iconLg} * var(--mds-content-scale, 1))`,
  },
  invert: { filter: "invert(1)" },
  dim: { filter: "brightness(0.9)" },
});

type ItemIconProps = {
  icon: string | undefined;
  label: string;
  marker?: "dash" | "dot";
  size?: "default" | "grid";
};

export function ItemIcon({ icon, label, marker, size = "default" }: ItemIconProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark" || (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
  const [hasLoadError, setHasLoadError] = useState(false);
  const [appearance, setAppearance] = useState<ReturnType<typeof getIconAppearance>>("normal");

  useEffect(() => {
    setHasLoadError(false);
  }, [icon]);

  if (marker) {
    return (
      <span aria-hidden="true" {...stylex.props(styles.marker, size === "grid" && styles.gridIcon)}>
        {marker === "dot" ? <CircleIcon aria-hidden="true" weight="fill" {...stylex.props(styles.dot)} /> : "—"}
      </span>
    );
  }

  if (!icon || hasLoadError) {
    return (
      <span aria-hidden="true" {...stylex.props(styles.marker, styles.fallback, size === "grid" && styles.gridIcon)}>
        {label.trim().charAt(0).toUpperCase() || "?"}
      </span>
    );
  }

  return (
    <span aria-hidden="true" {...stylex.props(styles.marker, size === "grid" && styles.gridIcon)}>
      <img
        alt=""
        {...stylex.props(
          styles.image,
          size === "grid" && styles.gridIcon,
          isDark && appearance === "dark" && styles.invert,
          isDark && appearance === "light" && styles.dim,
        )}
        src={icon}
        onError={() => setHasLoadError(true)}
        onLoad={(e) => setAppearance(getIconAppearance(e.currentTarget))}
      />
    </span>
  );
}
