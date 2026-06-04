import { useEffect, useRef, useState } from "react";
import { AssetPanel } from "./components/AssetPanel";
import { CanvasWorkspace } from "./components/CanvasWorkspace";
import { RightPanel } from "./components/RightPanel";
import { StatusBar } from "./components/StatusBar";
import { TopBar } from "./components/TopBar";
import { canvasSize } from "./constants/canvas";
import type { AssetItem, CanvasBackground, CollageElement, SceneLayer, ZOrderAction } from "./types/editor";
import { exportCollagePng } from "./utils/export";
import { isPngFile, readPngAsset } from "./utils/image";

function isEditingFormField(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) {
    return false;
  }

  return target.isContentEditable || ["INPUT", "SELECT", "TEXTAREA"].includes(target.tagName);
}

function getNextLayerZIndex(elements: CollageElement[], layer: SceneLayer) {
  const layerIndexes = elements.filter((element) => element.layer === layer).map((element) => element.zIndex);
  return layerIndexes.length === 0 ? 0 : Math.max(...layerIndexes) + 1;
}

function reorderLayer(elements: CollageElement[], targetId: string, action: ZOrderAction) {
  const target = elements.find((element) => element.id === targetId);

  if (!target) {
    return elements;
  }

  const layerItems = elements
    .filter((element) => element.layer === target.layer)
    .sort((a, b) => a.zIndex - b.zIndex);
  const currentIndex = layerItems.findIndex((element) => element.id === targetId);

  if (currentIndex < 0) {
    return elements;
  }

  const nextItems = [...layerItems];
  const [item] = nextItems.splice(currentIndex, 1);

  if (action === "front") {
    nextItems.push(item);
  }

  if (action === "back") {
    nextItems.unshift(item);
  }

  if (action === "up") {
    nextItems.splice(Math.min(currentIndex + 1, nextItems.length), 0, item);
  }

  if (action === "down") {
    nextItems.splice(Math.max(currentIndex - 1, 0), 0, item);
  }

  const zIndexById = new Map(nextItems.map((element, index) => [element.id, index]));

  return elements.map((element) => {
    const nextZIndex = zIndexById.get(element.id);
    return nextZIndex === undefined ? element : { ...element, zIndex: nextZIndex };
  });
}

