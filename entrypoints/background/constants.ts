export const DEV_BOOKMARK_SEED_KEY = "newtab:dev-bookmark-seed:v1";

export const DEV_BOOKMARK_FOLDERS = [
  {
    title: "Min Dev 1",
    items: [
      { title: "GitHub", url: "https://github.com/" },
      { title: "Vercel", url: "https://vercel.com/" },
      { title: "WXT", url: "https://wxt.dev/" },
    ],
  },
  {
    title: "Min Dev 2",
    items: [
      { title: "React", url: "https://react.dev/" },
      { title: "Tailwind CSS", url: "https://tailwindcss.com/" },
      { title: "shadcn/ui", url: "https://ui.shadcn.com/" },
    ],
  },
  {
    title: "Min Dev 3",
    items: [
      { title: "MDN", url: "https://developer.mozilla.org/" },
      { title: "Chrome Extensions", url: "https://developer.chrome.com/docs/extensions/" },
    ],
  },
] as const;
