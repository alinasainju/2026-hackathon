// app/summary/page.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import StarStoryBadge from "@/app/components/StarStoryBadge";
import { WeeklySummary } from "@lib/types";
import {
  Loader2,
  BarChart2,
  Zap,
  Trophy,
  FileText,
  Star,
  Copy,
  Check,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";

export default function SummaryPage() {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [summary, setSummary] = useState<WeeklySummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    if (!startDate || !endDate) {
      setError("Please select both start and end dates.");
      return;
    }
    setLoading(true);
    setError("");
    setSummary(null);
    try {
      const res = await fetch("/api/summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ startDate, endDate }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to generate summary");
      }
      const data: WeeklySummary = await res.json();
      setSummary(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyBullets = () => {
    if (!summary) return;
    navigator.clipboard.writeText(summary.resumeBullets.join("\n"));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Auto-fill this week's dates
  const fillThisWeek = () => {
    const now = new Date();
    const day = now.getDay();
    const monday = new Date(now);
    monday.setDate(now.getDate() - (day === 0 ? 6 : day - 1));
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    setStartDate(monday.toISOString().split("T")[0]);
    setEndDate(sunday.toISOString().split("T")[0]);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Nav */}
      <nav className="bg-white border-b border-slate-200 px-6 py-3 flex items-center gap-3">
        <Link href="/dashboard">
          <Button variant="ghost" size="sm" className="flex items-center gap-1">
            <ArrowLeft className="w-4 h-4" /> Dashboard
          </Button>
        </Link>
        <Separator orientation="vertical" className="h-5" />
        <div className="flex items-center gap-2">
          <BarChart2 className="w-5 h-5 text-purple-500" />
          <span className="font-bold text-slate-800">Weekly Summary</span>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Generate Summary</h1>
          <p className="text-slate-500 text-sm mt-1">
            Select a date range to generate your weekly career summary.
          </p>
        </div>

        {/* Date Picker */}
        <Card>
          <CardContent className="pt-6 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-500">Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full border border-slate-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-500">End Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full border border-slate-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={fillThisWeek}
                className="text-xs"
              >
                This Week
              </Button>
              <Button
                onClick={handleGenerate}
                disabled={loading}
                className="flex-1 bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Generating...
                  </>
                ) : (
                  <>
                    <BarChart2 className="w-4 h-4" /> Generate Summary
                  </>
                )}
              </Button>
            </div>

            {error && <p className="text-xs text-red-500">{error}</p>}
          </CardContent>
        </Card>

        {/* Summary Results */}
        {summary && (
          <div className="space-y-4">
            {/* Top Skills */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Zap className="w-4 h-4 text-purple-500" /> Top Skills This Week
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {summary.topSkills.map((skill) => (
                    <Badge key={skill} variant="secondary">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Key Accomplishments */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-amber-500" /> Key Accomplishments
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {summary.keyAccomplishments.map((item, i) => (
                    <li key={i} className="text-sm text-slate-700 flex gap-2">
                      <span className="text-amber-400 font-bold">•</span> {item}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Resume Bullets */}
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <FileText className="w-4 h-4 text-blue-500" /> Resume Bullets
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCopyBullets}
                    className="text-xs flex items-center gap-1"
                  >
                    {copied ? (
                      <><Check className="w-3 h-3 text-emerald-500" /> Copied!</>
                    ) : (
                      <><Copy className="w-3 h-3" /> Copy All</>
                    )}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {summary.resumeBullets.map((bullet, i) => (
                    <li
                      key={i}
                      className="text-sm text-slate-700 bg-slate-50 rounded-md p-2 flex gap-2"
                    >
                      <span className="text-blue-400 font-bold">•</span> {bullet}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* STAR Stories */}
            {summary.starStories.length > 0 && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    STAR Stories This Week
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {summary.starStories.map((story, i) => (
                    <StarStoryBadge key={i} starStory={story} />
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
}