"use client";

import { Toggle as TogglePrimitive } from "@base-ui/react/toggle";
import { ToggleGroup as ToggleGroupPrimitive } from "@base-ui/react/toggle-group";
import { type VariantProps } from "class-variance-authority";
import * as React from "react";
import { cn } from "~newtab/shared/lib/utils";
import { toggleVariants } from "~newtab/shared/ui/toggle";

const ToggleGroupContext = React.createContext<
  VariantProps<typeof toggleVariants> & {
    spacing?: number;
    orientation?: "horizontal" | "vertical";
  }
>({
  size: "default",
  variant: "default",
  spacing: 2,
  orientation: "horizontal",
});

type ToggleGroupBaseProps = Omit<ToggleGroupPrimitive.Props, "defaultValue" | "multiple" | "onValueChange" | "value"> &
  VariantProps<typeof toggleVariants> & {
    spacing?: number;
    orientation?: "horizontal" | "vertical";
  };

type SingleToggleGroupProps = ToggleGroupBaseProps & {
  defaultValue?: string;
  type?: "single";
  value?: string;
  onValueChange?: (value: string) => void;
};

type MultipleToggleGroupProps = ToggleGroupBaseProps & {
  defaultValue?: readonly string[];
  type: "multiple";
  value?: readonly string[];
  onValueChange?: (value: string[]) => void;
};

type ToggleGroupProps = SingleToggleGroupProps | MultipleToggleGroupProps;

function ToggleGroup({
  className,
  variant,
  size,
  spacing = 2,
  orientation = "horizontal",
  type = "single",
  value,
  defaultValue,
  onValueChange,
  children,
  ...props
}: ToggleGroupProps) {
  const multiple = type === "multiple";
  const groupValue = normalizeToggleGroupValue(value);
  const groupDefaultValue = normalizeToggleGroupValue(defaultValue);
  const contextValue = React.useMemo(
    () => ({ variant, size, spacing, orientation }),
    [orientation, size, spacing, variant],
  );

  return (
    <ToggleGroupPrimitive
      data-slot="toggle-group"
      data-variant={variant}
      data-size={size}
      data-spacing={spacing}
      data-orientation={orientation}
      multiple={multiple}
      value={groupValue}
      defaultValue={groupDefaultValue}
      onValueChange={(nextValue) => {
        if (multiple) {
          (onValueChange as MultipleToggleGroupProps["onValueChange"])?.(nextValue);
          return;
        }

        (onValueChange as SingleToggleGroupProps["onValueChange"])?.(nextValue[0] ?? "");
      }}
      style={{ "--gap": spacing } as React.CSSProperties}
      className={cn(
        "group/toggle-group gap-toggle-group data-[variant=outline]:border-border data-[variant=outline]:bg-muted data-[size=sm]:rounded-md-capped flex w-fit flex-row items-center rounded-md data-vertical:flex-col data-vertical:items-stretch data-[spacing=0]:overflow-hidden data-[spacing=0]:border",
        className,
      )}
      {...props}
    >
      <ToggleGroupContext.Provider value={contextValue}>{children}</ToggleGroupContext.Provider>
    </ToggleGroupPrimitive>
  );
}

function normalizeToggleGroupValue(value: string | readonly string[] | undefined): readonly string[] | undefined {
  if (value === undefined) {
    return undefined;
  }

  return typeof value === "string" ? [value] : value;
}

function ToggleGroupItem({
  className,
  children,
  variant = "default",
  size = "default",
  ...props
}: TogglePrimitive.Props & VariantProps<typeof toggleVariants>) {
  const context = React.useContext(ToggleGroupContext);

  return (
    <TogglePrimitive
      data-slot="toggle-group-item"
      data-variant={context.variant || variant}
      data-size={context.size || size}
      data-spacing={context.spacing}
      className={cn(
        "group-data-[spacing=0]/toggle-group:text-mds-setting-item group-data-[spacing=0]/toggle-group:data-pressed:bg-primary! group-data-[spacing=0]/toggle-group:data-pressed:text-primary-foreground! group-data-[spacing=0]/toggle-group:data-pressed:hover:bg-primary/90! group-data-[spacing=0]/toggle-group:disabled:bg-muted/40! group-data-[spacing=0]/toggle-group:disabled:text-muted-foreground! group-data-[spacing=0]/toggle-group:disabled:data-pressed:bg-primary/30! group-data-[spacing=0]/toggle-group:disabled:data-pressed:text-primary! dark:group-data-[spacing=0]/toggle-group:disabled:data-pressed:bg-primary/25! dark:group-data-[spacing=0]/toggle-group:disabled:data-pressed:text-primary-foreground! shrink-0 group-data-[spacing=0]/toggle-group:h-full group-data-[spacing=0]/toggle-group:w-full group-data-[spacing=0]/toggle-group:rounded-none group-data-[spacing=0]/toggle-group:border-0 group-data-[spacing=0]/toggle-group:bg-transparent group-data-[spacing=0]/toggle-group:px-2 focus:z-10 focus-visible:z-10 group-data-[spacing=0]/toggle-group:disabled:pointer-events-none group-data-[spacing=0]/toggle-group:disabled:opacity-100 group-data-[spacing=0]/toggle-group:has-data-[icon=inline-end]:pr-1.5 group-data-[spacing=0]/toggle-group:has-data-[icon=inline-start]:pl-1.5 group-data-horizontal/toggle-group:data-[spacing=0]:border-l group-data-vertical/toggle-group:data-[spacing=0]:border-t group-data-horizontal/toggle-group:data-[spacing=0]:first:rounded-l-md group-data-horizontal/toggle-group:data-[spacing=0]:first:border-l-0 group-data-vertical/toggle-group:data-[spacing=0]:first:rounded-t-md group-data-vertical/toggle-group:data-[spacing=0]:first:border-t-0 group-data-horizontal/toggle-group:data-[spacing=0]:last:rounded-r-md group-data-vertical/toggle-group:data-[spacing=0]:last:rounded-b-md",
        toggleVariants({
          variant: context.variant || variant,
          size: context.size || size,
        }),
        className,
      )}
      {...props}
    >
      {children}
    </TogglePrimitive>
  );
}

export { ToggleGroup, ToggleGroupItem };
