import { updatesMessages } from "~shared/i18n/updates";

/** Release metadata stays attached to its translated notes, newest first. */
export function getUpdateEntries(language: keyof typeof updatesMessages) {
  const copy = updatesMessages[language];
  return [
    { version: "1.2.0", date: "2026-09-15", sections: copy.currentSections },
    { version: "1.1.3", date: "2026-08-25", sections: [{ title: "", items: copy.releasedItems }] },
  ];
}
