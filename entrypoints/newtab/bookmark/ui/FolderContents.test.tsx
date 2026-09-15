import { fireEvent, render } from "@testing-library/react";
import { expect, test, vi } from "vitest";

import { FolderContents } from "./FolderContents";

test("keeps the clicked folder active through automatic scroll events and resumes after manual scrolling", () => {
  const scroll = document.createElement("div");
  scroll.dataset.bookmarkScroll = "";
  Object.defineProperties(scroll, { scrollHeight: { value: 2000 }, clientHeight: { value: 800 } });
  const folders = ["Learn", "Work"].map((title) => ({ id: title, title, displayTitle: title, items: [] }));
  for (const [index, folder] of folders.entries()) {
    const element = document.createElement("div");
    element.id = `folder-${folder.id}`;
    element.tabIndex = -1;
    element.scrollIntoView = vi.fn<() => void>();
    vi.spyOn(element, "getBoundingClientRect").mockReturnValue({ top: index * 500 } as DOMRect);
    scroll.append(element);
  }
  document.body.append(scroll);
  const { getByRole, rerender } = render(<FolderContents folders={folders} />);
  const work = getByRole("button", { name: "Work" });
  const learn = getByRole("button", { name: "Learn" });
  expect(learn.getAttribute("aria-current")).toBe("location");
  fireEvent.click(work);
  fireEvent.scroll(scroll);
  rerender(<FolderContents folders={[...folders]} />);
  fireEvent.scroll(scroll);
  expect(work.getAttribute("aria-current")).toBe("location");
  expect(learn.hasAttribute("aria-current")).toBe(false);
  fireEvent.wheel(scroll, { deltaY: -100 });
  fireEvent.scroll(scroll);
  expect(learn.getAttribute("aria-current")).toBe("location");
  scroll.remove();
});
