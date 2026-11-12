import { sizeVars, spacingVars } from "@bolerish/tokens/semantic.stylex";
import { Button } from "@bolerish/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@bolerish/ui/dropdown-menu";
import { FieldGroup } from "@bolerish/ui/field";
import { Field, FieldLabel, FieldDescription } from "@bolerish/ui/field";
import { InputGroupButton } from "@bolerish/ui/input-group";
import { Select, SelectTrigger, SelectValue, SelectPopup, SelectList, SelectItem } from "@bolerish/ui/select";
import { Slider } from "@bolerish/ui/slider";
import { Switch } from "@bolerish/ui/switch";
import { ToggleGroup, ToggleGroupItem } from "@bolerish/ui/toggle-group";
import { CaretDownIcon, GlobeIcon } from "@phosphor-icons/react";
import * as stylex from "@stylexjs/stylex";
import { useLanguage, usePreferences, updatePreference, languages, CONTENT_WIDTH } from "~shared/lib/preferences";
const engineStyles = stylex.create({
  fieldHeading: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: spacingVars.space2 },
  visibility: { justifyContent: "space-between" },
  trigger: { width: "100%" },
  label: { display: "inline-flex", alignItems: "center", gap: spacingVars.space2 },
  logo: { width: sizeVars.iconMd, height: sizeVars.iconMd, objectFit: "contain", flexShrink: 0 },
});

