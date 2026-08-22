import { Slider as SliderPrimitive } from "@base-ui/react/slider";
import { cn } from "~shared/lib/utils";

function Slider<Value extends number | readonly number[]>({
  className,
  indicatorClassName,
  thumbClassName,
  trackClassName,
  defaultValue,
  value,
  min = 0,
  max = 100,
  ...props
}: SliderPrimitive.Root.Props<Value> & {
  indicatorClassName?: string;
  thumbClassName?: string;
  trackClassName?: string;
}) {
  const _values = deriveSliderValues(value, defaultValue, min);

  return (
    <SliderPrimitive.Root
      className={cn("w-full data-[orientation=vertical]:h-full", className)}
      data-slot="slider"
      defaultValue={defaultValue}
      value={value}
      min={min}
      max={max}
      thumbAlignment="edge"
      {...props}
    >
      <SliderPrimitive.Control className="relative flex w-full touch-none items-center select-none data-disabled:opacity-50 data-[orientation=horizontal]:h-5 data-[orientation=vertical]:h-full data-[orientation=vertical]:min-h-40 data-[orientation=vertical]:w-5 data-[orientation=vertical]:flex-col">
        <SliderPrimitive.Track
          data-slot="slider-track"
          className={cn(
            "bg-muted relative grow overflow-hidden rounded-md select-none data-[orientation=horizontal]:h-1 data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-1",
            trackClassName,
          )}
        >
          <SliderPrimitive.Indicator
            data-slot="slider-range"
            className={cn(
              "bg-primary select-none data-[orientation=horizontal]:h-full data-[orientation=vertical]:w-full",
              indicatorClassName,
            )}
          />
        </SliderPrimitive.Track>
        {Array.from({ length: _values.length }, (_, index) => (
          <SliderPrimitive.Thumb
            data-slot="slider-thumb"
            key={index}
            className={cn(
              "border-primary bg-background ring-ring/30 relative block size-3 shrink-0 rounded-md border transition-[color,box-shadow] select-none after:absolute after:-inset-2 hover:ring-2 focus-visible:ring-2 focus-visible:outline-hidden active:ring-2 disabled:pointer-events-none disabled:opacity-50",
              thumbClassName,
            )}
          />
        ))}
      </SliderPrimitive.Control>
    </SliderPrimitive.Root>
  );
}

function deriveSliderValues(
  value: number | readonly number[] | undefined,
  defaultValue: number | readonly number[] | undefined,
  fallback: number,
): readonly number[] {
  if (Array.isArray(value)) {
    return value;
  }

  if (typeof value === "number") {
    return [value];
  }

  if (Array.isArray(defaultValue)) {
    return defaultValue;
  }

  if (typeof defaultValue === "number") {
    return [defaultValue];
  }

  return [fallback];
}

export { Slider };
