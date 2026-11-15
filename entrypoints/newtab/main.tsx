import { IconContext } from "@phosphor-icons/react";
import React from "react";
import ReactDOM from "react-dom/client";
import "@bolerish/ui/global.css";
import { loadInitialPreferences } from "~shared/lib/preferences";
import "~shared/styles/global.css";

import { initializeTheme } from "../shared/lib/theme";
import App from "./App";
import { loadInitialCollapsedFolders } from "./bookmark/model/expansion";
import { loadInitialBookmarkLocation } from "./bookmark/model/useLocation";
import { loadInitialBookmarkTree } from "./bookmark/model/useTree";
import { loadInitialAppearanceSettings } from "./settings/appearance";
import { loadInitialBookmarkSettings } from "./settings/bookmark/model/settings";
import { loadInitialDateSettings, loadInitialTimeSettings } from "./settings/format";
import { loadInitialShortcutSettings } from "./settings/shortcut";

const iconDefaults = { size: "1em", style: { fontSize: "calc(1em / var(--mds-content-scale, 1))" } };

async function main() {
  await Promise.allSettled([
    initializeTheme(),
    loadInitialBookmarkTree(),
    loadInitialBookmarkLocation(),
    loadInitialPreferences(),
    loadInitialBookmarkSettings(),
    loadInitialCollapsedFolders(),
    loadInitialAppearanceSettings(),
    loadInitialDateSettings(),
    loadInitialTimeSettings(),
    loadInitialShortcutSettings(),
  ]);
  ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
      <IconContext.Provider value={iconDefaults}>
        <App />
      </IconContext.Provider>
    </React.StrictMode>,
  );
}
void main();
