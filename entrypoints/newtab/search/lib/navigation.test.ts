/* oxlint-disable no-await-in-loop -- Check each navigation before the next engine replaces its destination. */
import { test, vi, expect } from "vitest";

import * as search from "./navigation";

import assert from "node:assert/strict";
test("search routes to each engine and encodes multilingual queries", async () => {
  const assign = vi.fn<(url: string) => void>();
  vi.stubGlobal("window", { location: { assign } });
  await search.executeSearchQuery("  ");
  expect(assign).not.toHaveBeenCalled();
  await search.executeSearchQuery("  GitHub  ");
  assert.equal(new URL(assign.mock.calls.at(-1)![0]).searchParams.get("q"), "GitHub");
  assert.equal(new URL(assign.mock.calls.at(-1)![0]).hostname, "www.google.com");

  for (const [engine, host] of [
    ["google", "www.google.com"],
    ["bing", "www.bing.com"],
    ["duckduckgo", "duckduckgo.com"],
  ] as const) {
    await search.executeSearchQuery("한글 & query", engine);
    const url = new URL(assign.mock.calls.at(-1)![0]);
    assert.equal(url.hostname, host);
    assert.equal(url.searchParams.get("q"), "한글 & query");
  }

  await search.executeSearchQuery("privacy", "brave");
  assert.equal(new URL(assign.mock.calls.at(-1)![0]).hostname, "search.brave.com");
});
