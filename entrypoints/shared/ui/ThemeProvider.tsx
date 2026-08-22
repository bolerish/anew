import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

import { storage } from "#imports";

export type Theme = "dark" | "light" | "system";

const THEME_STORAGE_KEY = "newtab:theme-mode";
const THEME_CACHE_KEY = `${THEME_STORAGE_KEY}:cache`;
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

const ThemeProviderContext = createContext<ThemeProviderState | null>(null);

export function ThemeProvider({ children, defaultTheme = "system" }: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(() => getCachedTheme(defaultTheme));

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
    let isMounted = true;
    void themeStorage.getValue().then((storedTheme) => {
      if (isMounted) setThemeState(sanitizeTheme(storedTheme, defaultTheme));
    });

    const unwatchTheme = themeStorage.watch((storedTheme) => setThemeState(sanitizeTheme(storedTheme, defaultTheme)));

    return () => {
      isMounted = false;
      unwatchTheme();
    };
  }, [defaultTheme]);

  const setTheme = useCallback((nextTheme: Theme) => {
    setThemeState(nextTheme);
    cacheTheme(nextTheme);
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
  return theme === "dark" || theme === "light" || theme === "system" ? theme : defaultTheme;
}

function syncThemeStyles(theme: Theme, systemPrefersDark: boolean) {
  const isDarkModeActive = theme === "dark" || (theme === "system" && systemPrefersDark);
  const resolvedTheme = isDarkModeActive ? "dark" : "light";
  const backgroundColor = isDarkModeActive ? DARK_BACKGROUND_COLOR : LIGHT_BACKGROUND_COLOR;
  const root = window.document.documentElement;

  root.classList.toggle("dark", isDarkModeActive);
  root.style.colorScheme = resolvedTheme;
  root.style.backgroundColor = backgroundColor;
}
