import { ArrowCounterClockwiseIcon } from "@phosphor-icons/react";
import { useEffect, useState } from "react";
import { UI_LANGUAGE } from "~shared/lib/language";
import { Button } from "~shared/ui/button";
import { Input } from "~shared/ui/input";
import { Slider } from "~shared/ui/slider";
import { type Theme, useTheme } from "~shared/ui/ThemeProvider";
import { ToggleGroup, ToggleGroupItem } from "~shared/ui/toggle-group";

import { Section, SectionContent, SectionHeader, SectionItem } from "~/entrypoints/newtab/settings/ui/Section";
import { useStorageValue } from "~/entrypoints/shared/hooks/useStorageValue";

import { CORNER_RADIUS, FONT_SIZE } from "../model/constants";
import { getInitialAppearanceSettings } from "../model/init";
import { appearanceStorage } from "../model/storage";
import type { AppearanceSettings, BookmarkIconDisplayMode } from "../model/types";
import { updateAppearanceSetting } from "../model/update";

export function Appearance() {
  const settings = useStorageValue(appearanceStorage, getInitialAppearanceSettings);

  return (
    <Section>
      <SectionHeader title="Appearance" />
      <SectionContent>
        <Theme />
        <FontFamily fontFamily={settings.fontFamily} />
        <FontSize fontSize={settings.fontSize} />
        <BookmarkIcon bookmarkIconDisplayMode={settings.bookmarkIconDisplayMode} />
        <CornerRadius cornerRadius={settings.cornerRadius} />
      </SectionContent>
    </Section>
  );
}

const THEME_LABELS = {
  dark: "Dark",
  light: "Light",
  system: "System",
} satisfies Record<Theme, string>;

const CORNER_RADIUS_SLIDER_STEP = 0.5;
const CORNER_RADIUS_PREVIEW_INSET = 2;

function Theme() {
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

function FontFamily({ fontFamily }: { fontFamily: AppearanceSettings["fontFamily"] }) {
  const [placeholder, setPlaceholder] = useState("");

  useEffect(() => {
    void browser.fontSettings.getFont({ genericFamily: "standard" }).then(({ fontId }) => {
      setPlaceholder(fontId);
    });
  }, []);

  return (
    <SectionItem label="Font">
      <div className="grid gap-1">
        <p className="text-muted-foreground/75 text-mds-setting-group" id="font-family-hint">
          {UI_LANGUAGE.settings.appearance.fontFamily.description}
        </p>
        <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-2">
          <Input
            aria-describedby="font-family-hint"
            aria-label="Font"
            className="border-input text-foreground/80 text-mds-setting-item placeholder:text-muted-foreground/55 h-7 bg-transparent px-2.5 py-1 font-mono focus-visible:ring-0"
            placeholder={placeholder}
            value={fontFamily}
            onChange={(event) => void updateAppearanceSetting("fontFamily", event.target.value)}
          />
          {fontFamily ? (
            <Button
              aria-label="Reset"
              className="h-7 w-7 p-0"
              size="icon-sm"
              type="button"
              variant="outline"
              onClick={() => void updateAppearanceSetting("fontFamily", "")}
            >
              <ArrowCounterClockwiseIcon aria-hidden="true" />
            </Button>
          ) : null}
        </div>
      </div>
    </SectionItem>
  );
}

function FontSize({ fontSize }: { fontSize: AppearanceSettings["fontSize"] }) {
  return (
    <SectionItem description={UI_LANGUAGE.settings.appearance.fontSize.description} label="Size">
      <div className="grid grid-cols-[1fr_auto] items-center gap-3">
        <Slider
          aria-label="Font size"
          indicatorClassName="bg-primary"
          max={FONT_SIZE.max}
          min={FONT_SIZE.min}
          step={FONT_SIZE.step}
          value={fontSize ?? FONT_SIZE.preview}
          onValueChange={(value) => void updateAppearanceSetting("fontSize", value)}
        />
        <button
          aria-label="Reset font size"
          className="border-input text-foreground/70 text-mds-setting-group hover:bg-accent hover:text-accent-foreground rounded-mds h-7 min-w-12 border bg-transparent px-2 transition-colors"
          type="button"
          onClick={() => void updateAppearanceSetting("fontSize", null)}
        >
          {fontSize ?? FONT_SIZE.preview}px
        </button>
      </div>
    </SectionItem>
  );
}

function BookmarkIcon({ bookmarkIconDisplayMode }: { bookmarkIconDisplayMode: BookmarkIconDisplayMode }) {
  return (
    <SectionItem description={UI_LANGUAGE.settings.appearance.bookmarkIcon.description} label="Icons">
      <ToggleGroup
        aria-label="Bookmark icon display"
        className="grid h-7 w-full"
        size="sm"
        spacing={0}
        style={{ gridTemplateColumns: "repeat(4, minmax(0, 1fr))" }}
        type="single"
        value={bookmarkIconDisplayMode}
        variant="outline"
        onValueChange={(value) => {
          if (value) void updateAppearanceSetting("bookmarkIconDisplayMode", value as BookmarkIconDisplayMode);
        }}
      >
        <ToggleGroupItem value="original">Icon</ToggleGroupItem>
        <ToggleGroupItem value="square">Square</ToggleGroupItem>
        <ToggleGroupItem value="dash">Dash</ToggleGroupItem>
        <ToggleGroupItem value="none">None</ToggleGroupItem>
      </ToggleGroup>
    </SectionItem>
  );
}

function CornerRadius({ cornerRadius }: { cornerRadius: AppearanceSettings["cornerRadius"] }) {
  return (
    <SectionItem label="Corner radius">
      <div className="grid grid-cols-[1fr_auto] items-center gap-3">
        <Slider
          aria-label="Corner radius"
          className="mx-auto w-full max-w-xs"
          indicatorClassName="bg-primary"
          max={CORNER_RADIUS.max}
          min={CORNER_RADIUS.min}
          step={CORNER_RADIUS_SLIDER_STEP}
          value={cornerRadius}
          onValueChange={(value) => void updateAppearanceSetting("cornerRadius", value)}
        />
        <div
          aria-hidden="true"
          className="border-border bg-muted grid size-5 place-items-center border"
          style={{ borderRadius: `${cornerRadius}px` }}
        >
          <div
            className="bg-primary size-3"
            style={{ borderRadius: `${Math.max(0, cornerRadius - CORNER_RADIUS_PREVIEW_INSET)}px` }}
          />
        </div>
      </div>
    </SectionItem>
  );
}
