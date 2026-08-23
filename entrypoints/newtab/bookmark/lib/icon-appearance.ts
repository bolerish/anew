type IconAppearance = "dark" | "light" | "normal" | "preserve";

type PixelStats = {
  averageLuminance: number;
  averageSaturation: number;
  coloredAlphaRatio: number;
  opaqueEdgeRatio: number;
};

const SIZE = 16;

let canvasContext: CanvasRenderingContext2D | null | undefined;

export function getIconAppearance(image: HTMLImageElement): IconAppearance {
  const context = getCanvasContext();

  if (!context) return "normal";

  try {
    context.clearRect(0, 0, SIZE, SIZE);
    context.drawImage(image, 0, 0, SIZE, SIZE);
    return resolveAppearance(getPixelStats(context.getImageData(0, 0, SIZE, SIZE).data));
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

  for (let index = 0; index < pixels.length; index += 4) {
    const alpha = pixels[index + 3] / 255;
    const pixelIndex = index / 4;
    const x = pixelIndex % SIZE;
    const y = Math.floor(pixelIndex / SIZE);

    if (isEdgePixel(x, y)) {
      edgePixels += 1;
      if (alpha > 0.9) opaqueEdgePixels += 1;
    }

    if (alpha < 0.1) continue;

    const red = pixels[index] / 255;
    const green = pixels[index + 1] / 255;
    const blue = pixels[index + 2] / 255;
    const luminance = 0.2126 * red + 0.7152 * green + 0.0722 * blue;
    const saturation = Math.max(red, green, blue) - Math.min(red, green, blue);
    alphaWeightedLuminance += luminance * alpha;
    alphaWeightedSaturation += saturation * alpha;
    alphaTotal += alpha;

    if (saturation > 0.34) coloredAlphaTotal += alpha;
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

  if (stats.opaqueEdgeRatio > 0.8 || stats.coloredAlphaRatio > 0.16) return "preserve";
  if (stats.averageLuminance < 0.26 && stats.averageSaturation < 0.2) return "dark";
  if (stats.averageLuminance > 0.84) return "light";

  return "normal";
}

function getCanvasContext(): CanvasRenderingContext2D | null {
  if (canvasContext !== undefined) return canvasContext;
  if (typeof document === "undefined") return null;

  const canvas = document.createElement("canvas");
  canvas.width = SIZE;
  canvas.height = SIZE;
  canvasContext = canvas.getContext("2d", { willReadFrequently: true });
  return canvasContext;
}

function isEdgePixel(x: number, y: number): boolean {
  return x === 0 || y === 0 || x === SIZE - 1 || y === SIZE - 1;
}
