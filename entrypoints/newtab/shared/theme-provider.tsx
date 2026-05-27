import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

import { storage } from "#imports";

export type Theme = "dark" | "light" | "system";

const THEME_STORAGE_KEY = "newtab:theme-mode";
const DARK_BACKGROUND_COLOR = "oklch(0.13 0.01 247)";
const LIGHT_BACKGROUND_COLOR = "oklch(0.99 0.003 247)";

type ThemeProviderProps = {
  children: ReactNode;
  defaultTheme?: Theme;
};

type ThemeProviderState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
};

const themeStorage = storage.defineItem<Theme>(`local:${THEME_STORAGE_KEY}`, {
  fallback: "system",
});

let initialTheme: Theme = "system";

const ThemeProviderContext = createContext<ThemeProviderState | null>(null);

export function ThemeProvider({ children, defaultTheme = "system" }: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(() => fetchStoredTheme(defaultTheme));

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    syncThemeStyles(theme, mediaQuery.matches);

    if (theme !== "system") {
      return;
    }

    function handleSystemThemeChange(event: MediaQueryListEvent) {
      syncThemeStyles("system", event.matches);
    }

    mediaQuery.addEventListener("change", handleSystemThemeChange);

    return () => {
      mediaQuery.removeEventListener("change", handleSystemThemeChange);
    };
  }, [theme]);

  useEffect(() => {
    return themeStorage.watch(setThemeState);
  }, []);

  const setTheme = useCallback((nextTheme: Theme) => {
    void themeStorage.setValue(nextTheme);
  }, []);

  const value = useMemo(
    () => ({
      theme,
      setTheme,
    }),
    [setTheme, theme],
  );

  return <ThemeProviderContext.Provider value={value}>{children}</ThemeProviderContext.Provider>;
}

export function useTheme(): ThemeProviderState {
  const context = useContext(ThemeProviderContext);

  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }

  return context;
}

export async function loadInitialThemeMode(): Promise<void> {
  initialTheme = sanitizeTheme(await themeStorage.getValue(), "system");
  const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

  syncThemeStyles(initialTheme, mediaQuery.matches);
}

function fetchStoredTheme(defaultTheme: Theme): Theme {
  return sanitizeTheme(initialTheme, defaultTheme);
}

function sanitizeTheme(theme: unknown, defaultTheme: Theme): Theme {
  return theme === "dark" || theme === "light" || theme === "system" ? theme : defaultTheme;
}

function syncThemeStyles(theme: Theme, systemPrefersDark: boolean) {
  const darkModeIsActive = theme === "dark" || (theme === "system" && systemPrefersDark);
  const resolvedTheme = darkModeIsActive ? "dark" : "light";
  const backgroundColor = darkModeIsActive ? DARK_BACKGROUND_COLOR : LIGHT_BACKGROUND_COLOR;
  const root = window.document.documentElement;

  root.classList.toggle("dark", darkModeIsActive);
  root.style.colorScheme = resolvedTheme;
  root.style.backgroundColor = backgroundColor;
}