export default function App() {
  const [assets, setAssets] = useState<AssetItem[]>([]);
  const [elements, setElements] = useState<CollageElement[]>([]);
  const [selectedElementIds, setSelectedElementIds] = useState<string[]>([]);
  const [canvasBackground, setCanvasBackground] = useState<CanvasBackground>({
    color: "#ffffff",
    mode: "transparent",
  });
  const [isExporting, setIsExporting] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [rejectedAssetCount, setRejectedAssetCount] = useState(0);
  const noticeTimerRef = useRef<number | null>(null);
  const selectedElementId = selectedElementIds[selectedElementIds.length - 1] ?? null;
  const selectedElement = elements.find((element) => element.id === selectedElementId) ?? null;

  async function handleAssetUpload(files: FileList | File[]) {
    const fileList = Array.from(files);
    const pngFiles = fileList.filter(isPngFile);
    const rejectedCount = fileList.length - pngFiles.length;

    setRejectedAssetCount(rejectedCount);

    if (pngFiles.length === 0) {
      return;
    }

    try {
      const loadedAssets = await Promise.all(pngFiles.map(readPngAsset));
      setAssets((currentAssets) => [...loadedAssets, ...currentAssets]);
    } catch {
      showNotice("PNG 读取失败，请重新选择文件。");
    }
  }

  function showNotice(message: string) {
    setNotice(message);

    if (noticeTimerRef.current !== null) {
      window.clearTimeout(noticeTimerRef.current);
    }

    noticeTimerRef.current = window.setTimeout(() => {
      setNotice(null);
      noticeTimerRef.current = null;
    }, 3200);
  }

  function handleAddAssetToCanvas(asset: AssetItem) {
    const maxDisplaySize = 760;
    const ratio = Math.min(maxDisplaySize / asset.width, maxDisplaySize / asset.height, 1);
    const width = Math.max(48, Math.round(asset.width * ratio));
    const height = Math.max(48, Math.round(asset.height * ratio));
    const offset = (elements.length % 6) * 80;
    const id = crypto.randomUUID();

    const element: CollageElement = {
      id,
      assetId: asset.id,
      name: asset.name,
      src: asset.src,
      layer: "middle",
      zIndex: elements.length,
      x: canvasSize.width / 2 - width / 2 + offset,
      y: canvasSize.height / 2 - height / 2 + offset,
      width,
      height,
      rotation: 0,
      opacity: 1,
      locked: false,
    };

    setElements((currentElements) => [...currentElements, element]);
    setSelectedElementIds([id]);
  }

  function handleSelectElement(id: string, additive = false) {
    setSelectedElementIds((currentIds) => {
      if (!additive) {
        return [id];
      }

      if (currentIds.includes(id)) {
        return currentIds.filter((currentId) => currentId !== id);
      }

      return [...currentIds, id];
    });
  }

  function handleClearSelection() {
    setSelectedElementIds([]);
  }

  function handleUpdateElement(id: string, patch: Partial<CollageElement>) {
    setElements((currentElements) =>
      currentElements.map((element) => {
        if (element.id !== id) {
          return element;
        }

        if (element.locked) {
          return element;
        }

        return { ...element, ...patch };
      }),
    );
  }

  function handleToggleElementLock(id: string) {
    setElements((currentElements) =>
      currentElements.map((element) => (element.id === id ? { ...element, locked: !element.locked } : element)),
    );
  }

  function handleToggleSelectedElementLock() {
    if (selectedElementIds.length === 0) {
      return;
    }

    const selectedSet = new Set(selectedElementIds);
    const shouldLock = elements.some((element) => selectedSet.has(element.id) && !element.locked);

    setElements((currentElements) =>
      currentElements.map((element) => (selectedSet.has(element.id) ? { ...element, locked: shouldLock } : element)),
    );
  }

  function handleChangeElementLayer(id: string, layer: SceneLayer) {
    setElements((currentElements) => {
      const target = currentElements.find((element) => element.id === id);

      if (!target || target.locked || target.layer === layer) {
        return currentElements;
      }

      const nextZIndex = getNextLayerZIndex(currentElements, layer);

      return currentElements.map((element) =>
        element.id === id ? { ...element, layer, zIndex: nextZIndex } : element,
      );
    });
  }

  function handleMoveElementZ(id: string, action: ZOrderAction) {
    setElements((currentElements) => {
      const target = currentElements.find((element) => element.id === id);
      return target?.locked ? currentElements : reorderLayer(currentElements, id, action);
    });
  }

  function handleDuplicateSelectedElements() {
    if (selectedElementIds.length === 0) {
      return;
    }

    const selectedSet = new Set(selectedElementIds);
    const selectedElements = elements.filter((element) => selectedSet.has(element.id) && !element.locked);

    if (selectedElements.length === 0) {
      showNotice("选中的元素已锁定，请先解锁后再复制。");
      return;
    }

    const nextLayerIndexes = new Map<SceneLayer, number>();
    const duplicatedElements = selectedElements.map((element) => {
      const nextZIndex = nextLayerIndexes.get(element.layer) ?? getNextLayerZIndex(elements, element.layer);
      nextLayerIndexes.set(element.layer, nextZIndex + 1);

      return {
        ...element,
        id: crypto.randomUUID(),
        name: `${element.name} 副本`,
        x: element.x + 80,
        y: element.y + 80,
        zIndex: nextZIndex,
      };
    });

    setElements((currentElements) => [...currentElements, ...duplicatedElements]);
    setSelectedElementIds(duplicatedElements.map((element) => element.id));
  }

  function handleDeleteSelectedElements() {
    if (selectedElementIds.length === 0) {
      return;
    }

    const selectedSet = new Set(selectedElementIds);

    const lockedSelectedIds = elements
      .filter((element) => selectedSet.has(element.id) && element.locked)
      .map((element) => element.id);

    setElements((currentElements) =>
      currentElements.filter((element) => !selectedSet.has(element.id) || element.locked),
    );
    setSelectedElementIds(lockedSelectedIds);

    if (lockedSelectedIds.length > 0) {
      showNotice("部分元素已锁定，未被删除。");
    }
  }

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (isEditingFormField(event.target)) {
        return;
      }

      if (event.key === "Delete" || event.key === "Backspace") {
        handleDeleteSelectedElements();
      }

      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "d") {
        event.preventDefault();
        handleDuplicateSelectedElements();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [elements, selectedElementIds]);

  useEffect(() => {
    return () => {
      if (noticeTimerRef.current !== null) {
        window.clearTimeout(noticeTimerRef.current);
      }
    };
  }, []);

  async function handleExportPng() {
    if (isExporting) {
      return;
    }

    if (elements.length === 0) {
      showNotice("请先上传 PNG 并添加到画布，再导出作品。");
      return;
    }

    setIsExporting(true);

    try {
      await exportCollagePng({
        background: canvasBackground,
        elements,
        height: canvasSize.height,
        width: canvasSize.width,
      });
      showNotice("PNG 已开始下载。");
    } catch {
      showNotice("导出失败，请检查 PNG 素材后重试。");
    } finally {
      setIsExporting(false);
    }
  }

  return (
    <div className="app-shell">
      <TopBar
        elementCount={elements.length}
        isExporting={isExporting}
        selectedCount={selectedElementIds.length}
        onDeleteSelectedElements={handleDeleteSelectedElements}
        onDuplicateSelectedElements={handleDuplicateSelectedElements}
        onExportPng={handleExportPng}
        onToggleSelectedElementLock={handleToggleSelectedElementLock}
      />
      <div className="editor-body">
        <AssetPanel
          assets={assets}
          rejectedAssetCount={rejectedAssetCount}
          onAddAsset={handleAddAssetToCanvas}
          onUploadAssets={handleAssetUpload}
        />
        <CanvasWorkspace
          background={canvasBackground}
          elements={elements}
          selectedElementIds={selectedElementIds}
          onClearSelection={handleClearSelection}
          onSelectElement={handleSelectElement}
          onUpdateElement={handleUpdateElement}
        />
        <RightPanel
          elements={elements}
          selectedElement={selectedElement}
          selectedElementIds={selectedElementIds}
          onChangeElementLayer={handleChangeElementLayer}
          onDeleteSelectedElements={handleDeleteSelectedElements}
          onDuplicateSelectedElements={handleDuplicateSelectedElements}
          onMoveElementZ={handleMoveElementZ}
          onSelectElement={handleSelectElement}
          onToggleElementLock={handleToggleElementLock}
          onUpdateElement={handleUpdateElement}
        />
      </div>
      {notice && (
        <div className="app-toast" role="status">
          {notice}
        </div>
      )}
      <StatusBar
        background={canvasBackground}
        selectedElementId={selectedElementId}
        selectedElementLocked={selectedElement?.locked ?? false}
        onChangeBackground={setCanvasBackground}
        onMoveElementZ={handleMoveElementZ}
      />
    </div>
  );
}
