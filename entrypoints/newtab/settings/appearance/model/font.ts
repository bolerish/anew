export function syncFontFamily(rootStyle: CSSStyleDeclaration, fontFamilyValue: string): void {
  const trimmed = fontFamilyValue.trim();
  if (trimmed) {
    rootStyle.setProperty("--mds-font-family", trimmed);
  } else {
    rootStyle.removeProperty("--mds-font-family");
  }
}
