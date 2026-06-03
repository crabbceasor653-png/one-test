# 技术架构

## 技术栈

- React
- TypeScript
- Vite
- Konva.js
- react-konva
- lucide-react

第一版使用纯前端技术，不依赖后端服务。

## 推荐目录结构

```text
src/
  main.tsx
  App.tsx
  components/
    TopBar.tsx
    AssetPanel.tsx
    CanvasEditor.tsx
    LayerPanel.tsx
    PropertyPanel.tsx
    StatusBar.tsx
  store/
    editorStore.ts
  types/
    editor.ts
  utils/
    image.ts
    exportCanvas.ts
```

## 组件职责

### TopBar

- 展示产品名称。
- 切换选择、移动、旋转、缩放等工具模式。
- 提供导出 PNG 操作。

### AssetPanel

- 处理 PNG 上传。
- 展示素材缩略图。
- 将素材添加到画布。

### CanvasEditor

- 承载 Konva Stage。
- 渲染画布背景与所有图片元素。
- 处理元素选择、拖动、缩放、旋转。
- 处理多选与组合的基础接口。

### LayerPanel

- 按背景层、中景层、前景层展示元素。
- 支持选中元素。
- 支持元素切换层级。
- 为上移一层、下移一层预留交互。

### PropertyPanel

- 展示当前选中元素属性。
- 编辑位置、尺寸、旋转角度、透明度、图层。
- 提供复制、删除、上移、下移操作入口。

### StatusBar

- 展示画布尺寸、缩放比例、保存状态等信息。

## 状态管理

第一版优先使用 `useReducer` 或轻量 store，避免过早引入复杂状态模型。若编辑状态快速增长，再升级为 zustand。

状态应集中维护：

- 素材列表
- 画布元素列表
- 当前选中元素 ID 列表
- 当前工具模式
- 画布背景
- 画布尺寸与缩放比例

## 渲染原则

- 所有元素按 layer 和 zIndex 排序后渲染。
- Stage 内只渲染真正需要导出的内容。
- UI 控制面板不进入导出结果。
- 导出时使用 Konva `toDataURL`，按需要设置 `pixelRatio`。

## 风险点

- 本地上传图片使用 Data URL，素材过多时可能占用较大内存。
- 多选与组合需要谨慎处理 transform，第一版先保留简单能力。
- 透明背景导出时，不能额外绘制白色背景。
- Konva Transformer 与 React 状态同步需要保持单一数据来源。
