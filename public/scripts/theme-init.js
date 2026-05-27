(() => {
  const THEME_STORAGE_KEY = "newtab:theme-mode";
  const DARK_BACKGROUND_COLOR = "oklch(0.13 0.01 247)";
  const LIGHT_BACKGROUND_COLOR = "oklch(0.99 0.003 247)";

  function syncTheme(theme) {
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const resolvedTheme = theme === "system" ? (prefersDark ? "dark" : "light") : theme;
    const darkModeIsActive = resolvedTheme === "dark";
    const root = document.documentElement;

    root.classList.toggle("dark", darkModeIsActive);
    root.style.colorScheme = resolvedTheme;
    root.style.backgroundColor = darkModeIsActive ? DARK_BACKGROUND_COLOR : LIGHT_BACKGROUND_COLOR;
  }

  function sanitizeTheme(theme) {
    return theme === "dark" || theme === "light" || theme === "system" ? theme : "system";
  }

  try {
    syncTheme("system");

    const storageArea = globalThis.chrome?.storage?.local;
    if (!storageArea) return;

    storageArea.get(THEME_STORAGE_KEY, (result) => {
      syncTheme(sanitizeTheme(result?.[THEME_STORAGE_KEY]));
    });
  } catch {}
})();
