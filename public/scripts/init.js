(() => {
  const rootElement = document.documentElement;
  const DARK_BACKGROUND_COLOR = "oklch(0.13 0.01 247)";
  const LIGHT_BACKGROUND_COLOR = "oklch(0.99 0.003 247)";

  const THEME_STORAGE_KEY = "newtab:theme-mode";
  const THEME_CACHE_KEY = `${THEME_STORAGE_KEY}:cache`;
  const APPEARANCE_SETTINGS_STORAGE_KEY = "newtab:settings:appearance:v1";
  let theme = "system";

  try {
    const cachedTheme = localStorage.getItem(THEME_CACHE_KEY);

    if (isThemeMode(cachedTheme)) {
      theme = cachedTheme;
    }
  } catch {
    // The Chrome storage value below is the source of truth.
  }

  syncTheme(theme);

  const storageArea = globalThis.chrome?.storage?.local;
  if (!storageArea) return;

  storageArea.get([THEME_STORAGE_KEY, APPEARANCE_SETTINGS_STORAGE_KEY], (storageData) => {
    const storedTheme = storageData?.[THEME_STORAGE_KEY];
    let theme = "system";

    if (isThemeMode(storedTheme)) {
      theme = storedTheme;
    }

    try {
      localStorage.setItem(THEME_CACHE_KEY, theme);
    } catch {
      // The cache only prevents a theme flash before Chrome storage responds.
    }

    syncTheme(theme);
    syncAppearance(storageData?.[APPEARANCE_SETTINGS_STORAGE_KEY]);
  });

  function isThemeMode(theme) {
    return theme === "dark" || theme === "light" || theme === "system";
  }

  function syncTheme(theme) {
    const prefersDarkTheme = window.matchMedia("(prefers-color-scheme: dark)").matches;
    let resolvedTheme = theme;

    if (theme === "system") {
      resolvedTheme = prefersDarkTheme ? "dark" : "light";
    }

    rootElement.classList.toggle("dark", resolvedTheme === "dark");
    rootElement.style.colorScheme = resolvedTheme;
    rootElement.style.backgroundColor = resolvedTheme === "dark" ? DARK_BACKGROUND_COLOR : LIGHT_BACKGROUND_COLOR;
  }

  function syncAppearance(settings) {
    const rootStyle = rootElement.style;
    const cornerRadius = settings?.cornerRadius;
    const fontSize = settings?.fontSize;
    const fontFamily = settings?.fontFamily.trim();

    if (typeof cornerRadius === "number" && Number.isFinite(cornerRadius)) {
      rootStyle.setProperty("--mds-corner-radius", `${Math.min(12, Math.max(0, cornerRadius))}px`);
    }

    if (typeof fontSize === "number" && Number.isFinite(fontSize)) {
      rootStyle.setProperty("--mds-content-font-size", `${Math.min(16, Math.max(10, fontSize))}px`);
    } else {
      rootStyle.removeProperty("--mds-content-font-size");
    }

    if (fontFamily) {
      rootStyle.setProperty("--mds-font-family", fontFamily);
    } else {
      rootStyle.removeProperty("--mds-font-family");
    }
  }
})();
