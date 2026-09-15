import { render, fireEvent, waitFor } from "@testing-library/react";
import { useState } from "react";
import { expect, test, vi } from "vitest";

import { SearchBar } from "./SearchBar";
vi.mock("~newtab/settings/ui/Preferences", () => ({ EngineSelect: () => null }));
test("typing submits web search; Escape clears and blurs; IME Enter does not submit", async () => {
  const search = vi.fn<() => Promise<void>>(async () => {});
  function Search() {
    const [value, setValue] = useState("");
    return <SearchBar value={value} onValueChange={setValue} results={[]} onSearch={search} />;
  }
  const { getByRole } = render(<Search />);
  const input = getByRole("combobox") as HTMLInputElement;
  fireEvent.change(input, { target: { value: "검색" } });
  input.focus();
  fireEvent.keyDown(input, { key: "Enter", isComposing: true });
  expect(search).not.toHaveBeenCalled();
  fireEvent.keyDown(input, { key: "Enter" });
  expect(search).toHaveBeenCalledOnce();
  fireEvent.keyDown(input, { key: "Escape" });
  await waitFor(() => expect(input.value).toBe(""));
  expect(document.activeElement).not.toBe(input);
});