export function LanguageSetting() {
  const labels = useLanguage().settings;
  const { language } = usePreferences();
  return (
    <Field>
      <FieldLabel id="language-label">{labels.language}</FieldLabel>
      <Select
        value={language}
        onValueChange={(value) => {
          if (value && Object.hasOwn(languages, value)) void updatePreference("language", value);
        }}
      >
        <SelectTrigger aria-labelledby="language-label">
          <SelectValue>{(value) => languages[value as keyof typeof languages]}</SelectValue>
        </SelectTrigger>
        <SelectPopup>
          <SelectList>
            {Object.entries(languages).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectList>
        </SelectPopup>
      </Select>
    </Field>
  );
}
export function WidthSetting() {
  const labels = useLanguage().settings;
  const { width } = usePreferences();
  return (
    <Field>
      <div {...stylex.props(engineStyles.fieldHeading)}>
        <FieldLabel id="width-label">{labels.contentWidth}</FieldLabel>
        <output>{width}%</output>
      </div>
      <FieldDescription id="width-description">{labels.contentWidthDescription}</FieldDescription>
      <Slider
        min={CONTENT_WIDTH.min}
        max={CONTENT_WIDTH.max}
        step={1}
        value={width}
        aria-labelledby="width-label"
        aria-describedby="width-description"
        getAriaLabel={() => labels.contentWidth}
        onValueChange={(value) => {
          if (typeof value === "number") void updatePreference("width", value);
        }}
      />
    </Field>
  );
}
export function EngineSelect({ compact = false }: { compact?: boolean }) {
  const labels = useLanguage().settings;
  const { engine, engineDisplay } = usePreferences();
  const options = {
    google: "Google",
    bing: "Bing",
    duckduckgo: "DuckDuckGo",
    brave: "Brave",
  };
  if (compact && engineDisplay === "none") return null;
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          compact ? (
            <InputGroupButton
              variant="ghost"
              size="icon"
              style={{ height: sizeVars.controlSm, width: sizeVars.controlSm }}
              aria-label={`${labels.searchEngine}: ${options[engine]}`}
            >
              <span aria-hidden="true">
                {engineDisplay === "letter" ? options[engine][0] : <EngineLogo engine={engine} />}
              </span>
            </InputGroupButton>
          ) : (
            <Button
              variant="outline"
              align="space-between"
              xstyle={engineStyles.trigger}
              aria-label={`${labels.searchEngine}: ${options[engine]}`}
            >
              <span {...stylex.props(engineStyles.label)}>
                <EngineLogo engine={engine} />
                {options[engine]}
              </span>
              <CaretDownIcon aria-hidden="true" />
            </Button>
          )
        }
      />
      <DropdownMenuContent>
        <DropdownMenuRadioGroup
          value={engine}
          onValueChange={(value) => {
            if (value === "google" || value === "bing" || value === "duckduckgo" || value === "brave")
              void updatePreference("engine", value);
          }}
        >
          {Object.entries(options).map(([value, label]) => (
            <DropdownMenuRadioItem key={value} value={value}>
              {label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
export function EngineSetting() {
  const labels = useLanguage().settings;
  const { searchEnabled, engineDisplay, engine } = usePreferences();
  return (
    <FieldGroup>
      <Field orientation="horizontal" xstyle={engineStyles.visibility}>
        <FieldLabel htmlFor="search-enabled">{useLanguage().search.label}</FieldLabel>
        <Switch
          id="search-enabled"
          checked={searchEnabled}
          onCheckedChange={(value) => void updatePreference("searchEnabled", value)}
        />
      </Field>
      {searchEnabled ? (
        <>
          <Field>
            <FieldLabel>{labels.searchEngine}</FieldLabel>
            <EngineSelect />
          </Field>
          <Field>
            <FieldLabel id="engine-display-label">{labels.engineDisplay}</FieldLabel>
            <ToggleGroup
              size="sm"
              variant="soft"
              aria-labelledby="engine-display-label"
              value={[engineDisplay]}
              onValueChange={(values) => {
                const value = values[0];
                if (value === "logo" || value === "none" || value === "letter")
                  void updatePreference("engineDisplay", value);
              }}
            >
              <ToggleGroupItem value="none">{labels.none}</ToggleGroupItem>
              <ToggleGroupItem value="logo" aria-label={labels.icons} title={labels.icons}>
                <EngineLogo engine={engine} />
              </ToggleGroupItem>
              <ToggleGroupItem value="letter" aria-label={labels.initialLetter} title={labels.initialLetter}>
                {engine[0].toUpperCase()}
              </ToggleGroupItem>
            </ToggleGroup>
          </Field>
        </>
      ) : null}
    </FieldGroup>
  );
}

const engineLogos: Record<string, string> = {
  google: "/search-engines/google.png",
  bing: "/search-engines/bing.ico",
  duckduckgo: "/search-engines/duckduckgo.ico",
  brave: "/search-engines/brave.png",
};
function EngineLogo({ engine }: { engine: string }) {
  return engineLogos[engine] ? (
    <img src={engineLogos[engine]} alt="" {...stylex.props(engineStyles.logo)} />
  ) : (
    <GlobeIcon aria-hidden="true" />
  );
}

export function MotionSetting() {
  const labels = useLanguage().settings;
  const { motion } = usePreferences();
  return (
    <Field>
      <FieldLabel id="motion-label">{labels.motion}</FieldLabel>
      <ToggleGroup
        variant="soft"
        size="sm"
        aria-labelledby="motion-label"
        value={[motion]}
        onValueChange={(values) => {
          const value = values[0];
          if (value === "system" || value === "on" || value === "off") void updatePreference("motion", value);
        }}
      >
        <ToggleGroupItem value="system" aria-label={labels.motionSystem} title={labels.motionSystem}>
          {labels.motionSystem}
        </ToggleGroupItem>
        <ToggleGroupItem value="on" aria-label={labels.motionOn} title={labels.motionOn}>
          {labels.motionOn}
        </ToggleGroupItem>
        <ToggleGroupItem value="off" aria-label={labels.motionOff} title={labels.motionOff}>
          {labels.motionOff}
        </ToggleGroupItem>
      </ToggleGroup>
    </Field>
  );
}

export function FolderDividersSetting() {
  const labels = useLanguage().settings;
  const { folderDividers } = usePreferences();
  return (
    <Field>
      <div {...stylex.props(engineStyles.fieldHeading)}>
        <FieldLabel id="folder-dividers-label">{labels.folderDividers}</FieldLabel>
        <Switch
          aria-labelledby="folder-dividers-label"
          checked={folderDividers}
          onCheckedChange={(checked) => void updatePreference("folderDividers", checked)}
        />
      </div>
    </Field>
  );
}
