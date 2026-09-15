import { toast } from "~shared/ui/toast";

import { storage } from "#imports";

import { feedbackMessages } from "../locales/feedback";

/** Report a failed user action without exposing internal error details. */
export async function notifyError(error: unknown) {
  console.error("[min] Action failed", error);
  const preferences = await storage.getItem<{ language?: string }>("local:newtab:preferences:v1").catch(() => null);
  const language = preferences?.language ?? navigator.language.split("-")[0];
  const messages = feedbackMessages[language as keyof typeof feedbackMessages] ?? feedbackMessages.en;
  toast.add({ id: "action-error", type: "error", title: messages.actionError });
}
