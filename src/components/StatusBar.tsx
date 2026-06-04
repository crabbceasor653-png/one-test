import { BringToFront, Check, Expand, Layers, SendToBack } from "lucide-react";
import type { CanvasBackground, CanvasBackgroundMode, ZOrderAction } from "../types/editor";

interface StatusBarProps {
  background: CanvasBackground;
  selectedElementId: string | null;
  selectedElementLocked: boolean;
  onChangeBackground: (background: CanvasBackground) => void;
  onMoveElementZ: (id: string, action: ZOrderAction) => void;
}

const backgroundModes: Array<{ label: string; mode: CanvasBackgroundMode }> = [
  { label: "透明", mode: "transparent" },
  { label: "白色", mode: "white" },
  { label: "自定义", mode: "custom" },
];

export function StatusBar({
  background,
  selectedElementId,
  selectedElementLocked,
  onChangeBackground,
  onMoveElementZ,
}: StatusBarProps) {
  function changeBackgroundMode(mode: CanvasBackgroundMode) {
    onChangeBackground({ ...background, mode });
  }

  function moveSelected(action: ZOrderAction) {
    if (!selectedElementId || selectedElementLocked) {
      return;
    }

    onMoveElementZ(selectedElementId, action);
  }

  return (
    <footer className="status-bar">
      <div className="canvas-size">
        <Expand size={22} />
        <span>
          画布尺寸
          <strong>3840 x 2160 px</strong>
        </span>
      </div>
      <label className="toggle-row">
        <span>参考线</span>
        <input type="checkbox" />
      </label>
      <div className="background-control" aria-label="画布背景">
        <span>背景</span>
        <div className="background-mode-buttons">
          {backgroundModes.map((item) => (
            <button
              className={background.mode === item.mode ? "active" : ""}
              key={item.mode}
              onClick={() => changeBackgroundMode(item.mode)}
              type="button"
            >
              {item.label}
            </button>
          ))}
        </div>
        <input
          aria-label="自定义背景色"
          disabled={background.mode !== "custom"}
          type="color"
          value={background.color}
          onChange={(event) => onChangeBackground({ color: event.target.value, mode: "custom" })}
        />
      </div>
      <div className="status-layer-actions" aria-label="图层顺序">
        <button disabled={!selectedElementId || selectedElementLocked} onClick={() => moveSelected("front")} type="button">
          <BringToFront size={18} />
          <span>置于顶层</span>
        </button>
        <button disabled={!selectedElementId || selectedElementLocked} onClick={() => moveSelected("up")} type="button">
          <Layers size={18} />
          <span>上移一层</span>
        </button>
        <button disabled={!selectedElementId || selectedElementLocked} onClick={() => moveSelected("down")} type="button">
          <Layers size={18} />
          <span>下移一层</span>
        </button>
        <button disabled={!selectedElementId || selectedElementLocked} onClick={() => moveSelected("back")} type="button">
          <SendToBack size={18} />
          <span>置于底层</span>
        </button>
      </div>
      <div className="save-state">
        <Check size={18} />
        <span>自动保存已开启</span>
      </div>
      <time>14:35</time>
    </footer>
  );
}
