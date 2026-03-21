// components/LogCard.tsx
"use client";

import { useState } from "react";
import { LogEntry } from "@lib/types";
import StarStoryBadge from "./StarStoryBadge";
import { CalendarDays, Mic, Target, Zap, FileText, ChevronDown, ChevronUp } from "lucide-react";

interface LogCardProps {
  log: LogEntry;
}

export default function LogCard({ log }: LogCardProps) {
  const [expanded, setExpanded] = useState(false);

  const formattedDate = new Date(log.date + "T00:00:00").toLocaleDateString("en-US", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });

  const previewSkills = log.skills.slice(0, 3);
  const extraSkills = log.skills.length - 3;

  return (
    <div className={`w-full bg-white border-stone-200 rounded-xl shadow-none overflow-hidden border ${log.starStory ? "border-l-2 border-l-brand-purple" : ""}`}>
      <div className="p-4 space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-brand-grey">
            <CalendarDays className="w-3.5 h-3.5" />
            <span>{formattedDate}</span>
          </div>
          {log.starStory && (
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-brand-purple bg-brand-purple/10 rounded-full px-2 py-0.5">
              ★ STAR
            </span>
          )}
        </div>

        {/* Task */}
        <div>
          <p className="text-[10px] font-semibold text-stone-400 uppercase tracking-wide mb-0.5 flex items-center gap-1">
            <Target className="w-3 h-3" /> Task
          </p>
          <p className="text-sm text-brand-black font-medium leading-snug">{log.task}</p>
        </div>

        {/* Skills */}
        <div>
          <p className="text-[10px] font-semibold text-stone-400 uppercase tracking-wide mb-1 flex items-center gap-1">
            <Zap className="w-3 h-3" /> Skills
          </p>
          <div className="flex items-center gap-1.5 flex-wrap">
            {previewSkills.map((skill) => (
              <span key={skill} className="text-xs bg-stone-100 text-stone-600 rounded-md px-2 py-0.5 font-medium">
                {skill}
              </span>
            ))}
            {extraSkills > 0 && !expanded && (
              <span className="text-xs text-stone-400">+{extraSkills} more</span>
            )}
          </div>
        </div>

        {/* Resume bullet */}
        <div className="border border-stone-200 rounded-lg p-3 flex gap-2 items-start bg-stone-50">
          <FileText className="w-3.5 h-3.5 text-brand-indigo shrink-0 mt-0.5" />
          <div>
            <p className="text-[10px] font-semibold text-stone-400 uppercase tracking-wide mb-0.5">Resume Bullet</p>
            <p className="text-sm text-brand-black leading-relaxed">{log.resumeBullet}</p>
          </div>
        </div>

        {/* Expanded */}
        {expanded && (
          <div className="space-y-3 pt-1 border-t border-stone-100">
            {log.skills.length > 3 && (
              <div className="flex gap-1.5 flex-wrap pt-1">
                {log.skills.map((skill) => (
                  <span key={skill} className="text-xs bg-stone-100 text-stone-600 rounded-md px-2 py-0.5 font-medium">
                    {skill}
                  </span>
                ))}
              </div>
            )}

            <div>
              <p className="text-[10px] font-semibold text-stone-400 uppercase tracking-wide mb-0.5 flex items-center gap-1">
                <Target className="w-3 h-3" /> Impact
              </p>
              <p className="text-sm text-brand-grey">{log.impact}</p>
            </div>

            <div>
              <p className="text-[10px] font-semibold text-stone-400 uppercase tracking-wide mb-0.5 flex items-center gap-1">
                <Mic className="w-3 h-3" /> Transcript
              </p>
              <p className="text-sm text-stone-400 italic">"{log.transcript}"</p>
            </div>

            {log.starStory && <StarStoryBadge starStory={log.starStory} />}
          </div>
        )}

        <button
          onClick={() => setExpanded((v) => !v)}
          className="flex items-center gap-1 text-xs text-stone-400 hover:text-brand-grey transition-colors pt-1"
        >
          {expanded
            ? <><ChevronUp className="w-3.5 h-3.5" /> Hide details</>
            : <><ChevronDown className="w-3.5 h-3.5" /> Show details</>
          }
        </button>
      </div>
    </div>
  );
}
