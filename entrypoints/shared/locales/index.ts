import { bookmarkMessages } from "./bookmark";
import { feedbackMessages } from "./feedback";
import { searchMessages } from "./search";
import { settingsMessages } from "./settings";

export function getMessages(language: string) {
  const locale = Object.hasOwn(bookmarkMessages, language) ? (language as keyof typeof bookmarkMessages) : "en";
  return {
    feedback: feedbackMessages[locale],
    bookmark: bookmarkMessages[locale],
    search: searchMessages[locale],
    settings: settingsMessages[locale],
  };
}
export const UI_LANGUAGE = getMessages(navigator.language.split("-")[0]);
