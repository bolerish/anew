import { render, fireEvent } from "@testing-library/react";
import { expect, test, vi } from "vitest";
import { getMessages } from "~shared/locales";

import { LocationPicker } from "./LocationPicker";
vi.mock("~shared/lib/preferences", () => ({ useLanguage: () => getMessages("ko") }));
test("browser roots translate while custom folder names stay intact", async () => {
  const { getByRole, findByText } = render(
    <LocationPicker
      selectedLocationId="1"
      onLocationChange={vi.fn<() => void>()}
      locations={[
        { id: "1", depth: 0, rootTitle: "Bookmarks bar", title: "Bookmarks bar" },
        { id: "42", depth: 1, rootTitle: "Bookmarks bar", title: "My folder" },
        { id: "99", depth: 0, rootTitle: "Managed", title: "Managed" },
      ]}
    />,
  );
  expect(getByRole("combobox").textContent).toContain("북마크바");
  fireEvent.click(getByRole("combobox"));
  expect(await findByText("My folder")).toBeTruthy();
  expect(await findByText("Managed")).toBeTruthy();
});
