import React from "react";
import ReactDOM from "react-dom/client";
import "~shared/styles/reset.css";
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

async function main() {
  await Promise.all([
    initializeTheme(),
    loadInitialBookmarkTree().catch(console.error),
    loadInitialBookmarkLocation().catch(console.error),
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
      <App />
    </React.StrictMode>,
  );
}
void main();
