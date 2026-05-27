import { type Theme, useTheme } from "~newtab/shared/theme-provider";
import { ToggleGroup, ToggleGroupItem } from "~newtab/shared/ui/toggle-group";

import { SectionItem } from "../../ui/Section";

const THEME_LABELS = {
  dark: "Dark",
  light: "Light",
  system: "System",
} satisfies Record<Theme, string>;

export function Theme() {
  const { theme, setTheme } = useTheme();

  return (
    <SectionItem label="Theme">
      <ToggleGroup
        className="grid h-7 w-full"
        size="sm"
        spacing={0}
        style={{ gridTemplateColumns: "repeat(3, minmax(0, 1fr))" }}
        type="single"
        value={theme}
        variant="outline"
        onValueChange={(value) => {
          if (value) setTheme(value as Theme);
        }}
      >
        <ToggleGroupItem value="system">{THEME_LABELS.system}</ToggleGroupItem>
        <ToggleGroupItem value="light">{THEME_LABELS.light}</ToggleGroupItem>
        <ToggleGroupItem value="dark">{THEME_LABELS.dark}</ToggleGroupItem>
      </ToggleGroup>
    </SectionItem>
  );
}
