"use client";

import { LogItem } from "@/context/LogsContext";
import { useEffect, useState } from "react";

interface Props {
  logs: LogItem[];
  folderNames: Record<string, string>;
  onDragStart?: (event: React.DragEvent<HTMLDivElement>, log: LogItem) => void;
  onDragEnd?: () => void;
  onEdit?: (log: LogItem) => void;
  onMove?: (log: LogItem) => void;
  onDelete?: (id: string) => void;
}

export function LogList({ logs, folderNames, onDragStart, onDragEnd, onEdit, onMove, onDelete }: Props) {
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const orderedLogs = [...logs].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  useEffect(() => {
    const onDocClick = () => setActiveMenuId(null);
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, []);

  return (
    <div className="log-list">
      {orderedLogs.map((log) => (
        <div
          key={log.id}
          className="log-item"
          data-id={log.id}
          data-folder={log.folder}
          draggable
          onDragStart={(event) => onDragStart?.(event, log)}
          onDragEnd={() => onDragEnd?.()}
        >
          <div className="log-item-header">
            <span className="drag-handle">⠿</span>
            <span className="log-item-title">{log.title}</span>
          </div>
          <div className="log-item-time">
            {formatLogDate(log.date)}
            {log.time ? ` • ${log.time}` : ""}
          </div>
          <button
            className="three-dot-btn"
            onClick={(e) => {
              e.stopPropagation();
              setActiveMenuId((prev) => (prev === log.id ? null : log.id));
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <circle cx="12" cy="5" r="2" />
              <circle cx="12" cy="12" r="2" />
              <circle cx="12" cy="19" r="2" />
            </svg>
          </button>
          <div className={`dot-menu ${activeMenuId === log.id ? "open" : ""}`}>
            <div
              className="dot-menu-item"
              onClick={() => {
                setActiveMenuId(null);
                onEdit?.(log);
              }}
            >
              ✏️ Edit
            </div>
            <div
              className="dot-menu-item"
              onClick={() => {
                setActiveMenuId(null);
                onMove?.(log);
              }}
            >
              📁 Move to
            </div>
            <div className="dot-menu-sep" />
            <div
              className="dot-menu-item danger"
              onClick={() => {
                setActiveMenuId(null);
                onDelete?.(log.id);
              }}
            >
              🗑 Delete
            </div>
          </div>
          {log.folder && <span className={`log-item-tag ${log.tag}`}>{folderNames[log.folder] ?? log.folder}</span>}
        </div>
      ))}
      {orderedLogs.length === 0 && <div className="tasks-empty">No logs yet.</div>}
    </div>
  );
}

export default LogList;

function formatLogDate(rawDate: string) {
  const date = new Date(rawDate);
  if (Number.isNaN(date.getTime())) return rawDate;
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
