import * as stylex from "@stylexjs/stylex";
import { formatDate } from "~newtab/date/lib/format";
import { useLanguage, usePreferences } from "~shared/lib/preferences";
import { spacingVars } from "~shared/styles/semantic.stylex";
import { Field, FieldDescription, FieldError } from "~shared/ui/field";
import { Input } from "~shared/ui/input";
import { Select, SelectPopup, SelectList, SelectItem, SelectTrigger, SelectValue } from "~shared/ui/select";

import type { DateFormat } from "../model/date";

const styles = stylex.create({
  root: { display: "grid", gap: spacingVars.space2 },
  fullWidth: { width: "100%" },
});

type FormatSelectProps = {
  customDateFormat: string;
  dateFormat: DateFormat;
  disabled?: boolean;
  onCustomDateFormatChange: (value: string) => void;
  onDateFormatChange: (value: DateFormat) => void;
};

type CustomFormatInputProps = {
  disabled?: boolean;
  onValueChange: (value: string) => void;
  value: string;
};

export function FormatSelect({
  customDateFormat,
  dateFormat,
  disabled,
  onCustomDateFormatChange,
  onDateFormatChange,
}: FormatSelectProps) {
  const UI_LANGUAGE = useLanguage();
  const { language } = usePreferences();
  const DATE_FORMAT_OPTIONS = [
    { label: formatDate(new Date(2026, 4, 21), "localized-medium", "", language), value: "localized-medium" },
    {
      label: formatDate(new Date(2026, 4, 21), "localized-short-weekday", "", language),
      value: "localized-short-weekday",
    },
    {
      label: formatDate(new Date(2026, 4, 21), "localized-long-weekday", "", language),
      value: "localized-long-weekday",
    },
    { label: "2026.05.21", value: "numeric-dot" },
    { label: "2026-05-21", value: "numeric-dash" },
    { label: UI_LANGUAGE.settings.custom, value: "custom" },
  ] satisfies readonly { label: string; value: DateFormat }[];
  const formatLabels = new Map(DATE_FORMAT_OPTIONS.map((option) => [option.value, option.label]));

  return (
    <div {...stylex.props(styles.root)}>
      <Select<DateFormat>
        value={dateFormat}
        onValueChange={(value) => {
          if (value) onDateFormatChange(value);
        }}
      >
        <SelectTrigger aria-label={UI_LANGUAGE.settings.dateFormat} xstyle={styles.fullWidth} disabled={disabled}>
          <SelectValue>{(value) => formatLabels.get(value) ?? value}</SelectValue>
        </SelectTrigger>
        <SelectPopup align="start" alignItemWithTrigger={false} side="bottom">
          <SelectList>
            {DATE_FORMAT_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectList>
        </SelectPopup>
      </Select>
      {dateFormat === "custom" ? (
        <CustomFormatInput disabled={disabled} value={customDateFormat} onValueChange={onCustomDateFormatChange} />
      ) : null}
    </div>
  );
}

function CustomFormatInput({ disabled, onValueChange, value }: CustomFormatInputProps) {
  const UI_LANGUAGE = useLanguage();
  const isValid = validateCustomDateFormat(value);

  return (
    <Field invalid={!isValid}>
      <Input
        aria-describedby={isValid ? "custom-date-format-hint" : "custom-date-format-error"}
        aria-invalid={!isValid}
        aria-label={UI_LANGUAGE.settings.customDateFormat}
        disabled={disabled}
        placeholder="MMM D, YYYY"
        value={value}
        onChange={(e) => onValueChange(e.target.value)}
      />
      {isValid ? (
        <FieldDescription id="custom-date-format-hint">
          {UI_LANGUAGE.settings.customDateFormatDescription}
        </FieldDescription>
      ) : (
        <FieldError match={true} id="custom-date-format-error" role="alert">
          {UI_LANGUAGE.settings.customDateFormatError}
        </FieldError>
      )}
    </Field>
  );
}

const CUSTOM_DATE_FORMAT_PATTERN = /^(?=.*(?:YYYY|MMM|MM|DD|D|dddd|ddd))(?:YYYY|MMM|MM|DD|D|dddd|ddd|[\s,./-])+$/;

function validateCustomDateFormat(format: string): boolean {
  return CUSTOM_DATE_FORMAT_PATTERN.test(format.trim());
}
