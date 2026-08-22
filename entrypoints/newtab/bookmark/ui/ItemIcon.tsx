import { useEffect, useState } from "react";

type ItemIconProps = {
  icon: string | undefined;
  label: string;
  marker?: "dash" | "square";
};

type IconVisibility = "dark" | "light" | "normal" | "preserve";

type IconPixelStats = {
  averageLuminance: number;
  averageSaturation: number;
  coloredAlphaRatio: number;
  opaqueEdgeRatio: number;
};

const VISIBILITY_CLASS: Record<IconVisibility, string> = {
  dark: "size-3.5 object-contain dark:invert",
  light: "size-3.5 object-contain dark:brightness-90",
  normal: "size-3.5 object-contain",
  preserve: "size-3.5 object-contain",
};

export function ItemIcon({ icon, label, marker }: ItemIconProps) {
  const [hasLoadError, setHasLoadError] = useState(false);
  const [visibility, setVisibility] = useState<IconVisibility>("normal");

  useEffect(() => {
    setHasLoadError(false);
  }, [icon]);

  if (marker) {
    return (
      <span className="text-muted-foreground text-mds-shortcut-label grid size-4.5 shrink-0 place-items-center leading-none">
        {marker === "square" ? "▪" : "—"}
      </span>
    );
  }

  if (!icon || hasLoadError) {
    return (
      <span className="text-mds-caption bg-muted text-muted-foreground grid size-4.5 shrink-0 place-items-center rounded font-semibold">
        {label.trim().charAt(0).toUpperCase() || "?"}
      </span>
    );
  }

  return (
    <span className="grid size-4.5 place-items-center">
      <img
        alt=""
        className={VISIBILITY_CLASS[visibility]}
        src={icon}
        onError={() => setHasLoadError(true)}
        onLoad={(event) => setVisibility(deriveIconVisibility(event.currentTarget))}
      />
    </span>
  );
}

const ICON_SIZE = 16;
function deriveIconVisibility(image: HTMLImageElement): IconVisibility {
  const context = resolveIconCanvasContext();

  if (!context) {
    return "normal";
  }

  try {
    context.clearRect(0, 0, ICON_SIZE, ICON_SIZE);
    context.drawImage(image, 0, 0, ICON_SIZE, ICON_SIZE);
    const pixels = context.getImageData(0, 0, ICON_SIZE, ICON_SIZE).data;

    return resolveIconVisibility(deriveIconPixelStats(pixels));
  } catch {
    return "normal";
  }
}

function deriveIconPixelStats(pixels: Uint8ClampedArray): IconPixelStats | null {
  let alphaWeightedLuminance = 0;
  let alphaWeightedSaturation = 0;
  let alphaTotal = 0;
  let coloredAlphaTotal = 0;
  let opaqueEdgePixels = 0;
  let edgePixels = 0;

  for (let index = 0; index < pixels.length; index += 4) {
    const alpha = pixels[index + 3] / 255;
    const pixelIndex = index / 4;
    const x = pixelIndex % ICON_SIZE;
    const y = Math.floor(pixelIndex / ICON_SIZE);

    if (isEdgePixel(x, y)) {
      edgePixels += 1;

      if (alpha > 0.9) {
        opaqueEdgePixels += 1;
      }
    }

    if (alpha < 0.1) {
      continue;
    }

    const red = pixels[index] / 255;
    const green = pixels[index + 1] / 255;
    const blue = pixels[index + 2] / 255;
    const luminance = 0.2126 * red + 0.7152 * green + 0.0722 * blue;
    // This uses chroma, not HSL saturation, to detect near-grayscale icons.
    const saturation = Math.max(red, green, blue) - Math.min(red, green, blue);
    alphaWeightedLuminance += luminance * alpha;
    alphaWeightedSaturation += saturation * alpha;
    alphaTotal += alpha;

    if (saturation > 0.34) {
      coloredAlphaTotal += alpha;
    }
  }

  if (alphaTotal === 0) {
    return null;
  }

  return {
    averageLuminance: alphaWeightedLuminance / alphaTotal,
    averageSaturation: alphaWeightedSaturation / alphaTotal,
    coloredAlphaRatio: coloredAlphaTotal / alphaTotal,
    opaqueEdgeRatio: edgePixels > 0 ? opaqueEdgePixels / edgePixels : 0,
  };
}

function resolveIconVisibility(stats: IconPixelStats | null): IconVisibility {
  if (!stats) {
    return "normal";
  }

  const OPAQUE_EDGE_RATIO_MIN = 0.8;
  const COLORED_ALPHA_RATIO_MIN = 0.16;
  const DARK_LUMINANCE_MAX = 0.26;
  const LIGHT_LUMINANCE_MIN = 0.84;
  const GRAYSCALE_SATURATION_MAX = 0.2;

  if (stats.opaqueEdgeRatio > OPAQUE_EDGE_RATIO_MIN || stats.coloredAlphaRatio > COLORED_ALPHA_RATIO_MIN) {
    return "preserve";
  }

  if (stats.averageLuminance < DARK_LUMINANCE_MAX && stats.averageSaturation < GRAYSCALE_SATURATION_MAX) {
    return "dark";
  }

  if (stats.averageLuminance > LIGHT_LUMINANCE_MIN) {
    return "light";
  }

  return "normal";
}

let iconCanvasContext: CanvasRenderingContext2D | null | undefined;
function resolveIconCanvasContext(): CanvasRenderingContext2D | null {
  if (iconCanvasContext !== undefined) {
    return iconCanvasContext;
  }

  if (typeof document === "undefined") {
    iconCanvasContext = null;
    return iconCanvasContext;
  }

  const canvas = document.createElement("canvas");
  canvas.width = ICON_SIZE;
  canvas.height = ICON_SIZE;
  iconCanvasContext = canvas.getContext("2d", { willReadFrequently: true });

  return iconCanvasContext;
}

function isEdgePixel(x: number, y: number): boolean {
  return x === 0 || y === 0 || x === ICON_SIZE - 1 || y === ICON_SIZE - 1;
}
