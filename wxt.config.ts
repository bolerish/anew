import babel from "@rolldown/plugin-babel";
import stylex from "@stylexjs/unplugin";
import { reactCompilerPreset } from "@vitejs/plugin-react";
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

  manifest: () => ({
    name: "__MSG_extensionName__",
    short_name: "Min",
    description: "__MSG_extensionDescription__",
    default_locale: "en",
    permissions: ["bookmarks", "favicon", "fontSettings", "search", "storage", "geolocation"],
    action: {
      default_title: "__MSG_extensionName__",
    },
  }),

  webExt: {
    startUrls: ["chrome://newtab/"],
  },

  analysis: {
    outputFile: ".analyzer/.rollup-visualizer/stats.html",
  },

  vite: () => {
    let devServerOrigin = "";
    return {
      optimizeDeps: {
        exclude: ["@bolerish/tokens"],
        include: ["@base-ui/react/menu", "@base-ui/react/combobox", "@base-ui/react/tooltip"],
      },
      plugins: [
        {
          ...stylex.vite({
            // Match the published UI style keys and cascade layers when composing xstyle.
            dev: false,
            useCSSLayers: true,
            aliases: { "~shared/*": [path.resolve(__dirname, "entrypoints/shared/*")] },
            unstable_moduleResolution: { type: "commonJS", rootDir: __dirname },
          }),
          // WXT reads entrypoint metadata in a temporary Vite server. StyleX
          // polling is only needed by the actual app server, which listens.
          apply: (config) =>
            !config.plugins?.some(
              (plugin) =>
                plugin &&
                typeof plugin === "object" &&
                "name" in plugin &&
                plugin.name === "wxt:remove-entrypoint-main-function",
            ),
        },
        {
          name: "min:stylex-extension-dev",
          apply: "serve",
          configResolved(config) {
            devServerOrigin = config.server.origin ?? "";
          },
          // Extension pages have a chrome-extension origin, unlike Vite pages.
          transformIndexHtml: {
            order: "post",
            handler(html) {
              if (!devServerOrigin) return html;
              return html.replace(
                /((?:src|href)=")\/(@id\/virtual:stylex:runtime|virtual:stylex.css)(")/g,
                `$1${devServerOrigin}/$2$3`,
              );
            },
          },
          transform(code, id) {
            if (!id.includes("virtual:stylex:runtime")) return;
            return code.replace(
              "const DEV_CSS_PATH = '/virtual:stylex.css';",
              `const DEV_CSS_PATH = ${JSON.stringify(`${devServerOrigin}/virtual:stylex.css`)};`,
            );
          },
        },
        babel({ presets: [reactCompilerPreset()] }),
      ],
      resolve: {
        alias: {
          "~": path.resolve(__dirname, "./"),
          "~newtab": path.resolve(__dirname, "./entrypoints/newtab"),
          "~shared": path.resolve(__dirname, "./entrypoints/shared"),
        },
      },
    };
  },
});
