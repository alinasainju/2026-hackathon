"use client";

import { useMemo, useState } from "react";
import { FolderDef, LogItem } from "@/context/LogsContext";

interface Props {
  logs: LogItem[];
  folders: FolderDef[];
  activeFolder?: FolderDef | null;
}

export function TasksListView({ logs, folders, activeFolder }: Props) {
  const [openId, setOpenId] = useState<string | null>(null);
  const [openTranscriptId, setOpenTranscriptId] = useState<string | null>(null);

  const grouped = useMemo(() => {
    const map: Record<string, LogItem[]> = {};
    logs.forEach((l) => {
      if (activeFolder && normalizeFolderKey(l.folder, folders) !== activeFolder.key) return;
      map[l.date] = map[l.date] || [];
      map[l.date].push(l);
    });
    return Object.entries(map).sort((a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime());
  }, [logs, activeFolder, folders]);

  if (grouped.length === 0) return <div className="tasks-empty">No logs here yet.</div>;

  const folderTag = (log: LogItem) => folders.find((f) => f.key === normalizeFolderKey(log.folder, folders));

  return (
    <div className="list-view active" id="listView">
      {grouped.map(([date, items]) => (
        <div key={date} className="date-group">
          <div className="date-label">
            <strong>{date}</strong>
          </div>
          <div className="date-group-items">
            {items.map((log) => {
              const f = folderTag(log);
              const isOpen = openId === log.id;
              const isTranscriptOpen = openTranscriptId === log.id;
              return (
                <div key={log.id}>
                  <div
                    className={`log-row ${isOpen ? "expanded" : ""}`}
                    onClick={(e) => {
                      if ((e.target as HTMLElement).closest(".log-row-icon")) return;
                      setOpenTranscriptId(null);
                      setOpenId(isOpen ? null : log.id);
                    }}
                  >
                    <div
                      className={`log-row-icon ${log.source === "voice" ? "voice" : "text"}`}
                      title={log.source === "voice" ? "Voice memo" : "Text entry"}
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenId(null);
                        setOpenTranscriptId(isTranscriptOpen ? null : log.id);
                      }}
                    >
                      {log.source === "voice" ? "🎙" : "✏️"}
                    </div>
                    <div className="log-row-title">{log.title}</div>
                    <div className="log-row-actions">
                      {f && <span className={`row-tag ${f.tag}`}>{f.name}</span>}
                      <span className="log-row-time">{log.time}</span>
                    </div>
                  </div>

                  <div className={`log-row-expand ${isTranscriptOpen ? "show" : ""}`}>
                    <div className="expand-transcript-wrap">
                      <div className={`expand-source-badge ${log.source}`}>
                        {log.source === "voice" ? "🎙 Voice recording" : "✏️ Typed memo"}
                      </div>
                      <div className="expand-raw-label">Raw transcription</div>
                      <div className="expand-transcript">{log.rawTranscript || log.task}</div>
                    </div>
                  </div>

                  <div className={`log-row-expand ${isOpen ? "show" : ""}`}>
                    <div className="expand-full">
                      <div className="expand-section">
                        <div className="expand-section-label">What you did / learned</div>
                        <div className="expand-section-text italic">{log.task}</div>
                      </div>
                      <div className="expand-section">
                        <div className="expand-section-label">Skills</div>
                        <div className="expand-skills">
                          {log.skills.map((s) => (
                            <span key={s} className="expand-skill">
                              {s}
                            </span>
                          ))}
                          {log.skills.length === 0 && <span className="expand-section-text">No skills tagged</span>}
                        </div>
                      </div>
                      <div className="expand-section">
                        <div className="expand-section-label">Impact</div>
                        <div className="expand-section-text">{log.impact || ""}</div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

export default TasksListView;

function normalizeFolderKey(value: string, folders: FolderDef[]) {
  const direct = value.toLowerCase();
  const fromName = folders.find((folder) => folder.name.toLowerCase() === direct);
  if (fromName) return fromName.key;
  return direct;
}
