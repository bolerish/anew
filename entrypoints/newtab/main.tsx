import React from "react";
import { type CSSProperties } from "react";
import "~shared/styles/global.css";
import ReactDOM from "react-dom/client";

import { ThemeProvider, Toaster } from "../shared/ui";
import { SidebarProvider } from "../shared/ui/sidebar";
import App from "./App";

const SIDEBAR_STYLE = { "--sidebar-width": "min(calc(100vw - 3rem), 23rem)" };

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ThemeProvider>
      <SidebarProvider defaultOpen={false} style={SIDEBAR_STYLE as CSSProperties}>
        <App />
      </SidebarProvider>
      <Toaster />
    </ThemeProvider>
    );
  </React.StrictMode>,
);
