export type BookmarkFixture = {
  children?: readonly BookmarkFixture[];
  title: string;
  url?: string;
};

export const DEV_BOOKMARK_FIXTURES = [
  {
    title: "Development",
    children: [
      { title: "GitHub", url: "https://github.com/" },
      { title: "Vercel", url: "https://vercel.com/" },
      { title: "WXT", url: "https://wxt.dev/" },
    ],
  },
  {
    title: "Frontend",
    children: [
      { title: "React", url: "https://react.dev/" },
      { title: "Tailwind CSS", url: "https://tailwindcss.com/" },
      { title: "shadcn/ui", url: "https://ui.shadcn.com/" },
    ],
  },
  {
    title: "References",
    children: [
      { title: "MDN", url: "https://developer.mozilla.org/" },
      { title: "Chrome Extensions", url: "https://developer.chrome.com/docs/extensions/" },
    ],
  },
] satisfies readonly BookmarkFixture[];
