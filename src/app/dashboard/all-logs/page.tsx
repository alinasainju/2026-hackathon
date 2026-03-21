// app/dashboard/all-logs/page.tsx
"use client";

import { useState, useEffect } from "react";
import LogCard from "@/app/components/LogCard";
import { LogEntry } from "@lib/types";
import { Mic } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import PageTransition from "@/app/components/PageTransition";

export default function AllLogsPage() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/logs")
      .then((r) => r.json())
      .then((data) => setLogs(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <PageTransition>
    <div className="px-6 py-8 max-w-3xl mx-auto space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-xl font-semibold text-brand-black">All Logs</h1>
          <p className="text-brand-grey text-sm mt-0.5">Every entry you've recorded, newest first.</p>
        </div>
        {!loading && logs.length > 0 && (
          <span className="text-sm text-brand-grey">{logs.length} {logs.length === 1 ? "entry" : "entries"}</span>
        )}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-28 bg-stone-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : logs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-12 h-12 rounded-xl bg-stone-100 flex items-center justify-center mb-4">
            <Mic className="w-5 h-5 text-stone-400" />
          </div>
          <h3 className="text-brand-black font-semibold mb-1">No logs yet</h3>
          <p className="text-brand-grey text-sm max-w-xs">
            Your career story starts here. Record your first day to begin building your professional memory.
          </p>
          <Link href="/dashboard" className="mt-5">
            <Button className="bg-brand-black hover:bg-brand-black/85 text-white">
              <Mic className="w-4 h-4 mr-2" /> Record your first log
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {logs.map((log) => (
            <LogCard key={log.id} log={log} />
          ))}
        </div>
      )}
    </div>
    </PageTransition>
  );
}
