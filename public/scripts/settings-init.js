(() => {
  const APPEARANCE_SETTINGS_STORAGE_KEY = "newtab:settings:appearance:v1";
  const SYSTEM_FONT_FAMILY = 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
  const SYSTEM_FONT_FAMILY_ALIASES = [
    SYSTEM_FONT_FAMILY,
    'system-ui, -apple-system, "system-ui", "Segoe UI", sans-serif',
    'system-ui, -apple-system, "system-ui", "Segoe UI"',
  ];

  function syncAppearanceSettings(settings) {
    const rootStyle = document.documentElement.style;

    if (typeof settings?.cornerRadius === "number" && Number.isFinite(settings.cornerRadius)) {
      rootStyle.setProperty("--mds-corner-radius", `${Math.min(12, Math.max(0, settings.cornerRadius))}px`);
    }

    if (typeof settings?.fontSize === "number" && Number.isFinite(settings.fontSize)) {
      rootStyle.setProperty("--mds-content-font-size", `${Math.min(16, Math.max(10, settings.fontSize))}px`);
    } else {
      rootStyle.removeProperty("--mds-content-font-size");
    }

    if (
      typeof settings?.fontFamily === "string" &&
      settings.fontFamily.trim().length > 0 &&
      !fontFamilyIsSystemFont(settings.fontFamily.trim())
    ) {
      rootStyle.setProperty("--mds-font-family", `${settings.fontFamily.trim()}, ${SYSTEM_FONT_FAMILY}`);
    } else {
      rootStyle.removeProperty("--mds-font-family");
    }
  }

  function fontFamilyIsSystemFont(fontFamily) {
    const normalizedFontFamily = normalizeFontFamily(fontFamily);

    return SYSTEM_FONT_FAMILY_ALIASES.some(
      (systemFontFamily) => normalizeFontFamily(systemFontFamily) === normalizedFontFamily,
    );
  }

  function normalizeFontFamily(fontFamily) {
    return fontFamily
      .split(",")
      .map((fontName) =>
        fontName
          .trim()
          .replace(/^["']|["']$/g, "")
          .toLowerCase(),
      )
      .filter(Boolean)
      .join(",");
  }

  try {
    const storageArea = globalThis.chrome?.storage?.local;
    if (!storageArea) return;

    storageArea.get(APPEARANCE_SETTINGS_STORAGE_KEY, (result) => {
      syncAppearanceSettings(result?.[APPEARANCE_SETTINGS_STORAGE_KEY]);
    });
  } catch {}
})();
