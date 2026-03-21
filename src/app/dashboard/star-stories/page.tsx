// app/dashboard/star-stories/page.tsx
"use client";

import { useState, useEffect } from "react";
import { WeeklySummary, StarStory } from "@lib/types";
import { Loader2, Star, Info } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import PageTransition from "@/app/components/PageTransition";

interface StorySummary {
  weekOf: string;
  stories: StarStory[];
}

function formatWeekLabel(weekOf: string): string {
  const monday = new Date(weekOf + "T00:00:00");
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  const fmt = (d: Date) => d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  return `Week of ${fmt(monday)} – ${fmt(sunday)}, ${sunday.getFullYear()}`;
}

function StoryCard({ story }: { story: StarStory }) {
  return (
    <div className="bg-white border border-stone-200 rounded-xl p-4 space-y-3">
      {[
        { key: "situation" as keyof StarStory },
        { key: "task"      as keyof StarStory },
        { key: "action"    as keyof StarStory },
        { key: "result"    as keyof StarStory },
      ].map(({ key }) => (
        <div key={key}>
          <p className="text-[10px] font-semibold text-brand-purple/70 uppercase tracking-wide mb-0.5">{key}</p>
          <p className="text-sm text-brand-black/80 leading-relaxed">{story[key]}</p>
        </div>
      ))}
    </div>
  );
}

export default function StarStoriesPage() {
  const [grouped, setGrouped] = useState<StorySummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/weekly-summaries")
      .then((r) => r.json())
      .then((data: WeeklySummary[]) => {
        if (!Array.isArray(data)) { setError("Failed to load stories"); return; }
        setGrouped(
          data
            .filter((s) => s.starStories.length > 0)
            .map((s) => ({ weekOf: s.weekOf, stories: s.starStories }))
        );
      })
      .catch(() => setError("Failed to load stories"))
      .finally(() => setLoading(false));
  }, []);

  const totalStories = grouped.reduce((sum, g) => sum + g.stories.length, 0);

  return (
    <PageTransition>
    <div className="px-6 py-8 max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-brand-black">STAR Stories</h1>
        <p className="text-brand-grey text-sm mt-0.5">
          Compelling interview stories surfaced from your weekly summaries.
        </p>
      </div>

      {/* What is a STAR story? */}
      <div className="flex gap-3 bg-white border border-stone-200 rounded-xl p-4">
        <Info className="w-4 h-4 text-stone-400 shrink-0 mt-0.5" />
        <p className="text-xs text-brand-grey leading-relaxed">
          A <strong className="text-brand-black">STAR story</strong> is a structured interview answer:{" "}
          <strong className="text-brand-black">Situation</strong> (context),{" "}
          <strong className="text-brand-black">Task</strong> (your responsibility),{" "}
          <strong className="text-brand-black">Action</strong> (what you did), and{" "}
          <strong className="text-brand-black">Result</strong> (the outcome). Automatically detected when your logs show a clear challenge and impact.
        </p>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-brand-grey">
          <Loader2 className="w-5 h-5 animate-spin text-brand-indigo" />
          <p className="text-sm">Loading stories…</p>
        </div>
      ) : error ? (
        <p className="text-sm text-red-500">{error}</p>
      ) : grouped.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-12 h-12 rounded-xl bg-stone-100 flex items-center justify-center mb-4">
            <Star className="w-5 h-5 text-brand-purple" />
          </div>
          <h3 className="text-brand-black font-semibold mb-1">No stories yet</h3>
          <p className="text-brand-grey text-sm max-w-xs">
            STAR stories are detected when your logs describe a specific challenge, what you did, and the outcome. Keep logging meaningful work to surface them.
          </p>
          <Link href="/dashboard" className="mt-5">
            <Button className="bg-brand-black hover:bg-brand-black/85 text-white">
              Log your work
            </Button>
          </Link>
        </div>
      ) : (
        <>
          <p className="text-sm text-brand-grey">
            {totalStories} {totalStories === 1 ? "story" : "stories"} across{" "}
            {grouped.length} {grouped.length === 1 ? "week" : "weeks"}
          </p>
          <div className="space-y-8">
            {grouped.map(({ weekOf, stories }) => (
              <div key={weekOf}>
                <p className="text-xs font-semibold text-stone-400 uppercase tracking-widest mb-3">
                  {formatWeekLabel(weekOf)}
                </p>
                <div className="space-y-3">
                  {stories.map((story, i) => (
                    <StoryCard key={i} story={story} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
    </PageTransition>
  );
}
