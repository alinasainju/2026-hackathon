// app/dashboard/page.tsx
"use client";

import { useState, useEffect } from "react";
import VoiceRecorder from "@/app/components/VoiceRecorder";
import LogCard from "@/app/components/LogCard";
import { LogEntry } from "@lib/types";
import { Mic } from "lucide-react";
import PageTransition from "@/app/components/PageTransition";

function getTopSkill(logs: LogEntry[]): string | null {
  const freq: Record<string, number> = {};
  logs.forEach((l) => l.skills.forEach((s) => { freq[s] = (freq[s] ?? 0) + 1; }));
  const entries = Object.entries(freq);
  if (entries.length === 0) return null;
  return entries.sort((a, b) => b[1] - a[1])[0][0];
}

export default function DashboardPage() {
  const [allLogs, setAllLogs] = useState<LogEntry[]>([]);
  const [newLogs, setNewLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/logs")
      .then((r) => r.json())
      .then((data: LogEntry[]) => setAllLogs(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleLogSaved = (log: LogEntry) => {
    setNewLogs((prev) => [log, ...prev]);
    setAllLogs((prev) => [log, ...prev]);
  };

  const today = new Date().toISOString().split("T")[0];
  const todayLogs = [
    ...newLogs,
    ...allLogs.filter((l) => l.date === today && !newLogs.find((n) => n.id === l.id)),
  ];
  const topSkill = getTopSkill(allLogs);
  const starCount = allLogs.filter((l) => l.starStory).length;
  const uniqueDays = new Set(allLogs.map((l) => l.date)).size;

  const stats = [
    { label: "Total logs",   value: loading ? "—" : String(allLogs.length) },
    { label: "Days logged",  value: loading ? "—" : String(uniqueDays)     },
    { label: "Top skill",    value: loading ? "—" : (topSkill ?? "None yet") },
    { label: "STAR stories", value: loading ? "—" : String(starCount)      },
  ];

  return (
    <PageTransition>
    <div className="px-6 py-8 max-w-5xl mx-auto space-y-7">
      <div>
        <h1 className="text-xl font-semibold text-brand-black">Log Today</h1>
        <p className="text-brand-grey text-sm mt-0.5">Speak about your day and we'll extract the career gold.</p>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {stats.map(({ label, value }) => (
          <div key={label} className="bg-white border border-stone-200 rounded-xl px-4 py-3">
            <p className="text-xs text-brand-grey mb-0.5">{label}</p>
            <p className="text-lg font-semibold text-brand-black">{value}</p>
          </div>
        ))}
      </div>

      {/* Two-column */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">
        <div className="lg:col-span-3">
          <VoiceRecorder onLogSaved={handleLogSaved} />
        </div>

        <div className="lg:col-span-2 space-y-3">
          <h2 className="text-sm font-medium text-brand-grey">
            Today's entries
            {todayLogs.length > 0 && (
              <span className="ml-1.5 text-stone-400 font-normal">({todayLogs.length})</span>
            )}
          </h2>

          {loading ? (
            <p className="text-sm text-brand-grey">Loading…</p>
          ) : todayLogs.length === 0 ? (
            <div className="border border-dashed border-stone-200 rounded-xl p-6 text-center">
              <Mic className="w-6 h-6 text-stone-300 mx-auto mb-2" />
              <p className="text-sm text-brand-grey">Nothing logged yet today.</p>
              <p className="text-xs text-stone-400 mt-1">Your saved entries will appear here.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {todayLogs.map((log) => <LogCard key={log.id} log={log} />)}
            </div>
          )}
        </div>
      </div>
    </div>
    </PageTransition>
  );
}
