"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { StarStory } from "@/app/lib/types";

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
  transcript?: string;
  task: string;
  skills: string[];
  impact: string;
  resumeBullet?: string;
  starStory?: StarStory | null;
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
  { key: "classes", name: "Class", icon: "📚", tag: "tag-classes", dot: "dot-classes", grad: "linear-gradient(135deg,#f5d5b8,#edc49a)" },
  { key: "internship", name: "Internship", icon: "💼", tag: "tag-internship", dot: "dot-internship", grad: "linear-gradient(135deg,#c2dff5,#a8cfe8)" },
  { key: "personal", name: "Personal Projects", icon: "🌱", tag: "tag-personal", dot: "dot-personal", grad: "linear-gradient(135deg,#c2e8cc,#a6d8b4)" },
];

const today = new Date();
const fmtDate = (d: Date) => d.toLocaleDateString("en-US");

export function LogsProvider({ children }: { children: React.ReactNode }) {
  const [folders, setFolders] = useState<FolderDef[]>(initialFolders);
  const [allLogs, setAllLogs] = useState<LogItem[]>([]);

  useEffect(() => {
    let active = true;

    const loadLogs = async () => {
      try {
        const res = await fetch("/api/logs", { cache: "no-store" });
        if (!res.ok) return;
        const data = await res.json();
        if (!active || !Array.isArray(data)) return;
        setAllLogs(data.map(mapApiLogToLogItem));
      } catch {
        // Keep empty state if persisted logs cannot be loaded.
      }
    };

    loadLogs();

    return () => {
      active = false;
    };
  }, []);

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

function mapApiLogToLogItem(log: any): LogItem {
  const rawDate = typeof log.date === "string" ? log.date : "";
  const localeDate = /^\d{4}-\d{2}-\d{2}$/.test(rawDate)
    ? (() => {
        const [year, month, day] = rawDate.split("-").map(Number);
        return fmtDate(new Date(year, month - 1, day));
      })()
    : rawDate || fmtDate(today);

  const transcript = log.rawTranscript ?? log.transcript ?? "";

  return {
    id: String(log.id),
    title: log.title || deriveTitle(transcript || log.task || "New Log"),
    time: log.time || "",
    date: localeDate,
    rawTranscript: transcript,
    transcript: log.transcript,
    task: log.task || "",
    skills: Array.isArray(log.skills) ? log.skills : [],
    impact: log.impact || "",
    resumeBullet: log.resumeBullet,
    starStory: log.starStory ?? null,
    folder: log.folder || "",
    tag: log.tag || "",
    dot: log.dot || "",
    source: log.source === "text" ? "text" : "voice",
  };
}

function deriveTitle(text: string) {
  const words = text
    .replace(/[^a-zA-Z\s]/g, "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 6);
  return words.length ? words.map((w) => w[0].toUpperCase() + w.slice(1)).join(" ") : "New Log";
}
