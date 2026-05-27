import React from "react";
import ReactDOM from "react-dom/client";

import { App } from "./App";
import { loadInitialNewTabState } from "./bootstrap";
import { RootLayout } from "./layout";
import "./style.css";
import { Toaster } from "./shared/ui/sonner";

void initNewTab();

async function initNewTab() {
  await loadInitialNewTabState();

  ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
      <RootLayout>
        {(props) => (
          <>
            <App {...props} />
            <Toaster />
          </>
        )}
      </RootLayout>
    </React.StrictMode>,
  );
}
