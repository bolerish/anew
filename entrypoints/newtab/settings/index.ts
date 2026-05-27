import { loadInitialAppearanceSettings } from "./appearance";
import { loadInitialDateSettings } from "./date";
import { loadInitialShortcutSettings } from "./shortcut/lib/shortcut-settings";
import { loadInitialTimeSettings } from "./time";

export { Setting } from "./Setting";
export { ShortcutHints } from "./shortcut/ui/ShortcutHints";

export async function loadInitialSettings(): Promise<void> {
  await Promise.all([
    loadInitialAppearanceSettings(),
    loadInitialDateSettings(),
    loadInitialShortcutSettings(),
    loadInitialTimeSettings(),
  ]);
}
