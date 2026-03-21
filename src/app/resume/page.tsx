"use client";

import { useEffect, useState } from "react";
import Nav from "@/components/Nav";
import WeekCard from "@/components/WeekCard";
import { useLogs } from "@/context/LogsContext";

export default function ResumePage() {
  const { allLogs } = useLogs();
  const weeks = groupByWeek(allLogs);
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
            weekLabel={`Week ${weeks.length - idx}`}
            dateRange={w.range}
            logs={w.logs}
            hasStar={detectStar(w.logs)}
            showStar={weekStarState[w.key] ?? detectStar(w.logs)}
            onToggleStar={toggleStarPanel}
          />
        ))}
      </div>
    </div>
  );
}

function groupByWeek(logs: ReturnType<typeof useLogs>["allLogs"]) {
  const map: Record<string, { start: Date; end: Date; logs: typeof logs }> = {};
  logs.forEach((l) => {
    if (!l.date) return;
    const d = new Date(l.date);
    const dow = d.getDay();
    const mon = new Date(d);
    mon.setDate(d.getDate() - (dow === 0 ? 6 : dow - 1));
    const sun = new Date(mon);
    sun.setDate(mon.getDate() + 6);
    const key = mon.toLocaleDateString("en-US");
    if (!map[key]) map[key] = { start: mon, end: sun, logs: [] };
    map[key].logs.push(l);
  });
  return Object.entries(map)
    .sort((a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime())
    .map(([key, val]) => ({
      key,
      range: `${fmtShort(val.start)} - ${fmtShort(val.end)}, ${val.end.getFullYear()}`,
      logs: val.logs,
    }));
}

const fmtShort = (d: Date) => d.toLocaleDateString("en-US", { month: "short", day: "numeric" });

function detectStar(logs: ReturnType<typeof useLogs>["allLogs"]) {
  return logs.some((log) => !!log.task && log.task.length > 40 && !!log.impact && log.impact.length > 20);
}
