"use client";

import { FolderDef } from "@/context/LogsContext";

interface Props {
  folders: FolderDef[];
  counts: Record<string, number>;
  onDrop?: (folder: FolderDef) => void;
  onSelect?: (folder: FolderDef) => void;
  onNewFolder?: () => void;
}

export function FolderSidebar({ folders, counts, onDrop, onSelect, onNewFolder }: Props) {
  const handleDrop = (e: React.DragEvent<HTMLDivElement>, folder: FolderDef) => {
    e.preventDefault();
    onDrop?.(folder);
    e.currentTarget.classList.remove("drag-over");
    e.currentTarget.style.transform = "scale(1.06)";
    window.setTimeout(() => {
      e.currentTarget.style.transform = "";
    }, 250);
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-title">Folders</div>
      {folders.map((f) => (
        <div
          key={f.key}
          className={`folder folder-${f.key}`}
          style={{ background: f.grad }}
          onDragOver={(e) => {
            e.preventDefault();
            e.currentTarget.classList.add("drag-over");
          }}
          onDragLeave={(e) => e.currentTarget.classList.remove("drag-over")}
          onDrop={(e) => handleDrop(e, f)}
          onClick={() => onSelect?.(f)}
        >
          <div className="folder-icon">{f.icon}</div>
          <div className="folder-name">{f.name}</div>
          <div className="folder-count">
            {counts[f.key] ?? 0} log{(counts[f.key] ?? 0) === 1 ? "" : "s"}
          </div>
          <div className="folder-drop-hint">Drop here</div>
        </div>
      ))}
      <button className="new-folder-btn" onClick={onNewFolder}>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
        New folder
      </button>
    </aside>
  );
}

export default FolderSidebar;
