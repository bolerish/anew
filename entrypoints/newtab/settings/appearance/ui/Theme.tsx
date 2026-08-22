import { SectionItem } from "~newtab/settings/ui/SettingsSection";
import { type Theme, useTheme } from "~shared/ui/ThemeProvider";
import { ToggleGroup, ToggleGroupItem } from "~shared/ui/toggle-group";

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
        aria-label="Theme"
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
