import { useRef, useState } from "react";
import {
  CloudUpload,
  Filter,
  Flower,
  Gem,
  ImagePlus,
  Leaf,
  Mountain,
  Search,
  Settings2,
  Sprout,
  Star,
  Trees,
} from "lucide-react";
import type { AssetItem } from "../types/editor";

const sideItems = [
  { label: "素材", icon: Leaf, active: true },
  { label: "中景", icon: Trees },
  { label: "背景", icon: Mountain },
  { label: "地形", icon: Gem },
  { label: "收藏", icon: Star },
  { label: "上传", icon: CloudUpload },
  { label: "模板", icon: ImagePlus },
];

const tabs = ["全部", "树木", "灌木", "草地", "岩石"];

const sampleAssets = [
  { name: "大橡树", color: "#8ccf2d", active: true },
  { name: "阔叶树", color: "#b3d83c" },
  { name: "松树", color: "#4ea931" },
  { name: "花树", color: "#ef6eac", checked: true },
  { name: "白桦树", color: "#5fb646", checked: true },
  { name: "榆树", color: "#a6cf38" },
  { name: "柳树", color: "#c6d653" },
  { name: "灌木", color: "#88b63a" },
  { name: "红枫树", color: "#ef5f28" },
  { name: "小乔木", color: "#94c93d" },
];

function TreePreview({ color }: { color: string }) {
  return (
    <div className="tree-preview" aria-hidden="true">
      <span className="tree-shadow" />
      <span className="tree-trunk" />
      <span className="tree-crown crown-one" style={{ background: color }} />
      <span className="tree-crown crown-two" style={{ background: color }} />
      <span className="tree-crown crown-three" style={{ background: color }} />
    </div>
  );
}

interface AssetPanelProps {
  assets: AssetItem[];
  rejectedAssetCount: number;
  onAddAsset: (asset: AssetItem) => void;
  onUploadAssets: (files: FileList | File[]) => void;
}

export function AssetPanel({ assets, rejectedAssetCount, onAddAsset, onUploadAssets }: AssetPanelProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const hasUploadedAssets = assets.length > 0;

  function openFilePicker() {
    fileInputRef.current?.click();
  }

  return (
    <>
      <aside className="rail">
        {sideItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              className={item.active ? "rail-item active" : "rail-item"}
              key={item.label}
              onClick={item.label === "上传" ? openFilePicker : undefined}
            >
              <Icon size={20} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </aside>
      <aside className="asset-panel panel">
        <input
          ref={fileInputRef}
          className="file-input"
          type="file"
          accept="image/png"
          multiple
          onChange={(event) => {
            if (event.target.files) {
              onUploadAssets(event.target.files);
              event.target.value = "";
            }
          }}
        />
        <div className="panel-title">
          <h2>素材库</h2>
          <button aria-label="素材筛选设置">
            <Settings2 size={18} />
          </button>
        </div>
        <div className="asset-tabs">
          {tabs.map((tab) => (
            <button className={tab === "树木" ? "active" : ""} key={tab}>
              {tab}
            </button>
          ))}
        </div>
        <div className="search-row">
          <div className="search-box">
            <Search size={17} />
            <span>{hasUploadedAssets ? "搜索已上传素材..." : "搜索树木..."}</span>
          </div>
          <button aria-label="筛选">
            <Filter size={17} />
          </button>
        </div>
        <div className="section-label">
          <Sprout size={16} />
          <span>{hasUploadedAssets ? `已上传 PNG (${assets.length})` : "树木示例 (10)"}</span>
        </div>
        {rejectedAssetCount > 0 && <p className="upload-warning">已忽略 {rejectedAssetCount} 个非 PNG 文件</p>}
        <div className="asset-grid">
          {hasUploadedAssets ? (
            assets.map((asset, index) => (
              <button
                className={index === 0 ? "asset-card active" : "asset-card"}
                key={asset.id}
                onClick={() => onAddAsset(asset)}
                title="添加到画布"
              >
                <img className="asset-image" src={asset.src} alt={asset.name} />
                <span className="asset-name">{asset.name}</span>
                <small>
                  {asset.width} × {asset.height}
                </small>
              </button>
            ))
          ) : (
            sampleAssets.map((asset) => (
              <button className={asset.active ? "asset-card active" : "asset-card"} key={asset.name}>
                {asset.checked && (
                  <span className="check-mark">
                    <Flower size={13} />
                  </span>
                )}
                <TreePreview color={asset.color} />
                <span className="asset-name">{asset.name}</span>
              </button>
            ))
          )}
        </div>
        <button
          className={isDragging ? "upload-drop dragging" : "upload-drop"}
          onClick={openFilePicker}
          onDragEnter={(event) => {
            event.preventDefault();
            setIsDragging(true);
          }}
          onDragOver={(event) => {
            event.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(event) => {
            event.preventDefault();
            setIsDragging(false);
            onUploadAssets(event.dataTransfer.files);
          }}
        >
          <CloudUpload size={28} />
          <strong>拖拽 PNG 到此处</strong>
          <span>或点击上传</span>
        </button>
      </aside>
    </>
  );
}
