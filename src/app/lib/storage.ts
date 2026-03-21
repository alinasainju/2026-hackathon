
import fs from "fs";
import path from "path";
import { LogEntry, WeeklySummary } from "./types";

const DATA_DIR = path.join(process.cwd(), "data");
const LOGS_FILE = path.join(DATA_DIR, "logs.json");
const WEEKLY_SUMMARIES_FILE = path.join(DATA_DIR, "weekly-summaries.json");

function ensureDataFile() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(LOGS_FILE)) {
    fs.writeFileSync(LOGS_FILE, JSON.stringify([]));
  }
}

function ensureWeeklySummariesFile() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(WEEKLY_SUMMARIES_FILE)) {
    fs.writeFileSync(WEEKLY_SUMMARIES_FILE, JSON.stringify([]));
  }
}

export function getLogs(): LogEntry[] {
  ensureDataFile();
  const raw = fs.readFileSync(LOGS_FILE, "utf-8");
  return JSON.parse(raw) as LogEntry[];
}

export function saveLog(entry: LogEntry): void {
  ensureDataFile();
  const logs = getLogs();
  logs.unshift(entry); // newest first
  fs.writeFileSync(LOGS_FILE, JSON.stringify(logs, null, 2));
}

export function getLogsByDateRange(startDate: string, endDate: string): LogEntry[] {
  const logs = getLogs();
  return logs.filter((log) => log.date >= startDate && log.date <= endDate);
}

export function getWeeklySummaries(): WeeklySummary[] {
  ensureWeeklySummariesFile();
  const raw = fs.readFileSync(WEEKLY_SUMMARIES_FILE, "utf-8");
  return JSON.parse(raw) as WeeklySummary[];
}

export function saveWeeklySummary(summary: WeeklySummary): void {
  ensureWeeklySummariesFile();
  const summaries = getWeeklySummaries();
  const existingIndex = summaries.findIndex((s) => s.weekOf === summary.weekOf);
  if (existingIndex >= 0) {
    summaries[existingIndex] = summary;
  } else {
    summaries.push(summary);
  }
  // Sort by weekOf descending (newest first)
  summaries.sort((a, b) => b.weekOf.localeCompare(a.weekOf));
  fs.writeFileSync(WEEKLY_SUMMARIES_FILE, JSON.stringify(summaries, null, 2));
}

/** Returns the Monday (YYYY-MM-DD) of the week containing the given date string */
export function getMondayOfWeek(dateStr: string): string {
  const date = new Date(dateStr + "T00:00:00");
  const day = date.getDay(); // 0=Sun, 1=Mon, ...
  const diff = day === 0 ? -6 : 1 - day;
  date.setDate(date.getDate() + diff);
  return date.toISOString().split("T")[0];
}

/** Returns the Sunday (YYYY-MM-DD) of the week starting on the given Monday */
export function getSundayOfWeek(mondayStr: string): string {
  const date = new Date(mondayStr + "T00:00:00");
  date.setDate(date.getDate() + 6);
  return date.toISOString().split("T")[0];
}

/**
 * Returns all Mon-Sun week ranges from the Monday of the earliest log
 * up to and including the last fully elapsed week (last Sunday before today).
 */
export function getElapsedWeekRanges(): Array<{ startDate: string; endDate: string }> {
  const logs = getLogs();
  if (logs.length === 0) return [];

  const dates = logs.map((l) => l.date).sort();
  const earliestMonday = getMondayOfWeek(dates[0]);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const ranges: Array<{ startDate: string; endDate: string }> = [];
  const cursor = new Date(earliestMonday + "T00:00:00");

  while (true) {
    const monday = cursor.toISOString().split("T")[0];
    const sundayDate = new Date(cursor);
    sundayDate.setDate(cursor.getDate() + 6);
    const sunday = sundayDate.toISOString().split("T")[0];

    // Only include weeks that have fully elapsed (Sunday is before today)
    if (sundayDate < today) {
      ranges.push({ startDate: monday, endDate: sunday });
    } else {
      break;
    }

    cursor.setDate(cursor.getDate() + 7);
  }

  return ranges;
}