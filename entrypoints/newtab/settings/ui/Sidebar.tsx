import { useEffect } from "react";
import { Sidebar, SidebarContent, SidebarHeader, useSidebar } from "~shared/ui/sidebar";

import { Appearance } from "../appearance";
import { Date, Time } from "../format";
import { Shortcut } from "../shortcut";

export default function SettingsSidebar() {
  const { open, setOpen } = useSidebar();

  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape" && open) {
        setOpen(false);
      }
    }

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [open, setOpen]);

  return (
    <Sidebar aria-label="Settings" side="left">
      <SidebarHeader className="border-sidebar-border border-b px-4 py-3">
        <h2 className="text-sm font-medium">Settings</h2>
      </SidebarHeader>
      <SidebarContent className="gap-3 px-4 py-3">
        <Date />
        <Time />
        <Appearance />
        <Shortcut />
      </SidebarContent>
    </Sidebar>
  );
}
