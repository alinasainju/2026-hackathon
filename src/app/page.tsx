"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Nav from "@/components/Nav";
import FolderSidebar from "@/components/FolderSidebar";
import LogList from "@/components/LogList";
import MicRecorder from "@/components/MicRecorder";
import { FolderDef, LogItem, useLogs } from "@/context/LogsContext";

const colorOptions = [
  "linear-gradient(135deg,#f5d5b8,#edc49a)",
  "linear-gradient(135deg,#c2dff5,#a8cfe8)",
  "linear-gradient(135deg,#c2e8cc,#a6d8b4)",
  "linear-gradient(135deg,#e8c2e8,#d4a8d4)",
  "linear-gradient(135deg,#f5f0b8,#ede4a0)",
];

export default function DashboardPage() {
  const router = useRouter();
  const { allLogs, folders, updateLog, deleteLog, addFolder } = useLogs();
  const [folderCounts, setFolderCounts] = useState<Record<string, number>>({});
  const [draggedLog, setDraggedLog] = useState<LogItem | null>(null);
  const [toast, setToast] = useState("");
  const [dashEditItem, setDashEditItem] = useState<LogItem | null>(null);
  const [dashEditTitle, setDashEditTitle] = useState("");
  const [dashEditTime, setDashEditTime] = useState("");
  const [movingItem, setMovingItem] = useState<LogItem | null>(null);
  const [selectedMoveFolder, setSelectedMoveFolder] = useState<FolderDef | null>(null);
  const [newFolderOpen, setNewFolderOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [newFolderGrad, setNewFolderGrad] = useState(colorOptions[0]);
  const ghostRef = useRef<HTMLDivElement | null>(null);
  const toastTimerRef = useRef<number | null>(null);

  useEffect(() => {
    syncFolders();
  }, [allLogs, folders]);

  useEffect(() => {
    const onDragOver = (event: DragEvent) => {
      if (!ghostRef.current || !draggedLog) return;
      ghostRef.current.style.left = `${event.clientX + 14}px`;
      ghostRef.current.style.top = `${event.clientY - 14}px`;
    };

    document.addEventListener("dragover", onDragOver);
    return () => document.removeEventListener("dragover", onDragOver);
  }, [draggedLog]);

  const folderNameMap = useMemo(
    () =>
      folders.reduce<Record<string, string>>((acc, folder) => {
        acc[folder.key] = folder.name;
        return acc;
      }, {}),
    [folders]
  );

  function syncFolders(logsInput = allLogs, foldersInput = folders) {
    const next: Record<string, number> = {};
    foldersInput.forEach((folder) => {
      next[folder.key] = logsInput.filter((log) => normalizeFolderKey(log.folder, foldersInput) === folder.key).length;
    });
    setFolderCounts(next);
  }

  function showToast(message: string) {
    setToast(message);
    if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
    toastTimerRef.current = window.setTimeout(() => setToast(""), 2400);
  }

  function applyFolderToItem(log: LogItem, folder: FolderDef) {
    const nextLogs = allLogs.map((item) =>
      item.id === log.id ? { ...item, folder: folder.key, tag: folder.tag, dot: folder.dot } : item
    );
    updateLog(log.id, {
      folder: folder.key,
      tag: folder.tag,
      dot: folder.dot,
    });
    syncFolders(nextLogs);
  }

  function handleFolderDrop(folder: FolderDef) {
    if (!draggedLog) return;
    applyFolderToItem(draggedLog, folder);
    showToast(`Pinned to ${folder.name} 📁`);
    setDraggedLog(null);
    if (ghostRef.current) ghostRef.current.style.opacity = "0";
  }

  function handleDragStart(event: React.DragEvent<HTMLDivElement>, log: LogItem) {
    setDraggedLog(log);
    event.currentTarget.classList.add("dragging");
    if (ghostRef.current) {
      ghostRef.current.textContent = log.title;
      ghostRef.current.style.opacity = "1";
    }
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setDragImage(new Image(), 0, 0);
  }

  function handleDragEnd() {
    const dragging = document.querySelector(".log-item.dragging");
    if (dragging) dragging.classList.remove("dragging");
    if (ghostRef.current) ghostRef.current.style.opacity = "0";
    setDraggedLog(null);
  }

  function confirmDashEdit() {
    if (!dashEditItem) return;
    updateLog(dashEditItem.id, { title: dashEditTitle, time: dashEditTime });
    setDashEditItem(null);
    showToast("Updated ✓");
  }

  function confirmMove() {
    if (!movingItem || !selectedMoveFolder) return;
    applyFolderToItem(movingItem, selectedMoveFolder);
    setMovingItem(null);
    setSelectedMoveFolder(null);
    showToast(`Moved to ${selectedMoveFolder.name} 📁`);
  }

  function removeLog(id: string) {
    const item = document.querySelector<HTMLElement>(`.log-item[data-id="${id}"]`);
    if (item) {
      item.style.transition = "opacity 0.25s, transform 0.25s";
      item.style.opacity = "0";
      item.style.transform = "scale(0.95)";
      window.setTimeout(() => {
        const nextLogs = allLogs.filter((log) => log.id !== id);
        deleteLog(id);
        syncFolders(nextLogs);
      }, 250);
    } else {
      const nextLogs = allLogs.filter((log) => log.id !== id);
      deleteLog(id);
      syncFolders(nextLogs);
    }
    showToast("Entry deleted");
  }

  function confirmNewFolder() {
    const name = newFolderName.trim();
    if (!name) return;
    const key = name.toLowerCase().replace(/\s+/g, "-");
    const iconRotation = ["📂", "🗂", "📋", "🔖", "📌"];
    const icon = iconRotation[folders.length % 5];
    const nextFolder = {
      key,
      name,
      icon,
      tag: `tag-${key}`,
      dot: `dot-${key}`,
      grad: newFolderGrad,
    };
    addFolder(nextFolder);
    syncFolders(allLogs, [...folders, nextFolder]);
    setNewFolderName("");
    setNewFolderGrad(colorOptions[0]);
    setNewFolderOpen(false);
    showToast(`"${name}" created 📁`);
  }

  return (
    <div className="page active">
      <Nav />
      <div className="layout">
        <FolderSidebar
          folders={folders}
          counts={folderCounts}
          onDrop={handleFolderDrop}
          onSelect={(folder) => router.push(`/tasks?folder=${folder.key}`)}
          onNewFolder={() => setNewFolderOpen(true)}
        />
        <div className="main-card">
          <div className="left-panel">
            <h2 className="panel-title">Your Logs</h2>
            <div className="panel-date">Each entry keeps its own saved date.</div>
            <LogList
              logs={allLogs}
              folderNames={folderNameMap}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              onEdit={(log) => {
                setDashEditItem(log);
                setDashEditTitle(log.title);
                setDashEditTime(log.time);
              }}
              onMove={(log) => {
                setMovingItem(log);
                setSelectedMoveFolder(null);
              }}
              onDelete={removeLog}
            />
          </div>
          <MicRecorder />
        </div>
      </div>

      <div className={`modal-backdrop ${dashEditItem ? "show" : ""}`} onClick={() => setDashEditItem(null)} />
      <div className={`base-modal ${dashEditItem ? "show" : ""}`}>
        <div className="modal-title">Edit Entry</div>
        <div className="modal-field">
          <label>Title</label>
          <input className="modal-input" value={dashEditTitle} onChange={(e) => setDashEditTitle(e.target.value)} type="text" />
        </div>
        <div className="modal-field">
          <label>Time</label>
          <input className="modal-input" value={dashEditTime} onChange={(e) => setDashEditTime(e.target.value)} type="text" />
        </div>
        <div className="modal-actions">
          <button className="btn-cancel" onClick={() => setDashEditItem(null)}>
            Cancel
          </button>
          <button className="btn-confirm" onClick={confirmDashEdit}>
            Save
          </button>
        </div>
      </div>

      <div className={`modal-backdrop ${movingItem ? "show" : ""}`} onClick={() => setMovingItem(null)} />
      <div className={`base-modal ${movingItem ? "show" : ""}`}>
        <div className="modal-title">Move to folder</div>
        <div className="moveto-grid">
          {folders.map((folder) => (
            <div
              key={folder.key}
              className={`moveto-folder ${selectedMoveFolder?.key === folder.key ? "selected" : ""}`}
              style={{ background: folder.grad }}
              onClick={() => setSelectedMoveFolder(folder)}
            >
              <div className="mf-icon">{folder.icon}</div>
              <div className="mf-name">{folder.name}</div>
            </div>
          ))}
        </div>
        <div className="modal-actions">
          <button className="btn-cancel" onClick={() => setMovingItem(null)}>
            Cancel
          </button>
          <button className="btn-confirm" disabled={!selectedMoveFolder} onClick={confirmMove}>
            Move
          </button>
        </div>
      </div>

      <div className={`modal-backdrop ${newFolderOpen ? "show" : ""}`} onClick={() => setNewFolderOpen(false)} />
      <div className={`base-modal ${newFolderOpen ? "show" : ""}`}>
        <div className="modal-title">New Folder</div>
        <div className="modal-field">
          <label>Folder name</label>
          <input
            className="modal-input"
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            type="text"
            placeholder="e.g. ENGR 220"
          />
        </div>
        <div className="modal-field">
          <label>Color</label>
          <div style={{ display: "flex", gap: "10px", marginTop: "4px" }}>
            {colorOptions.map((grad) => (
              <div
                key={grad}
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "50%",
                  background: grad,
                  cursor: "pointer",
                  border: `2.5px solid ${newFolderGrad === grad ? "#3b8fd4" : "transparent"}`,
                }}
                onClick={() => setNewFolderGrad(grad)}
              />
            ))}
          </div>
        </div>
        <div className="modal-actions">
          <button className="btn-cancel" onClick={() => setNewFolderOpen(false)}>
            Cancel
          </button>
          <button className="btn-confirm" onClick={confirmNewFolder}>
            Create folder
          </button>
        </div>
      </div>

      <div ref={ghostRef} className="drag-ghost" />
      <div className={`toast ${toast ? "show" : ""}`}>{toast}</div>
    </div>
  );
}

function normalizeFolderKey(value: string, folders: FolderDef[]) {
  const direct = value.toLowerCase();
  const fromName = folders.find((folder) => folder.name.toLowerCase() === direct);
  if (fromName) return fromName.key;
  return direct;
}
