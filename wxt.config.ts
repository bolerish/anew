import tailwindcss from "@tailwindcss/vite";
import "@wxt-dev/auto-icons";
import { defineConfig } from "wxt";

import path from "path";

export default defineConfig({
  modules: ["@wxt-dev/module-react", "@wxt-dev/auto-icons"],

  autoIcons: {
    baseIconPath: path.resolve(__dirname, "public/logo.svg"),
    developmentIndicator: false,
    sizes: [16, 32, 48, 96, 128],
  },

  manifest: {
    name: "__MSG_extensionName__",
    short_name: "Min",
    description: "__MSG_extensionDescription__",
    default_locale: "en",
    permissions: ["bookmarks", "favicon", "fontSettings", "search", "storage"],
    action: {
      default_title: "__MSG_extensionName__",
    },
  },

  webExt: {
    startUrls: ["chrome://newtab/"],
  },

  vite: () => ({
    plugins: [tailwindcss()],
    resolve: {
      alias: {
        "~": path.resolve(__dirname, "./"),
        "~newtab": path.resolve(__dirname, "./entrypoints/newtab"),
        "~shared": path.resolve(__dirname, "./entrypoints/shared"),
      },
    },
  }),
});
