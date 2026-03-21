// app/page.tsx
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Mic, BarChart2, Star, FileText } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center px-4">
      {/* Hero */}
      <div className="max-w-2xl text-center space-y-6">
        <div className="inline-flex items-center gap-2 bg-slate-800 border border-slate-700 rounded-full px-4 py-1.5 text-xs text-slate-400 mb-2">
          <Mic className="w-3 h-3 text-emerald-400" />
          AI-Powered Career Memory
        </div>

        <h1 className="text-5xl font-bold tracking-tight leading-tight">
          Never forget what you{" "}
          <span className="text-emerald-400">accomplished</span>
        </h1>

        <p className="text-slate-400 text-lg leading-relaxed">
          Speak for 30 seconds about your day. We'll turn it into structured
          career artifacts — tasks, skills, resume bullets, and STAR stories.
        </p>

        <div className="flex gap-3 justify-center">
          <Link href="/dashboard">
            <Button className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold px-6">
              Start Logging
            </Button>
          </Link>
          <Link href="/summary">
            <Button variant="outline" className="border-slate-700 text-slate-300 hover:bg-slate-800 px-6">
              View Summary
            </Button>
          </Link>
        </div>
      </div>

      {/* Feature Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16 max-w-3xl w-full">
        {[
          { icon: Mic, label: "Voice Logging", desc: "Speak your day naturally", color: "text-emerald-400" },
          { icon: Star, label: "STAR Stories", desc: "Auto-detected from your logs", color: "text-amber-400" },
          { icon: FileText, label: "Resume Bullets", desc: "Ready to copy-paste", color: "text-blue-400" },
          { icon: BarChart2, label: "Weekly Summary", desc: "Skills & accomplishments", color: "text-purple-400" },
        ].map(({ icon: Icon, label, desc, color }) => (
          <div
            key={label}
            className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2"
          >
            <Icon className={`w-5 h-5 ${color}`} />
            <p className="text-sm font-semibold">{label}</p>
            <p className="text-xs text-slate-500">{desc}</p>
          </div>
        ))}
      </div>
    </main>
  );
}