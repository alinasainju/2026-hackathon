// app/dashboard/weekly-summary/page.tsx
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import StarStoryBadge from "@/app/components/StarStoryBadge";
import { WeeklySummary } from "@lib/types";
import { Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import PageTransition from "@/app/components/PageTransition";

function formatWeekLabel(weekOf: string): string {
  const monday = new Date(weekOf + "T00:00:00");
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  const fmt = (d: Date) => d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  return `${fmt(monday)} – ${fmt(sunday)}, ${sunday.getFullYear()}`;
}

function skillFrequency(summaries: WeeklySummary[]): Record<string, number> {
  const freq: Record<string, number> = {};
  summaries.forEach((s) => s.topSkills.forEach((sk) => { freq[sk] = (freq[sk] ?? 0) + 1; }));
  return freq;
}

export default function WeeklySummaryPage() {
  const [summaries, setSummaries] = useState<WeeklySummary[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/weekly-summaries")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setSummaries(data);
        else setError(data.error ?? "Failed to load summaries");
      })
      .catch(() => setError("Failed to load summaries"))
      .finally(() => setLoading(false));
  }, []);

  const summary = summaries[currentIndex] ?? null;
  const freq = skillFrequency(summaries);

  return (
    <PageTransition>
    <div className="px-6 py-8 max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-brand-black">Weekly Summary</h1>
        <p className="text-brand-grey text-sm mt-0.5">Auto-generated for each completed week.</p>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-brand-grey">
          <Loader2 className="w-5 h-5 animate-spin text-brand-indigo" />
          <p className="text-sm">Generating your summaries…</p>
          <p className="text-xs text-stone-400">This may take a moment for new weeks</p>
        </div>
      ) : error ? (
        <p className="text-sm text-red-500">{error}</p>
      ) : summaries.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-12 h-12 rounded-xl bg-stone-100 flex items-center justify-center mb-4">
            <span className="text-lg">📊</span>
          </div>
          <h3 className="text-brand-black font-semibold mb-1">No completed weeks yet</h3>
          <p className="text-brand-grey text-sm max-w-xs">
            Summaries appear automatically once a full Mon–Sun week has passed. Keep logging!
          </p>
        </div>
      ) : (
        <>
          {/* Week navigator */}
          <div className="flex items-center justify-between bg-white border border-stone-200 rounded-xl px-4 py-2.5">
            <Button
              variant="ghost" size="sm"
              onClick={() => setCurrentIndex((i) => i + 1)}
              disabled={currentIndex >= summaries.length - 1}
              className="text-brand-grey hover:text-brand-black h-8"
            >
              <ChevronLeft className="w-4 h-4 mr-1" /> Older
            </Button>
            <div className="text-center">
              <p className="text-sm font-medium text-brand-black">{formatWeekLabel(summary.weekOf)}</p>
              <p className="text-xs text-brand-grey mt-0.5">{currentIndex + 1} of {summaries.length}</p>
            </div>
            <Button
              variant="ghost" size="sm"
              onClick={() => setCurrentIndex((i) => i - 1)}
              disabled={currentIndex <= 0}
              className="text-brand-grey hover:text-brand-black h-8"
            >
              Newer <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>

          <div className="space-y-3">
            {/* Top Skills */}
            <div className="bg-white border border-stone-200 rounded-xl p-5">
              <h3 className="text-xs font-semibold text-stone-400 uppercase tracking-wide mb-3">Top Skills</h3>
              <div className="flex flex-wrap gap-2">
                {summary.topSkills.map((skill) => (
                  <span
                    key={skill}
                    className="inline-flex items-center gap-1.5 bg-stone-100 text-brand-black text-xs font-medium rounded-md px-2.5 py-1"
                  >
                    {skill}
                    {freq[skill] > 1 && (
                      <span className="bg-brand-indigo/15 text-brand-indigo rounded px-1 text-[10px] font-bold leading-none py-0.5">
                        {freq[skill]}×
                      </span>
                    )}
                  </span>
                ))}
              </div>
            </div>

            {/* Key Accomplishments */}
            <div className="bg-white border border-stone-200 rounded-xl p-5">
              <h3 className="text-xs font-semibold text-stone-400 uppercase tracking-wide mb-3">Key Accomplishments</h3>
              <ul className="space-y-2.5">
                {summary.keyAccomplishments.map((item, i) => (
                  <li key={i} className="flex gap-3 text-sm text-brand-black/80">
                    <span className="w-5 h-5 rounded-full bg-stone-100 text-brand-black text-[10px] font-semibold flex items-center justify-center shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Resume Bullets */}
            <div className="bg-white border border-stone-200 rounded-xl p-5">
              <h3 className="text-xs font-semibold text-stone-400 uppercase tracking-wide mb-3">Resume Bullets</h3>
              <ul className="space-y-2">
                {summary.resumeBullets.map((bullet, i) => (
                  <li key={i} className="bg-stone-50 border border-stone-200 rounded-lg p-3 text-sm text-brand-black flex gap-2">
                    <span className="text-brand-indigo font-bold shrink-0">•</span> {bullet}
                  </li>
                ))}
              </ul>
            </div>

            {/* STAR Stories */}
            {summary.starStories.length > 0 && (
              <div className="bg-white border border-stone-200 rounded-xl p-5">
                <h3 className="text-xs font-semibold text-stone-400 uppercase tracking-wide mb-3">STAR Stories</h3>
                <div className="space-y-3">
                  {summary.starStories.map((story, i) => (
                    <StarStoryBadge key={i} starStory={story} />
                  ))}
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
    </PageTransition>
  );
}
