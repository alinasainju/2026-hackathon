"use client";

import React, { createContext, useContext, useMemo, useState } from "react";

export type SourceKind = "voice" | "text";

export interface FolderDef {
  key: string;
  name: string;
  icon: string;
  tag: string;
  dot: string;
  grad: string;
}

export interface LogItem {
  id: string;
  title: string;
  time: string;
  date: string; // locale string "M/D/YYYY"
  rawTranscript: string;
  task: string;
  skills: string[];
  impact: string;
  folder: string;
  tag: string;
  dot: string;
  source: SourceKind;
}

export interface LogsContextValue {
  folders: FolderDef[];
  allLogs: LogItem[];
  setAllLogs: (fn: (prev: LogItem[]) => LogItem[]) => void;
  addLog: (log: LogItem) => void;
  updateLog: (id: string, partial: Partial<LogItem>) => void;
  deleteLog: (id: string) => void;
  addFolder: (folder: FolderDef) => void;
}

const LogsContext = createContext<LogsContextValue | null>(null);

const initialFolders: FolderDef[] = [
  { key: "classes", name: "Classes", icon: "📚", tag: "tag-classes", dot: "dot-classes", grad: "linear-gradient(135deg,#f5d5b8,#edc49a)" },
  { key: "internship", name: "Internship Learnings", icon: "💼", tag: "tag-internship", dot: "dot-internship", grad: "linear-gradient(135deg,#c2dff5,#a8cfe8)" },
  { key: "personal", name: "Personal Projects", icon: "🌱", tag: "tag-personal", dot: "dot-personal", grad: "linear-gradient(135deg,#c2e8cc,#a6d8b4)" },
];

const today = new Date();
const fmtDate = (d: Date) => d.toLocaleDateString("en-US");

const seedLogs: LogItem[] = [
  {
    id: "l1",
    title: "API versioning patterns",
    time: "10:02 AM - 11:00 AM",
    date: fmtDate(today),
    rawTranscript:
      "So I was reading about API design today and spent time understanding why you would version your API -- like if you have v1 and v2, you can introduce breaking changes without killing existing clients.",
    task: "Learned how REST API versioning works and why breaking changes require a new version path",
    skills: ["API Design", "System Architecture"],
    impact: "Avoided breaking client integrations in production",
    folder: "",
    tag: "",
    dot: "",
    source: "voice",
  },
  {
    id: "l2",
    title: "PR review feedback loop",
    time: "11:32 AM - 12:15 PM",
    date: fmtDate(today),
    rawTranscript:
      "Did a code review today and noticed my comments kept being misunderstood -- people were not sure if I was blocking the PR or just suggesting.",
    task: "Studied code review patterns -- what makes feedback actionable vs vague",
    skills: ["Code Review", "Communication"],
    impact: "Reduced back-and-forth on review cycles",
    folder: "",
    tag: "",
    dot: "",
    source: "text",
  },
  {
    id: "l3",
    title: "Q4 stakeholder proposal",
    time: "1:04 PM - 2:30 PM",
    date: fmtDate(today),
    rawTranscript:
      "Worked on a Q4 proposal today for the new dashboard feature. Tried a different structure this time -- led with the business impact first, then the technical approach.",
    task: "Practiced structuring proposals for non-technical stakeholders",
    skills: ["Communication", "Presentation"],
    impact: "Proposal approved with no revisions requested",
    folder: "",
    tag: "",
    dot: "",
    source: "voice",
  },
];

export function LogsProvider({ children }: { children: React.ReactNode }) {
  const [folders, setFolders] = useState<FolderDef[]>(initialFolders);
  const [allLogs, setAllLogs] = useState<LogItem[]>(seedLogs);

  const addLog = (log: LogItem) => setAllLogs((prev) => [...prev, log]);
  const updateLog = (id: string, partial: Partial<LogItem>) =>
    setAllLogs((prev) => prev.map((l) => (l.id === id ? { ...l, ...partial } : l)));
  const deleteLog = (id: string) => setAllLogs((prev) => prev.filter((l) => l.id !== id));
  const addFolder = (folder: FolderDef) => setFolders((prev) => [...prev, folder]);

  const value = useMemo(
    () => ({ folders, allLogs, setAllLogs, addLog, updateLog, deleteLog, addFolder }),
    [folders, allLogs]
  );

  return <LogsContext.Provider value={value}>{children}</LogsContext.Provider>;
}

export function useLogs() {
  const ctx = useContext(LogsContext);
  if (!ctx) throw new Error("useLogs must be used inside LogsProvider");
  return ctx;
}
