// app/dashboard/resume-ready/page.tsx
"use client";

import { useState, useEffect } from "react";
import { LogEntry } from "@lib/types";
import { Button } from "@/components/ui/button";
import { FileText, Copy, Check } from "lucide-react";
import Link from "next/link";
import PageTransition from "@/app/components/PageTransition";

interface BulletItem {
  bullet: string;
  date: string;
  id: string;
}

export default function ResumeReadyPage() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedAll, setCopiedAll] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/logs")
      .then((r) => r.json())
      .then((data) => setLogs(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const bullets: BulletItem[] = logs
    .filter((l) => l.resumeBullet)
    .map((l) => ({ bullet: l.resumeBullet, date: l.date, id: l.id }));

  const handleCopyAll = () => {
    navigator.clipboard.writeText(bullets.map((b) => b.bullet).join("\n"));
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  const handleCopyOne = (item: BulletItem) => {
    navigator.clipboard.writeText(item.bullet);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const formatDate = (dateStr: string) =>
    new Date(dateStr + "T00:00:00").toLocaleDateString("en-US", {
      month: "short", day: "numeric", year: "numeric",
    });

  return (
    <PageTransition>
    <div className="px-6 py-8 max-w-3xl mx-auto space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-xl font-semibold text-brand-black">Resume-Ready</h1>
          <p className="text-brand-grey text-sm mt-0.5">Every resume bullet extracted from your logs — ready to paste.</p>
        </div>
        {bullets.length > 0 && (
          <Button
            variant="outline" size="sm"
            onClick={handleCopyAll}
            className="flex items-center gap-1.5 shrink-0 border-stone-200 text-brand-grey hover:text-brand-black"
          >
            {copiedAll
              ? <><Check className="w-3.5 h-3.5 text-brand-indigo" /> Copied!</>
              : <><Copy className="w-3.5 h-3.5" /> Copy all ({bullets.length})</>
            }
          </Button>
        )}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-14 bg-stone-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : bullets.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-12 h-12 rounded-xl bg-stone-100 flex items-center justify-center mb-4">
            <FileText className="w-5 h-5 text-stone-400" />
          </div>
          <h3 className="text-brand-black font-semibold mb-1">No bullets yet</h3>
          <p className="text-brand-grey text-sm max-w-xs">
            Start logging your work and we'll automatically generate strong resume bullets for each entry.
          </p>
          <Link href="/dashboard" className="mt-5">
            <Button className="bg-brand-black hover:bg-brand-black/85 text-white">
              Start logging
            </Button>
          </Link>
        </div>
      ) : (
        <ul className="space-y-2">
          {bullets.map((item) => (
            <li
              key={item.id}
              className="group bg-white border border-stone-200 rounded-xl px-4 py-3 flex items-start gap-3 hover:border-stone-300 transition-colors"
            >
              <span className="text-brand-indigo font-bold text-sm mt-0.5 shrink-0">•</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-brand-black leading-relaxed">{item.bullet}</p>
                <p className="text-xs text-stone-400 mt-1">{formatDate(item.date)}</p>
              </div>
              <button
                onClick={() => handleCopyOne(item)}
                className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg hover:bg-stone-100 text-stone-400 hover:text-brand-grey"
                title="Copy bullet"
              >
                {copiedId === item.id
                  ? <Check className="w-3.5 h-3.5 text-brand-indigo" />
                  : <Copy className="w-3.5 h-3.5" />
                }
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
    </PageTransition>
  );
}
