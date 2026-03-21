"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Nav from "@/components/Nav";
import TasksFolderView from "@/components/TasksFolderView";
import TasksListView from "@/components/TasksListView";
import { useLogs, FolderDef } from "@/context/LogsContext";

export default function TasksPage() {
  const searchParams = useSearchParams();
  const { folders, allLogs } = useLogs();
  const [view, setView] = useState<"folder" | "list">("folder");
  const [activeFolder, setActiveFolder] = useState<FolderDef | null>(null);

  const sortedLogs = useMemo(() => {
    // basic recent-first
    return [...allLogs].reverse();
  }, [allLogs]);

  useEffect(() => {
    const folderKey = searchParams.get("folder");
    if (!folderKey) return;

    const folder = folders.find((item) => item.key === folderKey);
    if (!folder) return;

    setActiveFolder(folder);
    setView("list");
  }, [folders, searchParams]);

  return (
    <div className="page active">
      <Nav />
      <div className="tasks-page">
        <div className="tasks-header">
          <div className="tasks-header-left">
            <div className="tasks-title">Logs</div>
          </div>
          <div className="tasks-header-right">
            <div className="view-toggle">
              <button className={`view-btn ${view === "list" ? "active" : ""}`} onClick={() => setView("list")}>
                List
              </button>
              <button className={`view-btn ${view === "folder" ? "active" : ""}`} onClick={() => setView("folder")}>
                By Folder
              </button>
            </div>
          </div>
        </div>

        <div className="tasks-card">
          {view === "folder" && (
            <TasksFolderView
              folders={folders}
              logs={sortedLogs}
              onSelect={(f) => {
                setActiveFolder(f);
                setView("list");
              }}
              onNew={() => alert("Add folder via context later")}
            />
          )}

          {view === "list" && (
            <div className="list-view active" id="listView">
              <div className={`folder-drilldown ${activeFolder ? "show" : ""}`}>
                {activeFolder && (
                  <>
                    <button className="back-btn" onClick={() => setActiveFolder(null)}>
                      ‹ All folders
                    </button>
                    <span style={{ color: "var(--text-muted)", fontSize: "13px" }}>/</span>
                    <span className="drilldown-title">{activeFolder.name}</span>
                  </>
                )}
              </div>
              <TasksListView logs={sortedLogs} folders={folders} activeFolder={activeFolder} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
