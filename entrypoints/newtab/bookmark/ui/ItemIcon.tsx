import { CircleIcon } from "@phosphor-icons/react";
import * as stylex from "@stylexjs/stylex";
import { useEffect, useState } from "react";
import { useTheme } from "~shared/lib/theme";
import { colorVars, spacingVars, sizeVars, radiusVars, typographyVars } from "~shared/styles/semantic.stylex";

import { getIconAppearance } from "../lib/icon-appearance";

const styles = stylex.create({
  dot: { width: spacingVars.space1, height: spacingVars.space1 },
  marker: {
    width: sizeVars.iconLg,
    height: sizeVars.iconLg,
    display: "grid",
    placeItems: "center",
    flexShrink: 0,
    color: colorVars.fgSecondary,
    fontSize: typographyVars.fontSizeSm,
  },
  fallback: { backgroundColor: colorVars.bgSubtle, borderRadius: radiusVars.sm, fontSize: typographyVars.fontSizeXs },
  image: { width: sizeVars.iconMd, height: sizeVars.iconMd, objectFit: "contain" },
  gridIcon: { width: sizeVars.iconLg, height: sizeVars.iconLg },
  invert: { filter: "invert(1)" },
  dim: { filter: "brightness(0.9)" },
});

type ItemIconProps = {
  icon: string | undefined;
  label: string;
  marker?: "dash" | "square";
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
        {marker === "square" ? <CircleIcon aria-hidden="true" weight="fill" {...stylex.props(styles.dot)} /> : "—"}
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
