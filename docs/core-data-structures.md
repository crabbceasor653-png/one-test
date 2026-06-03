# 核心数据结构

## 图层类型

```ts
type SceneLayer = "background" | "middle" | "foreground";
```

## 画布背景

```ts
type CanvasBackground =
  | { type: "transparent" }
  | { type: "color"; color: string };
```

## 素材

```ts
interface AssetItem {
  id: string;
  name: string;
  src: string;
  width?: number;
  height?: number;
  createdAt: number;
}
```

## 画布元素

```ts
interface CollageElement {
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

  locked: boolean;
  visible: boolean;
  groupId: string | null;
}
```

## 编辑器状态

```ts
interface EditorState {
  assets: AssetItem[];
  elements: CollageElement[];
  selectedIds: string[];
  activeTool: "select" | "move" | "rotate" | "scale";
  background: CanvasBackground;
  stageWidth: number;
  stageHeight: number;
  zoom: number;
}
```

## 排序规则

```ts
const layerOrder: Record<SceneLayer, number> = {
  background: 0,
  middle: 1,
  foreground: 2,
};

const sortedElements = [...elements].sort((a, b) => {
  if (layerOrder[a.layer] !== layerOrder[b.layer]) {
    return layerOrder[a.layer] - layerOrder[b.layer];
  }
  return a.zIndex - b.zIndex;
});
```

## 状态更新原则

- 不直接修改元素对象。
- 每次编辑通过 action 或集中方法更新。
- 选中元素只存 ID，不存完整对象副本。
- 导出画面从当前 editor state 生成。
