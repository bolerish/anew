import { UI_LANGUAGE } from "~shared/lib/language";
import { cn } from "~shared/lib/utils";
import { Input } from "~shared/ui/input";

type FormatInputProps = {
  customDateFormat: string;
  disabled?: boolean;
  onCustomDateFormatChange: (value: string) => void;
};

export function FormatInput({ customDateFormat, disabled, onCustomDateFormatChange }: FormatInputProps) {
  const isCustomDateFormatValid = validateCustomDateFormat(customDateFormat);

  return (
    <div className="grid gap-1">
      <Input
        aria-describedby="custom-date-format-hint"
        aria-invalid={!isCustomDateFormatValid}
        aria-label="Custom date format"
        className="border-input text-foreground/80 text-mds-setting-item placeholder:text-muted-foreground/55 aria-invalid:border-destructive h-7 bg-transparent px-2.5 py-1 font-mono focus-visible:ring-0"
        disabled={disabled}
        placeholder="MMM D, YYYY"
        value={customDateFormat}
        onChange={(event) => onCustomDateFormatChange(event.target.value)}
      />
      <p
        className={cn(
          "text-mds-setting-group p-1",
          isCustomDateFormatValid ? "text-muted-foreground/75" : "text-destructive",
        )}
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
