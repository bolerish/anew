type IconAppearance = "dark" | "light" | "normal" | "preserve";

type PixelStats = {
  averageLuminance: number;
  averageSaturation: number;
  coloredAlphaRatio: number;
  opaqueEdgeRatio: number;
};

const SAMPLE_SIZE_PX = 16;
const RGBA_CHANNEL_COUNT = 4;
const MAX_CHANNEL_VALUE = 255;
const LUMINANCE_WEIGHTS = { red: 0.2126, green: 0.7152, blue: 0.0722 };
const ALPHA = { opaque: 0.9, visible: 0.1 };
const SATURATION = { colored: 0.34, monochrome: 0.2 };
const LUMINANCE = { dark: 0.26, light: 0.84 };
const PRESERVE_RATIO = { edge: 0.8, colored: 0.16 };

let canvasContext: CanvasRenderingContext2D | null | undefined;

export function getIconAppearance(image: HTMLImageElement): IconAppearance {
  const context = getCanvasContext();

  if (!context) return "normal";

  try {
    context.clearRect(0, 0, SAMPLE_SIZE_PX, SAMPLE_SIZE_PX);
    context.drawImage(image, 0, 0, SAMPLE_SIZE_PX, SAMPLE_SIZE_PX);
    return resolveAppearance(getPixelStats(context.getImageData(0, 0, SAMPLE_SIZE_PX, SAMPLE_SIZE_PX).data));
  } catch {
    return "normal";
  }
}

function getPixelStats(pixels: Uint8ClampedArray): PixelStats | null {
  let alphaWeightedLuminance = 0;
  let alphaWeightedSaturation = 0;
  let alphaTotal = 0;
  let coloredAlphaTotal = 0;
  let opaqueEdgePixels = 0;
  let edgePixels = 0;

  for (let index = 0; index < pixels.length; index += RGBA_CHANNEL_COUNT) {
    const alpha = pixels[index + 3] / MAX_CHANNEL_VALUE;
    const pixelIndex = index / RGBA_CHANNEL_COUNT;
    const x = pixelIndex % SAMPLE_SIZE_PX;
    const y = Math.floor(pixelIndex / SAMPLE_SIZE_PX);

    if (isEdgePixel(x, y)) {
      edgePixels += 1;
      if (alpha > ALPHA.opaque) opaqueEdgePixels += 1;
    }

    if (alpha < ALPHA.visible) continue;

    const red = pixels[index] / MAX_CHANNEL_VALUE;
    const green = pixels[index + 1] / MAX_CHANNEL_VALUE;
    const blue = pixels[index + 2] / MAX_CHANNEL_VALUE;
    const luminance = LUMINANCE_WEIGHTS.red * red + LUMINANCE_WEIGHTS.green * green + LUMINANCE_WEIGHTS.blue * blue;
    const saturation = Math.max(red, green, blue) - Math.min(red, green, blue);
    alphaWeightedLuminance += luminance * alpha;
    alphaWeightedSaturation += saturation * alpha;
    alphaTotal += alpha;

    if (saturation > SATURATION.colored) coloredAlphaTotal += alpha;
  }

  if (alphaTotal === 0) return null;

  return {
    averageLuminance: alphaWeightedLuminance / alphaTotal,
    averageSaturation: alphaWeightedSaturation / alphaTotal,
    coloredAlphaRatio: coloredAlphaTotal / alphaTotal,
    opaqueEdgeRatio: edgePixels > 0 ? opaqueEdgePixels / edgePixels : 0,
  };
}

function resolveAppearance(stats: PixelStats | null): IconAppearance {
  if (!stats) return "normal";

  if (stats.opaqueEdgeRatio > PRESERVE_RATIO.edge || stats.coloredAlphaRatio > PRESERVE_RATIO.colored)
    return "preserve";
  if (stats.averageLuminance < LUMINANCE.dark && stats.averageSaturation < SATURATION.monochrome) return "dark";
  if (stats.averageLuminance > LUMINANCE.light) return "light";

  return "normal";
}

function getCanvasContext(): CanvasRenderingContext2D | null {
  if (canvasContext !== undefined) return canvasContext;
  if (typeof document === "undefined") return null;

  const canvas = document.createElement("canvas");
  canvas.width = SAMPLE_SIZE_PX;
  canvas.height = SAMPLE_SIZE_PX;
  canvasContext = canvas.getContext("2d", { willReadFrequently: true });
  return canvasContext;
}

function isEdgePixel(x: number, y: number): boolean {
  return x === 0 || y === 0 || x === SAMPLE_SIZE_PX - 1 || y === SAMPLE_SIZE_PX - 1;
}
