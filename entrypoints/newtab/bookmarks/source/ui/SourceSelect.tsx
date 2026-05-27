import { UI_LANGUAGE } from "~newtab/shared/lib/language";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "~newtab/shared/ui/select";

import type { BookmarkSource } from "../../lib/model";

type SourceSelectProps = {
  selectedSourceId: string | null;
  sources: BookmarkSource[];
  onSourceChange: (sourceId: string) => void;
};
export function SourceSelect({ selectedSourceId, sources, onSourceChange }: SourceSelectProps) {
  if (sources.length <= 1) {
    return null;
  }

  const sourceLabels = new Map(sources.map((source) => [source.id, source.title]));

  return (
    <Select value={selectedSourceId ?? undefined} onValueChange={onSourceChange}>
      <SelectTrigger
        aria-label={UI_LANGUAGE.bookmarks.label.source}
        className="text-foreground/75 h-6 w-26 px-1.5 sm:w-37.5"
        size="sm"
      >
        <SelectValue>{(value) => sourceLabels.get(value) ?? value}</SelectValue>
      </SelectTrigger>
      <SelectContent align="end" className="w-anchor min-w-anchor font-mono" position="popper">
        <SelectGroup>
          <SelectLabel className="text-muted-foreground text-mds-caption">
            {UI_LANGUAGE.bookmarks.label.sourceGroup}
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
