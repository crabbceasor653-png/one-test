export type SceneLayer = "background" | "middle" | "foreground";
export type ZOrderAction = "front" | "up" | "down" | "back";
export type CanvasBackgroundMode = "transparent" | "white" | "custom";

export interface CanvasBackground {
  mode: CanvasBackgroundMode;
  color: string;
}

export interface AssetItem {
  id: string;
  name: string;
  src: string;
  width: number;
  height: number;
  createdAt: number;
}

export interface CollageElement {
  id: string;
  assetId: string;
  name: string;
  src: string;
  layer: SceneLayer;
  zIndex: number;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  opacity: number;
}

export interface MockAsset {
  id: string;
  name: string;
  layer: SceneLayer;
  opacity: number;
  swatch: string;
}
