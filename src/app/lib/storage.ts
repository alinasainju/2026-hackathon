
import fs from "fs";
import path from "path";
import { LogEntry } from "./types";

const DATA_DIR = path.join(process.cwd(), "data");
const LOGS_FILE = path.join(DATA_DIR, "logs.json");

function ensureDataFile() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(LOGS_FILE)) {
    fs.writeFileSync(LOGS_FILE, JSON.stringify([]));
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