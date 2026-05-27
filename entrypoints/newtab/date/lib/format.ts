import type { DateFormat, DateSettings } from "~newtab/settings/date";
import type { TimeSettings } from "~newtab/settings/time";

const LOCALIZED_DATE_FORMAT_OPTIONS = {
  "localized-long-weekday": {
    day: "numeric",
    month: "long",
    weekday: "long",
  },
  "localized-medium": {
    day: "numeric",
    month: "long",
    year: "numeric",
  },
  "localized-short-weekday": {
    day: "numeric",
    month: "short",
    weekday: "short",
  },
} satisfies Record<
  Extract<DateFormat, "localized-medium" | "localized-short-weekday" | "localized-long-weekday">,
  Intl.DateTimeFormatOptions
>;

const FIXED_DATE_FORMAT_PATTERNS = {
  "numeric-dash": "YYYY-MM-DD",
  "numeric-dot": "YYYY.MM.DD",
} satisfies Record<Extract<DateFormat, "numeric-dot" | "numeric-dash">, string>;

export function formatCurrentDate(date: Date, settings: DateSettings): string {
  return formatDate(date, settings.dateFormat, settings.customDateFormat);
}

export function formatCurrentTime(date: Date, settings: TimeSettings): string | null {
  if (!settings.showTime) {
    return null;
  }

  return new Intl.DateTimeFormat("en-US", {
    hour: settings.timeFormat === "12h" ? "numeric" : "2-digit",
    hour12: settings.timeFormat === "12h",
    minute: "2-digit",
    second: settings.showTimeSeconds ? "2-digit" : undefined,
  }).format(date);
}

export function formatDate(date: Date, dateFormat: DateFormat, customDateFormat = "", locale = "en-US"): string {
  if (isLocalizedDateFormat(dateFormat)) {
    return new Intl.DateTimeFormat(locale, LOCALIZED_DATE_FORMAT_OPTIONS[dateFormat]).format(date);
  }

  const pattern = dateFormat === "custom" ? customDateFormat : FIXED_DATE_FORMAT_PATTERNS[dateFormat];

  return formatDatePattern(date, pattern, locale);
}

function isLocalizedDateFormat(dateFormat: DateFormat): dateFormat is keyof typeof LOCALIZED_DATE_FORMAT_OPTIONS {
  return dateFormat in LOCALIZED_DATE_FORMAT_OPTIONS;
}

function formatDatePattern(date: Date, pattern: string, locale: string): string {
  const parts = deriveDateParts(date, locale);
  const tokens: Record<string, string> = {
    YYYY: parts.year,
    dddd: parts.longWeekday,
    ddd: parts.weekday,
    MMM: parts.month,
    MM: parts.numericMonth,
    DD: parts.paddedDay,
    D: parts.day,
  };

  return Object.entries(tokens).reduce(
    (formattedDate, [token, value]) => formattedDate.replaceAll(token, value),
    pattern,
  );
}

function deriveDateParts(date: Date, locale: string) {
  const parts = new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "short",
    weekday: "short",
    year: "numeric",
  }).formatToParts(date);
  const day = parts.find((part) => part.type === "day")?.value ?? "";
  const month = parts.find((part) => part.type === "month")?.value ?? "";
  const weekday = parts.find((part) => part.type === "weekday")?.value ?? "";
  const year = parts.find((part) => part.type === "year")?.value ?? "";
  const longWeekday = new Intl.DateTimeFormat(locale, { weekday: "long" }).format(date);

  return {
    day,
    longWeekday,
    month,
    numericMonth: String(date.getMonth() + 1).padStart(2, "0"),
    paddedDay: day.padStart(2, "0"),
    weekday,
    year,
  };
}
