import { useEffect } from "react";
import { Sidebar, SidebarContent, SidebarHeader, useSidebar } from "~shared/ui/sidebar";

import { Appearance } from "../appearance";
import { Date, Time } from "../format";
import { Shortcut } from "../shortcut";

export default function SettingsSidebar() {
  const { isMobile, open, openMobile, setOpen, setOpenMobile } = useSidebar();
  const isOpen = isMobile ? openMobile : open;

  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key !== "Escape" || !isOpen) {
        return;
      }

      if (isMobile) {
        setOpenMobile(false);
        return;
      }

      setOpen(false);
    }

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isMobile, isOpen, setOpen, setOpenMobile]);

  return (
    <aside aria-label="Settings">
      <Sidebar side="left">
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
    </aside>
  );
}
