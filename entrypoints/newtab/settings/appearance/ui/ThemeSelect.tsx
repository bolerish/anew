import { Field, FieldLabel } from "@bolerish/ui/field";
import { ToggleGroup, ToggleGroupItem } from "@bolerish/ui/toggle-group";
import { MonitorIcon, MoonIcon, SunIcon } from "@phosphor-icons/react";
import { useLanguage } from "~shared/lib/preferences";
import { useTheme } from "~shared/lib/theme";
export function ThemeSelect() {
  const UI_LANGUAGE = useLanguage();
  const { theme, setTheme } = useTheme();
  return (
    <Field>
      <FieldLabel id="theme-label">{UI_LANGUAGE.settings.theme}</FieldLabel>
      <ToggleGroup
        aria-labelledby="theme-label"
        variant="soft"
        value={[theme]}
        onValueChange={(values) => {
          const value = values[0];
          if (value === "system" || value === "light" || value === "dark") setTheme(value);
        }}
      >
        <ToggleGroupItem value="system" aria-label={UI_LANGUAGE.settings.system} title={UI_LANGUAGE.settings.system}>
          <MonitorIcon aria-hidden="true" />
        </ToggleGroupItem>
        <ToggleGroupItem value="light" aria-label={UI_LANGUAGE.settings.light} title={UI_LANGUAGE.settings.light}>
          <SunIcon aria-hidden="true" />
        </ToggleGroupItem>
        <ToggleGroupItem value="dark" aria-label={UI_LANGUAGE.settings.dark} title={UI_LANGUAGE.settings.dark}>
          <MoonIcon aria-hidden="true" />
        </ToggleGroupItem>
      </ToggleGroup>
    </Field>
  );
}
