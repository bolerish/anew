import { UI_LANGUAGE } from "~shared/lib/language";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "~shared/ui/select";

import type { BookmarkSource } from "../model/bookmark-model";

type SourceSelectProps = {
  selectedSourceId: string | null;
  sources: BookmarkSource[];
  onSourceChange: (sourceId: string) => void;
};
export function SourceSelect({ selectedSourceId, sources, onSourceChange }: SourceSelectProps) {
  if (sources.length <= 1) {
    return null;
  }

  return (
    <Select value={selectedSourceId ?? undefined} onValueChange={onSourceChange}>
      <SelectTrigger
        aria-label={UI_LANGUAGE.bookmark.label.source}
        className="text-foreground/75 h-6 w-26 px-1.5 sm:w-37.5"
        size="sm"
      >
        <SelectValue>{(value) => sources.find((source) => source.id === value)?.title ?? value}</SelectValue>
      </SelectTrigger>
      <SelectContent align="end" className="w-anchor min-w-anchor font-mono" position="popper">
        <SelectGroup>
          <SelectLabel className="text-muted-foreground text-mds-caption">
            {UI_LANGUAGE.bookmark.label.sourceGroup}
          </SelectLabel>
          {sources.map((source) => (
            <SelectItem key={source.id} value={source.id}>
              {source.title}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
