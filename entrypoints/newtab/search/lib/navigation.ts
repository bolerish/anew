export async function executeSearchQuery(
  query: string,
  engine: "google" | "bing" | "duckduckgo" | "brave" = "google",
): Promise<void> {
  const text = query.trim();
  if (!text) return;
  const endpoints = {
    brave: "https://search.brave.com/search",
    google: "https://www.google.com/search",
    bing: "https://www.bing.com/search",
    duckduckgo: "https://duckduckgo.com/",
  };
  const url = new URL(endpoints[engine]);
  url.searchParams.set("q", text);
  window.location.assign(url.toString());
}
