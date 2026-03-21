"use client";

import { useMemo, useState } from "react";
import Nav from "@/components/Nav";
import CalendarGrid from "@/components/CalendarGrid";
import CalendarRow from "@/components/CalendarRow";
import { useLogs } from "@/context/LogsContext";

export default function ProfilePage() {
  const { allLogs } = useLogs();
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth());
  const [view, setView] = useState<"grid" | "row">("grid");
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  const stats = useMemo(() => {
    const total = allLogs.length;
    const uniqueSkills = new Set(allLogs.flatMap((l) => l.skills)).size;
    const thisMonth = allLogs.filter((l) => {
      const d = new Date(l.date);
      return d.getMonth() === month && d.getFullYear() === year;
    }).length;
    const foldersUsed = new Set(allLogs.map((l) => l.folder).filter(Boolean)).size;
    return { total, uniqueSkills, thisMonth, foldersUsed };
  }, [allLogs, month, year]);

  const logDays = useMemo(() => {
    const set = new Set<number>();
    allLogs.forEach((l) => {
      const d = new Date(l.date);
      if (d.getFullYear() === year && d.getMonth() === month) set.add(d.getDate());
    });
    return set;
  }, [allLogs, month, year]);

  const dayLogs = useMemo(() => {
    if (!selectedDay) return [];
    return allLogs.filter((l) => {
      const d = new Date(l.date);
      return d.getFullYear() === year && d.getMonth() === month && d.getDate() === selectedDay;
    });
  }, [allLogs, month, year, selectedDay]);

  return (
    <div className="page active">
      <Nav />
      <div className="profile-page">
        <div className="profile-header">
          <div className="profile-avatar">WL</div>
          <div>
            <div className="profile-name">WorkLog User</div>
            <div className="profile-sub">Logging since today</div>
          </div>
        </div>

        <div className="profile-stats">
          <div className="stat-card"><div className="stat-num">{stats.total}</div><div className="stat-label">Total Logs</div></div>
          <div className="stat-card"><div className="stat-num">{stats.uniqueSkills}</div><div className="stat-label">Unique Skills</div></div>
          <div className="stat-card"><div className="stat-num">{stats.thisMonth}</div><div className="stat-label">This Month</div></div>
          <div className="stat-card"><div className="stat-num">{stats.foldersUsed}</div><div className="stat-label">Folders Used</div></div>
        </div>

        <div className="cal-section">
          <div className="cal-top">
            <div className="cal-title-row">
              <button className="cal-nav-btn" onClick={() => changeMonth(-1, month, year, setMonth, setYear)}>
                &#8249;
              </button>
              <div className="cal-month-label">{monthName(month)} {year}</div>
              <button className="cal-nav-btn" onClick={() => changeMonth(1, month, year, setMonth, setYear)}>
                &#8250;
              </button>
            </div>
            <div className="cal-view-toggle">
              <button className={`cal-view-btn ${view === "grid" ? "active" : ""}`} onClick={() => setView("grid")}>Grid</button>
              <button className={`cal-view-btn ${view === "row" ? "active" : ""}`} onClick={() => setView("row")}>Row</button>
            </div>
          </div>

          {view === "grid" ? (
            <CalendarGrid year={year} month={month} logDays={logDays} selected={selectedDay} onSelect={setSelectedDay} />
          ) : (
            <div className="cal-row-wrap">
              <CalendarRow year={year} month={month} logDays={logDays} selected={selectedDay} onSelect={setSelectedDay} />
            </div>
          )}

          {selectedDay && (
            <div className="cal-day-logs" id="calDayLogs">
              <div className="cal-day-logs-title">
                {monthName(month)} {selectedDay} — {dayLogs.length} log{dayLogs.length === 1 ? "" : "s"}
              </div>
              <div id="calDayLogsList">
                {dayLogs.length === 0 && (
                  <div style={{ fontSize: "13px", color: "var(--text-muted)", fontStyle: "italic", padding: "8px 0" }}>
                    No logs on this day.
                  </div>
                )}
                {dayLogs.map((log) => (
                  <div key={log.id} className="cal-log-entry">
                    <div className={`cal-log-icon ${log.source}`}>{log.source === "voice" ? "🎙" : "✏️"}</div>
                    <div className="cal-log-title">{log.title}</div>
                    {log.folder && <span className={`cal-log-folder ${log.tag}`}>{log.folder}</span>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function changeMonth(delta: number, month: number, year: number, setMonth: (m: number) => void, setYear: (y: number) => void) {
  let m = month + delta;
  let y = year;
  if (m > 11) {
    m = 0;
    y += 1;
  }
  if (m < 0) {
    m = 11;
    y -= 1;
  }
  setMonth(m);
  setYear(y);
}

const monthName = (m: number) =>
  ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"][m];
