// app/dashboard/page.tsx
"use client";

import { useState, useEffect } from "react";
import VoiceRecorder from "@/app/components/VoiceRecorder";
import LogCard from "@/app/components/LogCard";
import { LogEntry } from "@lib/types";
import { Mic, BarChart2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const res = await fetch("/api/logs");
      const data = await res.json();
      setLogs(data);
    } catch (err) {
      console.error("Failed to fetch logs", err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogSaved = (newLog: LogEntry) => {
    setLogs((prev) => [newLog, ...prev]);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Nav */}
      <nav className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Mic className="w-5 h-5 text-emerald-500" />
          <span className="font-bold text-slate-800">InternLog</span>
        </div>
        <Link href="/summary">
          <Button variant="outline" size="sm" className="flex items-center gap-2">
            <BarChart2 className="w-4 h-4" />
            Weekly Summary
          </Button>
        </Link>
      </nav>

      <div className="max-w-2xl mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Daily Log</h1>
          <p className="text-slate-500 text-sm mt-1">
            Speak about your day and we will extract the career gold.
          </p>
        </div>

        {/* Voice Recorder */}
        <VoiceRecorder onLogSaved={handleLogSaved} />

        {/* Logs */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-slate-700">
            Your Logs{" "}
            <span className="text-sm font-normal text-slate-400">
              ({logs.length} entries)
            </span>
          </h2>

          {loading ? (
            <p className="text-sm text-slate-400">Loading logs...</p>
          ) : logs.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <Mic className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">No logs yet. Record your first entry above!</p>
            </div>
          ) : (
            logs.map((log) => <LogCard key={log.id} log={log} />)
          )}
        </div>
      </div>
    </div>
  );
}