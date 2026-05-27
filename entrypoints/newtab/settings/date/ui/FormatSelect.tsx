import type { DateFormat } from "~newtab/settings/date";
import { cn } from "~newtab/shared/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~newtab/shared/ui/select";

import { FormatInput } from "./FormatInput";

const DATE_FORMAT_OPTIONS = [
  { label: "May 21, 2026", value: "localized-medium" },
  { label: "Thu, May 21", value: "localized-short-weekday" },
  { label: "Thursday, May 21", value: "localized-long-weekday" },
  { label: "2026.05.21", value: "numeric-dot" },
  { label: "2026-05-21", value: "numeric-dash" },
  { label: "Custom", value: "custom" },
] satisfies readonly { label: string; value: DateFormat }[];

type FormatSelectProps = {
  customDateFormat: string;
  dateFormat: DateFormat;
  disabled?: boolean;
  onCustomDateFormatChange: (value: string) => void;
  onDateFormatChange: (value: DateFormat) => void;
};

export function FormatSelect({
  customDateFormat,
  dateFormat,
  disabled,
  onCustomDateFormatChange,
  onDateFormatChange,
}: FormatSelectProps) {
  const formatLabels = new Map(DATE_FORMAT_OPTIONS.map((option) => [option.value, option.label]));

  return (
    <div className="-mx-2 grid gap-1.5 px-2 py-1">
      <Select<DateFormat> value={dateFormat} onValueChange={onDateFormatChange}>
        <SelectTrigger
          className={cn(
            "border-input text-foreground/80 text-mds-setting-item h-7 w-full bg-transparent",
            disabled && "border-border bg-muted/40 text-muted-foreground opacity-100",
          )}
          disabled={disabled}
          size="sm"
        >
          <SelectValue>{(value) => formatLabels.get(value) ?? value}</SelectValue>
        </SelectTrigger>
        <SelectContent
          align="start"
          alignItemWithTrigger={false}
          className="w-anchor min-w-anchor font-mono"
          side="bottom"
        >
          {DATE_FORMAT_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {dateFormat === "custom" ? (
        <FormatInput
          disabled={disabled}
          customDateFormat={customDateFormat}
          onCustomDateFormatChange={onCustomDateFormatChange}
        />
      ) : null}
    </div>
  );
}
