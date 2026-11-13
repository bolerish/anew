import { densityStyles } from "@bolerish/tokens/density.stylex";
import { sizeVars, colorVars, typo, radiusVars } from "@bolerish/tokens/semantic.stylex";
import { lightColorTheme, darkColorTheme, lightShadowTheme, darkShadowTheme } from "@bolerish/tokens/themes.stylex";
import * as stylex from "@stylexjs/stylex";
import { useLayoutEffect, useState } from "react";
import { z } from "zod";
import { useStorageValue } from "~shared/hooks/useStorageValue";

import { storage } from "#imports";

import { notifyError } from "./notify-error";

const minSizeTheme = stylex.createTheme(sizeVars, {
  contentXs: "18rem",
  contentSm: "24rem",
  contentMd: "32rem",
});
const radiusTheme = stylex.createTheme(radiusVars, {
  sm: "var(--mds-corner-radius, 0px)",
  md: "calc(var(--mds-corner-radius, 0px) * 4 / 3)",
  lg: "calc(var(--mds-corner-radius, 0px) * 2)",
  xl: "calc(var(--mds-corner-radius, 0px) * 8 / 3)",
});
const baseStyles = stylex.create({
  root: {
    "--min-page-background": colorVars.bgSurface,
    color: colorVars.fgPrimary,
    fontFamily: typo.fontFamilyBody,
    lineHeight: typo.lineHeightNormal,
  },
  dark: { "--min-page-background": colorVars.bgCanvas },
});

export const themeSchema = z.enum(["dark", "light", "system"]);
export type Theme = z.output<typeof themeSchema>;

const THEME_STORAGE_KEY = "newtab:theme-mode";
const THEME_CACHE_KEY = `${THEME_STORAGE_KEY}:cache`;

const themeStorage = storage.defineItem<Theme>(`local:${THEME_STORAGE_KEY}`, {
  fallback: "system",
});

/** Apply the cached theme before settings load, then resolve the saved theme. */
export async function initializeTheme(): Promise<void> {
  const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
  syncThemeStyles(getCachedTheme("system"), mediaQuery.matches);

  const theme = sanitizeTheme(await themeStorage.getValue(), "system");
  cacheTheme(theme);
  syncThemeStyles(theme, mediaQuery.matches);
}

export function useThemeSync() {
  const { theme } = useTheme();
  const [systemDark, setSystemDark] = useState(() => window.matchMedia("(prefers-color-scheme: dark)").matches);
  useLayoutEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const update = () => setSystemDark(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);
  useLayoutEffect(() => {
    cacheTheme(theme);
    return syncThemeStyles(theme, systemDark);
  }, [theme, systemDark]);
}

export function useTheme() {
  const theme = sanitizeTheme(
    useStorageValue(themeStorage, () => getCachedTheme("system")),
    "system",
  );
  return {
    theme,
    setTheme: (value: Theme) => {
      cacheTheme(value);
      void themeStorage.setValue(value).catch(notifyError);
    },
  };
}

function cacheTheme(theme: Theme): void {
  try {
    window.localStorage.setItem(THEME_CACHE_KEY, theme);
  } catch {}
}

function getCachedTheme(defaultTheme: Theme): Theme {
  try {
    return sanitizeTheme(window.localStorage.getItem(THEME_CACHE_KEY), defaultTheme);
  } catch {
    return defaultTheme;
  }
}

function sanitizeTheme(theme: unknown, defaultTheme: Theme): Theme {
  return themeSchema.safeParse(theme).data ?? defaultTheme;
}

function syncThemeStyles(theme: Theme, systemPrefersDark: boolean) {
  const isDarkModeActive = theme === "dark" || (theme === "system" && systemPrefersDark);
  const resolvedTheme = isDarkModeActive ? "dark" : "light";
  const root = window.document.documentElement;

  root.dataset.bolerishTheme = resolvedTheme;
  root.classList.toggle("dark", isDarkModeActive);
  root.style.colorScheme = resolvedTheme;
  const previousClasses = root.dataset.nueeTheme?.split(" ").filter(Boolean) ?? [];
  root.classList.remove(...previousClasses);
  const nextClasses =
    stylex
      .props(
        baseStyles.root,
        isDarkModeActive && baseStyles.dark,
        densityStyles.compact,
        radiusTheme,
        minSizeTheme,
        isDarkModeActive ? darkColorTheme : lightColorTheme,
        isDarkModeActive ? darkShadowTheme : lightShadowTheme,
      )
      .className?.split(" ")
      .filter(Boolean) ?? [];
  root.classList.add(...nextClasses);
  root.dataset.nueeTheme = nextClasses.join(" ");
  return () => {
    root.classList.remove(...nextClasses);
    delete root.dataset.nueeTheme;
  };
}
