import {
  getInitialShortcutSettings,
  shortcutStorage,
  type ShortcutSettings,
} from "~newtab/settings/shortcut/lib/shortcut-settings";
import { cn } from "~newtab/shared/lib/utils";
import { Kbd, KbdGroup } from "~newtab/shared/ui/kbd";

import { useStorageSelector } from "~/entrypoints/newtab/shared/hooks/useStorageSelector";

export function ShortcutHints() {
  const showShortcutHints = useStorageSelector(
    shortcutStorage,
    selectShowShortcutHints,
    getInitialShortcutSettings().showShortcutHints,
  );

  return (
    <div
      className={cn(
        "mr-auto hidden min-w-0 flex-wrap items-center gap-x-4 gap-y-2 transition duration-150 sm:flex",
        showShortcutHints ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-2 opacity-0",
      )}
    >
      <ShortcutHint keys={["/"]} label="Focus search" />
      <ShortcutHint keys={["↑", "↓"]} label="Move selection" />
      <ShortcutHint keys={["Enter"]} label="Open" />
      <ShortcutHint keys={["E key"]} label="Edit" />
      <ShortcutHint keys={["Esc"]} label="Clear" />
    </div>
  );
}

function selectShowShortcutHints(settings: ShortcutSettings): boolean {
  return settings.showShortcutHints;
}

type ShortcutHintProps = {
  keys: string[];
  label: string;
};

function ShortcutHint({ keys, label }: ShortcutHintProps) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <KbdGroup>
        {keys.map((key) => (
          <Kbd className="text-mds-shortcut-key h-4 min-w-4 rounded-none px-1" key={key}>
            {key}
          </Kbd>
        ))}
      </KbdGroup>
      <span className="text-mds-shortcut-label">{label}</span>
    </span>
  );
}
