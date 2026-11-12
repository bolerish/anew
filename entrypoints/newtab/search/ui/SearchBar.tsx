import { spacingVars, colorVars, typo } from "@bolerish/tokens/semantic.stylex";
import {
  Combobox,
  ComboboxInput,
  ComboboxPopup,
  ComboboxList,
  ComboboxItem,
  ComboboxEmpty,
} from "@bolerish/ui/combobox";
import { Kbd } from "@bolerish/ui/kbd";
import * as stylex from "@stylexjs/stylex";
import type { ComponentProps } from "react";
import { useEffect, useRef, useState } from "react";
import { resolvePageIconUrl } from "~newtab/bookmark/lib/item-view";
import type { BookmarkItem } from "~newtab/bookmark/model/types";
import { isKeyboardShortcutTarget } from "~newtab/bookmark/model/useKeyboardNavigation";
import { ItemIcon } from "~newtab/bookmark/ui/ItemIcon";
import { EngineSelect } from "~newtab/settings/ui/Preferences";
import { useLanguage } from "~shared/lib/preferences";

const styles = stylex.create({
  popup: {
    width: "var(--anchor-width)",
    minWidth: 0,
    maxWidth: "var(--available-width)",
    boxSizing: "border-box",
  },
  result: { display: "grid", minWidth: 0 },
  url: {
    color: colorVars.fgSecondary,
    fontSize: typo.fontSizeXs,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  form: { marginInline: spacingVars.space4, flexShrink: 0 },
});

type SearchBarProps = {
  results: BookmarkItem[];
  onSearch: () => Promise<void>;
  onValueChange: (value: string) => void;
  value: string;
};

export function SearchBar({ onSearch, onValueChange, value, results }: SearchBarProps) {
  const UI_LANGUAGE = useLanguage();
  const [open, setOpen] = useState(false);
  const highlighted = useRef<BookmarkItem | undefined>(undefined);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    window.addEventListener("keydown", handleSearchFocusShortcut);

    return () => {
      window.removeEventListener("keydown", handleSearchFocusShortcut);
    };

    function handleSearchFocusShortcut(e: KeyboardEvent) {
      const hasModifier = e.metaKey || e.ctrlKey || e.altKey;
      if (e.isComposing || e.key !== "/" || hasModifier) {
        return;
      }

      if (isKeyboardShortcutTarget(e.target, true)) {
        return;
      }

      e.preventDefault();
      inputRef.current?.focus();
    }
  }, []);

  const handleKeyDown: NonNullable<ComponentProps<typeof ComboboxInput>["onKeyDown"]> = (e) => {
    if (e.nativeEvent.isComposing) return;
    if (e.key === "Enter" && !highlighted.current) {
      e.preventDefault();
      e.preventBaseUIHandler();
      void onSearch();
      return;
    }
    if (e.key !== "Escape") {
      return;
    }
    e.preventDefault();
    e.preventBaseUIHandler();
    e.stopPropagation();
    inputRef.current?.blur();
    setOpen(false);
    highlighted.current = undefined;
    onValueChange("");
  };

  return (
    <Combobox<BookmarkItem>
      items={results}
      filter={null}
      autoHighlight={false}
      highlightItemOnHover={false}
      value={null}
      inputValue={value}
      onInputValueChange={(next) => {
        onValueChange(next);
        highlighted.current = undefined;
      }}
      open={open && Boolean(value.trim())}
      onOpenChange={setOpen}
      itemToStringLabel={(item) => item.title}
      onItemHighlighted={(item) => {
        highlighted.current = item;
      }}
      onValueChange={(item) => {
        if (item) window.location.assign(item.url);
      }}
    >
      <form
        {...stylex.props(styles.form)}
        onSubmit={(e) => {
          e.preventDefault();
          void onSearch();
        }}
      >
        <ComboboxInput
          variant="inline"
          startAddon={<EngineSelect compact />}
          endAddon={<Kbd>/</Kbd>}
          aria-label={UI_LANGUAGE.search.label}
          ref={inputRef}
          onKeyDown={handleKeyDown}
          placeholder={UI_LANGUAGE.search.placeholder}
        />
      </form>
      <ComboboxPopup xstyle={styles.popup}>
        <ComboboxEmpty>{UI_LANGUAGE.bookmark.noResults}</ComboboxEmpty>
        <ComboboxList>
          {(item: BookmarkItem) => (
            <ComboboxItem key={item.id} value={item}>
              <span aria-hidden="true">
                <ItemIcon icon={resolvePageIconUrl(item.url)} label={item.title || item.url} />
              </span>
              <span {...stylex.props(styles.result)}>
                <span>{item.title || item.url}</span>
                <span {...stylex.props(styles.url)}>{item.url}</span>
              </span>
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxPopup>
    </Combobox>
  );
}
