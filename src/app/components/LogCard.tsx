// components/LogCard.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { LogEntry } from "@lib/types";
import StarStoryBadge from "./StarStoryBadge";
import { CalendarDays, Mic, Target, Zap, FileText } from "lucide-react";

interface LogCardProps {
  log: LogEntry;
}

export default function LogCard({ log }: LogCardProps) {
  const formattedDate = new Date(log.date + "T00:00:00").toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <Card className="w-full shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-slate-500 flex items-center gap-2">
            <CalendarDays className="w-4 h-4" />
            {formattedDate}
          </CardTitle>
          {log.starStory && (
            <Badge className="bg-amber-100 text-amber-700 border-amber-200 text-xs">
              ⭐ STAR Story
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Transcript */}
        <div className="flex gap-2 items-start">
          <Mic className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
          <p className="text-sm text-slate-500 italic">"{log.rawTranscript ?? log.transcript}"</p>
        </div>

        <Separator />

        {/* Task */}
        <div className="flex gap-2 items-start">
          <Target className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-0.5">
              Task
            </p>
            <p className="text-sm text-slate-700">{log.task}</p>
          </div>
        </div>

        {/* Skills */}
        <div className="flex gap-2 items-start">
          <Zap className="w-4 h-4 text-purple-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">
              Skills
            </p>
            <div className="flex flex-wrap gap-1">
              {log.skills.map((skill) => (
                <Badge key={skill} variant="secondary" className="text-xs">
                  {skill}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        {/* Impact */}
        <div className="flex gap-2 items-start">
          <Target className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-0.5">
              Impact
            </p>
            <p className="text-sm text-slate-700">{log.impact}</p>
          </div>
        </div>

        {/* Resume Bullet */}
        <div className="flex gap-2 items-start bg-slate-50 rounded-md p-2">
          <FileText className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-0.5">
              Resume Bullet
            </p>
            <p className="text-sm text-slate-700 font-medium">{log.resumeBullet}</p>
          </div>
        </div>

        {/* STAR Story */}
        {log.starStory && <StarStoryBadge starStory={log.starStory} />}
      </CardContent>
    </Card>
  );
}
