import Konva from "konva";
import type { CanvasBackground, CollageElement } from "../types/editor";

const layerRank: Record<CollageElement["layer"], number> = {
  background: 0,
  middle: 1,
  foreground: 2,
};

function orderElementsForExport(elements: CollageElement[]) {
  return [...elements].sort((a, b) => {
    const layerDelta = layerRank[a.layer] - layerRank[b.layer];
    return layerDelta === 0 ? a.zIndex - b.zIndex : layerDelta;
  });
}

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Image failed to load for export."));
    image.src = src;
  });
}

function getBackgroundFill(background: CanvasBackground) {
  if (background.mode === "transparent") {
    return null;
  }

  return background.mode === "white" ? "#ffffff" : background.color;
}

function downloadDataUrl(dataUrl: string, filename: string) {
  const link = document.createElement("a");
  link.href = dataUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
}

export async function exportCollagePng({
  background,
  elements,
  filename = "vegetation-collage.png",
  height,
  pixelRatio = 1,
  width,
}: {
  background: CanvasBackground;
  elements: CollageElement[];
  filename?: string;
  height: number;
  pixelRatio?: number;
  width: number;
}) {
  const container = document.createElement("div");
  container.style.height = "0";
  container.style.left = "-10000px";
  container.style.overflow = "hidden";
  container.style.position = "fixed";
  container.style.top = "0";
  container.style.width = "0";
  document.body.appendChild(container);

  const stage = new Konva.Stage({
    container,
    height,
    width,
  });
  const layer = new Konva.Layer();
  const fill = getBackgroundFill(background);

  if (fill) {
    layer.add(
      new Konva.Rect({
        fill,
        height,
        width,
        x: 0,
        y: 0,
      }),
    );
  }

  const orderedElements = orderElementsForExport(elements);

  for (const element of orderedElements) {
    const image = await loadImage(element.src);
    layer.add(
      new Konva.Image({
        height: element.height,
        image,
        opacity: element.opacity,
        rotation: element.rotation,
        width: element.width,
        x: element.x,
        y: element.y,
      }),
    );
  }

  stage.add(layer);
  layer.draw();

  const dataUrl = stage.toDataURL({
    mimeType: "image/png",
    pixelRatio,
  });

  stage.destroy();
  container.remove();
  downloadDataUrl(dataUrl, filename);
}
