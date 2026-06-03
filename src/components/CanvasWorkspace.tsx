import { useEffect, useRef, useState } from "react";
import Konva from "konva";
import { Image as KonvaImage, Layer, Stage, Transformer } from "react-konva";
import { canvasSize } from "../constants/canvas";
import type { CanvasBackground, CollageElement } from "../types/editor";

const layerRank: Record<CollageElement["layer"], number> = {
  background: 0,
  middle: 1,
  foreground: 2,
};

function orderElementsForCanvas(elements: CollageElement[]) {
  return [...elements].sort((a, b) => {
    const layerDelta = layerRank[a.layer] - layerRank[b.layer];
    return layerDelta === 0 ? a.zIndex - b.zIndex : layerDelta;
  });
}

function CanvasImage({
  element,
  isSelected,
  onSelect,
  onChange,
}: {
  element: CollageElement;
  isSelected: boolean;
  onSelect: (additive: boolean) => void;
  onChange: (patch: Partial<CollageElement>) => void;
}) {
  const imageRef = useRef<Konva.Image>(null);
  const transformerRef = useRef<Konva.Transformer>(null);
  const [image, setImage] = useState<HTMLImageElement | null>(null);

  useEffect(() => {
    const nextImage = new Image();
    nextImage.onload = () => setImage(nextImage);
    nextImage.src = element.src;
  }, [element.src]);

  useEffect(() => {
    if (!isSelected || !imageRef.current || !transformerRef.current) {
      return;
    }

    transformerRef.current.nodes([imageRef.current]);
    transformerRef.current.getLayer()?.batchDraw();
  }, [element.height, element.rotation, element.width, isSelected]);

  return (
    <>
      <KonvaImage
        ref={imageRef}
        image={image ?? undefined}
        x={element.x}
        y={element.y}
        width={element.width}
        height={element.height}
        rotation={element.rotation}
        opacity={element.opacity}
        draggable
        onClick={(event) => onSelect(event.evt.shiftKey)}
        onDragEnd={(event) => {
          onChange({
            x: Math.round(event.target.x()),
            y: Math.round(event.target.y()),
          });
        }}
        onTap={() => onSelect(false)}
        onTransformEnd={() => {
          const node = imageRef.current;

          if (!node) {
            return;
          }

          const scaleX = node.scaleX();
          const scaleY = node.scaleY();
          const width = Math.max(32, Math.round(node.width() * scaleX));
          const height = Math.max(32, Math.round(node.height() * scaleY));

          node.scaleX(1);
          node.scaleY(1);

          onChange({
            x: Math.round(node.x()),
            y: Math.round(node.y()),
            width,
            height,
            rotation: Math.round(node.rotation()),
          });
        }}
      />
      {isSelected && (
        <Transformer
          ref={transformerRef}
          enabledAnchors={["top-left", "top-right", "bottom-left", "bottom-right"]}
          rotateEnabled
          borderStroke="#57e06d"
          borderStrokeWidth={2}
          anchorStroke="#57e06d"
          anchorFill="#eef7ee"
          anchorSize={10}
          boundBoxFunc={(oldBox, newBox) => {
            if (newBox.width < 32 || newBox.height < 32) {
              return oldBox;
            }

            return newBox;
          }}
        />
      )}
    </>
  );
}

interface CanvasWorkspaceProps {
  background: CanvasBackground;
  elements: CollageElement[];
  selectedElementIds: string[];
  onClearSelection: () => void;
  onSelectElement: (id: string, additive?: boolean) => void;
  onUpdateElement: (id: string, patch: Partial<CollageElement>) => void;
}

export function CanvasWorkspace({
  background,
  elements,
  selectedElementIds,
  onClearSelection,
  onSelectElement,
  onUpdateElement,
}: CanvasWorkspaceProps) {
  const stageShellRef = useRef<HTMLDivElement>(null);
  const [stageViewSize, setStageViewSize] = useState({ height: 1, width: 1 });
  const selectedSet = new Set(selectedElementIds);
  const orderedElements = orderElementsForCanvas(elements);
  const backgroundPreviewStyle =
    background.mode === "custom"
      ? { backgroundColor: background.color }
      : background.mode === "white"
        ? { backgroundColor: "#ffffff" }
        : undefined;
  const scaleX = stageViewSize.width / canvasSize.width;
  const scaleY = stageViewSize.height / canvasSize.height;

  useEffect(() => {
    const stageShellElement = stageShellRef.current;

    if (!stageShellElement) {
      return;
    }

    const measuredElement = stageShellElement;

    function updateStageViewSize() {
      const rect = measuredElement.getBoundingClientRect();
      setStageViewSize({
        height: Math.max(1, Math.round(rect.height)),
        width: Math.max(1, Math.round(rect.width)),
      });
    }

    updateStageViewSize();

    const resizeObserver = new ResizeObserver(updateStageViewSize);
    resizeObserver.observe(measuredElement);

    return () => resizeObserver.disconnect();
  }, []);

  return (
    <main className="workspace">
      <div className="stage-shell" ref={stageShellRef}>
        <div className="mock-canvas">
          <div
            className={
              background.mode === "transparent"
                ? "canvas-background-preview transparent"
                : "canvas-background-preview solid"
            }
            style={backgroundPreviewStyle}
          />
          <div className="sky-layer" />
          <div className="mountain mountain-back" />
          <div className="mountain mountain-front" />
          <div className="river" />
          <div className="field field-left" />
          <div className="field field-right" />
          <div className="birds" />
          {elements.length === 0 && (
            <>
              <div className="selected-tree selected-large">
                <span className="rotate-badge">15°</span>
                <div className="selection-box green" />
                <div className="tree-scene large-tree" />
              </div>
              <div className="selected-tree selected-small">
                <div className="selection-box blue" />
                <div className="tree-scene pink-tree" />
              </div>
            </>
          )}
          <div className="foreground-grass" />
          {elements.length === 0 && (
            <div className="canvas-empty-state">
              <strong>点击左侧已上传 PNG</strong>
              <span>素材会添加到画布中间</span>
            </div>
          )}
          <div className="konva-stage-layer">
            <Stage
              width={stageViewSize.width}
              height={stageViewSize.height}
              scaleX={scaleX}
              scaleY={scaleY}
              onMouseDown={(event) => {
                if (event.target === event.target.getStage()) {
                  onClearSelection();
                }
              }}
              onTouchStart={(event) => {
                if (event.target === event.target.getStage()) {
                  onClearSelection();
                }
              }}
            >
              <Layer>
                {orderedElements.map((element) => (
                  <CanvasImage
                    element={element}
                    isSelected={selectedSet.has(element.id)}
                    key={element.id}
                    onChange={(patch) => onUpdateElement(element.id, patch)}
                    onSelect={(additive) => onSelectElement(element.id, additive)}
                  />
                ))}
              </Layer>
            </Stage>
          </div>
        </div>
      </div>
    </main>
  );
}
