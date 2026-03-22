"use client";

import { useEffect, useState } from "react";
import Nav from "@/components/Nav";
import WeekCard from "@/components/WeekCard";
import { useLogs } from "@/context/LogsContext";

export default function ResumePage() {
  const { allLogs, folders } = useLogs();
  const weeks = groupByWeekAndFolder(allLogs, folders);
  const [weekStarState, setWeekStarState] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setWeekStarState((prev) => {
      let changed = false;
      const next = { ...prev };

      weeks.forEach((week) => {
        if (next[week.key] === undefined) {
          next[week.key] = detectStar(week.logs);
          changed = true;
        }
      });

      return changed ? next : prev;
    });
  }, [weeks]);

  const toggleStarPanel = (weekKey: string) => {
    setWeekStarState((prev) => ({
      ...prev,
      [weekKey]: !prev[weekKey],
    }));
  };

  return (
    <div className="page active">
      <Nav />
      <div className="resume-page">
        <div className="resume-title">Resume</div>
        {weeks.length === 0 && <div className="no-logs-msg">No logs yet — record something on the Dashboard.</div>}
        {weeks.map((w, idx) => (
          <WeekCard
            key={w.key}
            weekKey={w.key}
            weekLabel={w.label || `Week ${weeks.length - idx}`}
            dateRange={w.range}
            logs={w.logs}
            showBullets={w.isCompleteWeek}
            hasStar={detectStar(w.logs)}
            showStar={weekStarState[w.key] ?? detectStar(w.logs)}
            onToggleStar={toggleStarPanel}
          />
        ))}
      </div>
    </div>
  );
}

function groupByWeekAndFolder(logs: ReturnType<typeof useLogs>["allLogs"], folders: ReturnType<typeof useLogs>["folders"]) {
  const map: Record<string, { start: Date; end: Date; logs: typeof logs; folderLabel: string }> = {};
  logs.forEach((l) => {
    if (!l.date) return;
    const d = new Date(l.date);
    const dow = d.getDay();
    const mon = new Date(d);
    mon.setDate(d.getDate() - (dow === 0 ? 6 : dow - 1));
    const sun = new Date(mon);
    sun.setDate(mon.getDate() + 6);
    const folder = folders.find((item) => item.key === l.folder) ?? null;
    const folderKey = folder?.key || "unassigned";
    const folderLabel = folder?.name || "Unassigned";
    const key = `${mon.toLocaleDateString("en-US")}::${folderKey}`;
    if (!map[key]) map[key] = { start: mon, end: sun, logs: [], folderLabel };
    map[key].logs.push(l);
  });
  return Object.entries(map)
    .sort((a, b) => b[1].start.getTime() - a[1].start.getTime())
    .map(([key, val]) => ({
      key,
      label: val.folderLabel,
      range: `${fmtShort(val.start)} - ${fmtShort(val.end)}, ${val.end.getFullYear()}`,
      logs: val.logs,
      isCompleteWeek: hasWeekWorthOfLogs(val.logs, val.end),
    }));
}

const fmtShort = (d: Date) => d.toLocaleDateString("en-US", { month: "short", day: "numeric" });

function detectStar(logs: ReturnType<typeof useLogs>["allLogs"]) {
  return logs.some((log) => !!log.starStory);
}

function hasWeekWorthOfLogs(logs: ReturnType<typeof useLogs>["allLogs"], weekEnd: Date) {
  const uniqueDays = new Set(logs.map((log) => log.date)).size;
  if (uniqueDays >= 5) return true;

  const now = new Date();
  const endOfWeek = new Date(weekEnd);
  endOfWeek.setHours(23, 59, 59, 999);
  return now.getTime() >= endOfWeek.getTime();
}
