"use client";

import { FolderDef, LogItem } from "@/context/LogsContext";

interface Props {
  folders: FolderDef[];
  logs: LogItem[];
  onSelect: (folder: FolderDef) => void;
  onNew: () => void;
}

export function TasksFolderView({ folders, logs, onSelect, onNew }: Props) {
  const countFor = (key: string) => logs.filter((l) => normalizeFolderKey(l.folder, folders) === key).length;

  return (
    <div className="folder-view active" id="folderView">
      <div className="folder-grid-tasks">
        {folders.map((f) => (
          <div key={f.key} className="folder-card" style={{ background: f.grad }} onClick={() => onSelect(f)}>
            <div className="fc-icon">{f.icon}</div>
            <div className="fc-name">{f.name}</div>
            <div className="fc-count">{countFor(f.key)} logs</div>
            <div className="fc-arrow">→</div>
          </div>
        ))}
        <div className="fc-new" onClick={onNew}>
          <div className="fc-new-icon">+</div>
          <div className="fc-new-label">New folder</div>
        </div>
      </div>
    </div>
  );
}

export default TasksFolderView;

function normalizeFolderKey(value: string, folders: FolderDef[]) {
  const direct = value.toLowerCase();
  const fromName = folders.find((folder) => folder.name.toLowerCase() === direct);
  if (fromName) return fromName.key;
  return direct;
}
