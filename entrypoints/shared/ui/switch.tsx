"use client";

import { Switch as SwitchPrimitive } from "@base-ui/react/switch";
import { cn } from "~shared/lib/utils";

function Switch({
  className,
  thumbClassName,
  size = "default",
  ...props
}: SwitchPrimitive.Root.Props & {
  size?: "sm" | "default";
  thumbClassName?: string;
}) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      data-size={size}
      className={cn(
        "peer group/switch focus-visible:border-ring focus-visible:ring-ring/30 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 data-unchecked:bg-input dark:data-unchecked:bg-input/80 relative inline-flex shrink-0 items-center rounded-full border border-transparent transition-all outline-none focus-visible:ring-2 aria-invalid:ring-2 data-disabled:cursor-not-allowed data-disabled:opacity-50 data-[size=default]:size-6 data-[size=sm]:size-6",
        "data-checked:bg-primary",
        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(
          "bg-background pointer-events-none block rounded-full ring-0 transition-transform group-data-[size=default]/switch:size-4 group-data-[size=sm]/switch:size-4 group-data-[size=default]/switch:data-checked:translate-x-[calc(100%-2px)] group-data-[size=sm]/switch:data-checked:translate-x-[calc(100%-2px)] group-data-[size=default]/switch:data-unchecked:translate-x-0 group-data-[size=sm]/switch:data-unchecked:translate-x-0",
          "data-checked:bg-primary-foreground",
          thumbClassName,
        )}
      />
    </SwitchPrimitive.Root>
  );
}

export { Switch };
