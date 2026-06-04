import {
  Copy,
  Download,
  Hand,
  Leaf,
  Lock,
  Menu,
  MousePointer2,
  Plus,
  RotateCw,
  Scale,
  SlidersHorizontal,
  Sun,
  Trash2,
  ZoomIn,
  ZoomOut,
} from "lucide-react";

const tools = [
  { label: "选择", icon: MousePointer2, active: true },
  { label: "移动", icon: Hand },
  { label: "旋转", icon: RotateCw },
  { label: "缩放", icon: Scale },
];

interface TopBarProps {
  elementCount: number;
  isExporting: boolean;
  selectedCount: number;
  onDeleteSelectedElements: () => void;
  onDuplicateSelectedElements: () => void;
  onExportPng: () => void;
  onToggleSelectedElementLock: () => void;
}

export function TopBar({
  elementCount,
  isExporting,
  selectedCount,
  onDeleteSelectedElements,
  onDuplicateSelectedElements,
  onExportPng,
  onToggleSelectedElementLock,
}: TopBarProps) {
  const selectedCountLabel = selectedCount > 1 ? `多选(${selectedCount})` : `已放置(${elementCount})`;

  return (
    <header className="top-bar">
      <button className="icon-button menu-button" aria-label="打开菜单">
        <Menu size={22} />
      </button>
      <div className="brand">
        <div className="brand-mark">
          <Leaf size={32} />
        </div>
        <div>
          <h1>植被拼贴编辑器</h1>
          <p>创建自然 · 设计景观</p>
        </div>
      </div>
      <div className="top-selection-actions">
        <strong>{selectedCountLabel}</strong>
        <button aria-label="调整">
          <SlidersHorizontal size={18} />
        </button>
        <button aria-label="复制" disabled={selectedCount === 0} onClick={onDuplicateSelectedElements}>
          <Copy size={18} />
        </button>
        <button aria-label="锁定" disabled={selectedCount === 0} onClick={onToggleSelectedElementLock}>
          <Lock size={18} />
        </button>
        <button aria-label="删除" disabled={selectedCount === 0} onClick={onDeleteSelectedElements}>
          <Trash2 size={18} />
        </button>
      </div>
      <nav className="tool-switcher" aria-label="编辑工具">
        {tools.map((tool) => {
          const Icon = tool.icon;
          return (
            <button className={tool.active ? "tool active" : "tool"} key={tool.label}>
              <Icon size={20} />
              <span>{tool.label}</span>
            </button>
          );
        })}
      </nav>
      <div className="zoom-control">
        <button aria-label="缩小">
          <ZoomOut size={18} />
        </button>
        <strong>85%</strong>
        <button aria-label="放大">
          <ZoomIn size={18} />
        </button>
      </div>
      <button className="export-button" disabled={isExporting} onClick={onExportPng}>
        <span>{isExporting ? "正在导出" : "导出 PNG"}</span>
        <Download size={18} />
      </button>
      <button className="icon-button" aria-label="亮度">
        <Sun size={19} />
      </button>
      <button className="icon-button user-avatar" aria-label="用户">
        <Plus size={18} />
      </button>
    </header>
  );
}
