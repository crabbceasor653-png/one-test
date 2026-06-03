import {
  BringToFront,
  ChevronDown,
  Eye,
  Info,
  Layers,
  Lock,
  MoreVertical,
  Move3D,
  Plus,
  SendToBack,
  SlidersHorizontal,
} from "lucide-react";
import type { CollageElement, SceneLayer, ZOrderAction } from "../types/editor";

const layerGroups: Array<{ key: SceneLayer; name: string }> = [
  { key: "foreground", name: "前景" },
  { key: "middle", name: "中景" },
  { key: "background", name: "背景" },
];

function toNumber(value: string, fallback: number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

interface RightPanelProps {
  elements: CollageElement[];
  selectedElement: CollageElement | null;
  selectedElementIds: string[];
  onChangeElementLayer: (id: string, layer: SceneLayer) => void;
  onDeleteSelectedElements: () => void;
  onDuplicateSelectedElements: () => void;
  onMoveElementZ: (id: string, action: ZOrderAction) => void;
  onSelectElement: (id: string, additive?: boolean) => void;
  onUpdateElement: (id: string, patch: Partial<CollageElement>) => void;
}

export function RightPanel({
  elements,
  selectedElement,
  selectedElementIds,
  onChangeElementLayer,
  onDeleteSelectedElements,
  onDuplicateSelectedElements,
  onMoveElementZ,
  onSelectElement,
  onUpdateElement,
}: RightPanelProps) {
  const selectedOpacity = selectedElement ? Math.round(selectedElement.opacity * 100) : 100;
  const selectedSet = new Set(selectedElementIds);

  function patchSelected(patch: Partial<CollageElement>) {
    if (!selectedElement) {
      return;
    }

    onUpdateElement(selectedElement.id, patch);
  }

  function moveSelected(action: ZOrderAction) {
    if (!selectedElement) {
      return;
    }

    onMoveElementZ(selectedElement.id, action);
  }

  return (
    <aside className="right-panel">
      <section className="panel layer-panel">
        <div className="panel-title">
          <h2>图层</h2>
          <div className="title-actions">
            <button aria-label="新增图层">
              <Plus size={19} />
            </button>
            <button aria-label="图层设置">
              <Move3D size={18} />
            </button>
          </div>
        </div>
        {layerGroups.map((group) => {
          const groupElements = elements
            .filter((element) => element.layer === group.key)
            .sort((a, b) => b.zIndex - a.zIndex);

          return (
          <div className="layer-group" key={group.key}>
            <div className="layer-group-title">
              <ChevronDown size={16} />
              <span className="dot" />
              <strong>
                {group.name} ({groupElements.length})
              </strong>
              <small>{groupElements.length}</small>
            </div>
            {groupElements.length === 0 && <div className="layer-empty">暂无元素</div>}
            {groupElements.map((item) => (
              <button
                className={selectedSet.has(item.id) ? "layer-row active" : "layer-row"}
                key={item.id}
                onClick={(event) => onSelectElement(item.id, event.shiftKey)}
              >
                <Eye size={16} />
                <span className="thumb-image">
                  <img src={item.src} alt="" />
                </span>
                <span className="layer-name">{item.name}</span>
                <span className="opacity">{Math.round(item.opacity * 100)}%</span>
                {selectedSet.has(item.id) ? <Lock size={14} /> : <MoreVertical size={16} />}
              </button>
            ))}
          </div>
        );
        })}
      </section>
      <section className="panel property-panel">
        <div className="panel-title">
          <h2>属性</h2>
          <button aria-label="属性说明">
            <Info size={17} />
          </button>
        </div>
        <div className="property-tabs">
          {["变换", "样式", "混合", "滤镜"].map((tab) => (
            <button className={tab === "变换" ? "active" : ""} key={tab}>
              {tab}
            </button>
          ))}
        </div>
        {selectedElement ? (
          <>
            <div className="selected-summary">
              <span className="thumb-image large">
                <img src={selectedElement.src} alt="" />
              </span>
              <div>
                <strong>{selectedElement.name}</strong>
                <span>
                  {selectedElementIds.length > 1 ? `已选择 ${selectedElementIds.length} 个元素 · ` : ""}
                  {selectedElement.layer === "middle" ? "中景层" : selectedElement.layer === "foreground" ? "前景层" : "背景层"}
                </span>
              </div>
            </div>
            <div className="selection-actions">
              <button onClick={onDuplicateSelectedElements}>
                <span>复制选中</span>
              </button>
              <button className="danger" onClick={onDeleteSelectedElements}>
                <span>删除选中</span>
              </button>
            </div>
            <label className="select-field">
              <span>图层</span>
              <select
                value={selectedElement.layer}
                onChange={(event) => onChangeElementLayer(selectedElement.id, event.target.value as SceneLayer)}
              >
                {layerGroups.map((group) => (
                  <option key={group.key} value={group.key}>
                    {group.name}
                  </option>
                ))}
              </select>
            </label>
            <div className="z-order-actions">
              <button aria-label="置于顶层" onClick={() => moveSelected("front")}>
                <BringToFront size={16} />
                <span>置顶</span>
              </button>
              <button aria-label="上移一层" onClick={() => moveSelected("up")}>
                <Layers size={16} />
                <span>上移</span>
              </button>
              <button aria-label="下移一层" onClick={() => moveSelected("down")}>
                <Layers size={16} />
                <span>下移</span>
              </button>
              <button aria-label="置于底层" onClick={() => moveSelected("back")}>
                <SendToBack size={16} />
                <span>置底</span>
              </button>
            </div>
            <label className="range-field">
              <span>不透明度</span>
              <div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={selectedOpacity}
                  onChange={(event) => patchSelected({ opacity: Number(event.target.value) / 100 })}
                />
                <output>{selectedOpacity}%</output>
              </div>
            </label>
            <label className="select-field">
              <span>混合模式</span>
              <select defaultValue="normal">
                <option value="normal">正常</option>
                <option value="multiply">正片叠底</option>
              </select>
            </label>
            <div className="transform-title">
              <strong>变换</strong>
              <SlidersHorizontal size={16} />
            </div>
            <div className="number-grid">
              <label>
                <span>X</span>
                <input
                  type="number"
                  value={Math.round(selectedElement.x)}
                  onChange={(event) => patchSelected({ x: toNumber(event.target.value, selectedElement.x) })}
                />
              </label>
              <label>
                <span>Y</span>
                <input
                  type="number"
                  value={Math.round(selectedElement.y)}
                  onChange={(event) => patchSelected({ y: toNumber(event.target.value, selectedElement.y) })}
                />
              </label>
              <label>
                <span>宽度</span>
                <input
                  type="number"
                  min="32"
                  value={Math.round(selectedElement.width)}
                  onChange={(event) =>
                    patchSelected({ width: Math.max(32, toNumber(event.target.value, selectedElement.width)) })
                  }
                />
              </label>
              <label>
                <span>高度</span>
                <input
                  type="number"
                  min="32"
                  value={Math.round(selectedElement.height)}
                  onChange={(event) =>
                    patchSelected({ height: Math.max(32, toNumber(event.target.value, selectedElement.height)) })
                  }
                />
              </label>
              <label>
                <span>旋转</span>
                <input
                  type="number"
                  value={Math.round(selectedElement.rotation)}
                  onChange={(event) => patchSelected({ rotation: toNumber(event.target.value, selectedElement.rotation) })}
                />
              </label>
              <label>
                <span>透明</span>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={selectedOpacity}
                  onChange={(event) =>
                    patchSelected({ opacity: Math.min(1, Math.max(0, toNumber(event.target.value, selectedOpacity) / 100)) })
                  }
                />
              </label>
            </div>
          </>
        ) : (
          <div className="property-empty">
            <strong>未选择元素</strong>
            <span>点击画布中的 PNG 后可编辑位置、尺寸、角度和透明度</span>
          </div>
        )}
      </section>
    </aside>
  );
}
