import { GearSixIcon } from "@phosphor-icons/react";
import { Popover, PopoverContent, PopoverTrigger } from "~newtab/shared/ui/popover";

import { Button } from "../shared/ui/button";
import { Appearance } from "./appearance/Appearance";
import { Date } from "./date/ui/Date";
import { Shortcut } from "./shortcut/Shortcut";
import { Time } from "./time/ui/Time";

export function Setting() {
  return (
    <Popover>
      <PopoverTrigger>
        <Button aria-label="Open settings" size="icon" variant="outline">
          <GearSixIcon className="size-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="bg-popover/78 text-popover-foreground max-h-available-height w-mds-settings-panel rounded-mds gap-3 overflow-y-auto py-3.5 shadow-md ring-1 backdrop-blur-2xl backdrop-saturate-150"
        collisionAvoidance={{ align: "shift", fallbackAxisSide: "none", side: "none" }}
        side="top"
        sideOffset={8}
      >
        <Date />
        <Time />
        <Appearance />
        <Shortcut />
      </PopoverContent>
    </Popover>
  );
}
