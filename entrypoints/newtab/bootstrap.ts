import { loadInitialSettings } from "./settings";
import { loadInitialThemeMode } from "./shared/theme-provider";

export async function loadInitialNewTabState(): Promise<void> {
  await Promise.all([loadInitialSettings(), loadInitialThemeMode()]);
}
