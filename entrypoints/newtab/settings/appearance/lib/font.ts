export const SYSTEM_FONT_FAMILY = `system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`;

const SYSTEM_FONT_FAMILY_ALIASES = [
  SYSTEM_FONT_FAMILY,
  `system-ui, -apple-system, "system-ui", "Segoe UI", sans-serif`,
  `system-ui, -apple-system, "system-ui", "Segoe UI"`,
] as const;

export function syncFontFamily(rootStyle: CSSStyleDeclaration, fontFamilyValue: string): void {
  const trimmed = fontFamilyValue.trim();
  if (trimmed.length > 0 && !isSystemFontFamily(trimmed)) {
    rootStyle.setProperty("--mds-font-family", `${trimmed}, ${SYSTEM_FONT_FAMILY}`);
  } else {
    rootStyle.removeProperty("--mds-font-family");
  }
}

export function isSystemFontFamily(fontFamily: string): boolean {
  const normalized = normalizeFontFamily(fontFamily);
  return SYSTEM_FONT_FAMILY_ALIASES.some((alias) => normalizeFontFamily(alias) === normalized);
}

export function normalizeFontFamily(fontFamily: string): string {
  return fontFamily
    .split(",")
    .map((name) =>
      name
        .trim()
        .replace(/^["']|["']$/g, "")
        .toLowerCase(),
    )
    .filter(Boolean)
    .join(",");
}
