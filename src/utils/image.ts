import type { AssetItem } from "../types/editor";

function createId() {
  if ("randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function readAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

function readImageSize(src: string) {
  return new Promise<{ width: number; height: number }>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve({ width: image.naturalWidth, height: image.naturalHeight });
    image.onerror = reject;
    image.src = src;
  });
}

export function isPngFile(file: File) {
  return file.type === "image/png" || file.name.toLowerCase().endsWith(".png");
}

export async function readPngAsset(file: File): Promise<AssetItem> {
  const src = await readAsDataUrl(file);
  const size = await readImageSize(src);

  return {
    id: createId(),
    name: file.name.replace(/\.png$/i, ""),
    src,
    width: size.width,
    height: size.height,
    createdAt: Date.now(),
  };
}
