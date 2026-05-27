import { MagnifyingGlassIcon } from "@phosphor-icons/react";
import { useEffect, useRef } from "react";
import { UI_LANGUAGE } from "~newtab/shared/lib/language";
import { Input } from "~newtab/shared/ui/input";
import { Kbd } from "~newtab/shared/ui/kbd";

import { useSearch } from "../hooks/useSearch";

export function SearchBar() {
  const { searchQuery, setSearchQuery, handleSearchSubmit } = useSearch();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    window.addEventListener("keydown", handleSearchFocusShortcut);

    return () => {
      window.removeEventListener("keydown", handleSearchFocusShortcut);
    };

    function handleSearchFocusShortcut(event: KeyboardEvent) {
      if (event.key !== "/" || event.metaKey || event.ctrlKey || event.altKey) {
        return;
      }

      if (isTextInputTarget(event.target)) {
        return;
      }

      event.preventDefault();
      inputRef.current?.focus();
    }
  }, []);

  return (
    <form onSubmit={handleSearchSubmit} className="sticky top-0 z-10 h-8 shrink-0 px-6">
      <div className="group border-border focus-within:border-b-ring mx-1 flex items-center justify-start border-b bg-transparent transition-colors">
        <MagnifyingGlassIcon className="text-muted-foreground mr-1 ml-2 size-4" />
        <Input
          aria-label={UI_LANGUAGE.search.label}
          ref={inputRef}
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          onKeyDown={(event) => {
            if (event.key !== "Escape") {
              return;
            }
            event.preventDefault();
            setSearchQuery("");
          }}
          placeholder={UI_LANGUAGE.search.placeholder}
          className="text-mds-input-placeholder placeholder:text-mds-input-placeholder h-8 rounded-none border-0 bg-transparent focus-visible:ring-0 dark:bg-transparent"
        />
        <Kbd className="outline-border text-muted-foreground mx-1 h-6 bg-transparent outline">/</Kbd>
      </div>
    </form>
  );
}

function isTextInputTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) {
    return false;
  }

  return target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement || target.isContentEditable;
}
