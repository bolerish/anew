import { useEffect, useRef } from "react";
import { usePreferences } from "~shared/lib/preferences";
import { updatesMessages } from "~shared/locales/updates";
import { toast } from "~shared/ui/toast";

import { browser } from "#imports";

/** Claim a version announcement once, with an action opening the local release notes. */
export function useUpdateAnnouncement(openUpdates: () => void) {
  const { language } = usePreferences();
  const requested = useRef(false);
  useEffect(() => {
    if (requested.current) return;
    requested.current = true;
    const copy = updatesMessages[language];
    void browser.runtime
      .sendMessage({ type: "min:update:claim" })
      .then((version: unknown) => {
        if (typeof version !== "string" || !version) return;
        toast.add({
          id: "version-update",
          title: copy.updated,
          description: version,
          actionProps: { children: copy.viewUpdates, onClick: openUpdates },
        });
      })
      .catch(console.error);
  }, [language, openUpdates]);
}
