import { UI_LANGUAGE } from "~shared/lib/language";
import { cn } from "~shared/lib/utils";
import { Input } from "~shared/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~shared/ui/select";

import type { DateFormat } from "../model/date";

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
          aria-label="Date format"
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
        <CustomFormatInput disabled={disabled} value={customDateFormat} onValueChange={onCustomDateFormatChange} />
      ) : null}
    </div>
  );
}

type CustomFormatInputProps = {
  disabled?: boolean;
  onValueChange: (value: string) => void;
  value: string;
};

function CustomFormatInput({ disabled, onValueChange, value }: CustomFormatInputProps) {
  const isValid = validateCustomDateFormat(value);

  return (
    <div className="grid gap-1">
      <Input
        aria-describedby="custom-date-format-hint"
        aria-invalid={!isValid}
        aria-label="Custom date format"
        className="border-input text-foreground/80 text-mds-setting-item placeholder:text-muted-foreground/55 aria-invalid:border-destructive h-7 bg-transparent px-2.5 py-1 font-mono focus-visible:ring-0"
        disabled={disabled}
        placeholder="MMM D, YYYY"
        value={value}
        onChange={(event) => onValueChange(event.target.value)}
      />
      <p
        className={cn("text-mds-setting-group p-1", isValid ? "text-muted-foreground/75" : "text-destructive")}
        id="custom-date-format-hint"
      >
        {UI_LANGUAGE.settings.date.customFormat.description}
      </p>
    </div>
  );
}

const CUSTOM_DATE_FORMAT_PATTERN = /^(?=.*(?:YYYY|MMM|MM|DD|D|dddd|ddd))(?:YYYY|MMM|MM|DD|D|dddd|ddd|[\s,./-])+$/;

function validateCustomDateFormat(format: string): boolean {
  return CUSTOM_DATE_FORMAT_PATTERN.test(format.trim());
}
