"use client";

import { useMemo, useState } from "react";
import { useRecorder } from "@/hooks/useRecorder";
import { useLogs } from "@/context/LogsContext";
import { StarStory } from "@/app/lib/types";

import TranscribeOverlay from "./TranscribeOverlay";

const pad = (n: number) => String(n).padStart(2, "0");
const fmt = (secs: number) => `${pad(Math.floor(secs / 3600))}:${pad(Math.floor((secs % 3600) / 60))}:${pad(secs % 60)}`;

export function MicRecorder() {
  const { addLog } = useLogs();
  const [memoText, setMemoText] = useState("");
  const [pendingLog, setPendingLog] = useState<PendingLog | null>(null);
  const [popupDate, setPopupDate] = useState(todayDateValue());
  const [popupTask, setPopupTask] = useState("");
  const [popupImpact, setPopupImpact] = useState("");
  const [saving, setSaving] = useState(false);

  const { isRecording, isPaused, seconds, transcribe, startRecording, stopRecording, togglePause, submitMemo } = useRecorder({
    onComplete: async (text, source) => {
      const now = new Date();
      const timeStr = now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
      try {
        const res = await fetch("/api/logs", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            transcript: text,
            rawTranscript: text,
          }),
        });

        if (!res.ok) return;

        const extracted = await res.json();
        const nextPending = {
          title: extracted.title || deriveTitle(text),
          rawTranscript: text,
          task: extracted.task || text,
          skills: Array.isArray(extracted.skills) ? extracted.skills : [],
          impact: extracted.impact || "",
          resumeBullet: extracted.resumeBullet || "",
          starStory: extracted.starStory ?? null,
          startTime: timeStr,
          endTime: timeStr,
          source,
        };

        setPendingLog(nextPending);
        setPopupDate(todayDateValue());
        setPopupTask(nextPending.task);
        setPopupImpact(nextPending.impact);
      } catch {
        // Avoid breaking the UI if the API request fails.
      }
    },
  });

  const micLabel = useMemo(() => {
    if (isRecording && !isPaused) return "Recording...";
    if (isRecording && isPaused) return "Paused";
    return "Tap to record";
  }, [isRecording, isPaused]);

  return (
    <div className="right-panel">
      <TranscribeOverlay show={transcribe.overlay} progress={transcribe.progress} text={transcribe.text} />
      <div className="mic-section">
        <div className="ripple-container">
          <div className={`ring ring-4 ${isRecording && !isPaused ? "active" : ""}`} />
          <div className={`ring ring-3 ${isRecording && !isPaused ? "active" : ""}`} />
          <div className={`ring ring-2 ${isRecording && !isPaused ? "active" : ""}`} />
          <div className={`ring ring-1 ${isRecording && !isPaused ? "active" : ""}`} />
          <button className={`mic-btn ${isPaused ? "paused" : ""}`} onClick={isRecording ? stopRecording : startRecording}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="9" y="2" width="6" height="12" rx="3" />
              <path d="M5 10a7 7 0 0014 0" />
              <line x1="12" y1="19" x2="12" y2="22" />
              <line x1="9" y1="22" x2="15" y2="22" />
            </svg>
          </button>
        </div>
        <span className="mic-idle-label">{micLabel}</span>
        <div className={`recording-info ${isRecording ? "show" : ""}`}>
          <span className="rec-label">{isPaused ? "Paused" : "Recording..."}</span>
          <span className="rec-timer">{fmt(seconds)}</span>
        </div>
        <div className={`recording-controls ${isRecording ? "show" : ""}`}>
          <div className="ctrl-group">
            <button className="ctrl-btn btn-pause" onClick={togglePause}>
              {isPaused ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="#6b6762">
                  <polygon points="5,3 19,12 5,21" />
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="#6b6762">
                  <rect x="6" y="5" width="4" height="14" rx="1" />
                  <rect x="14" y="5" width="4" height="14" rx="1" />
                </svg>
              )}
            </button>
            <span className="ctrl-label">{isPaused ? "Resume" : "Pause"}</span>
          </div>
          <div className="ctrl-group">
            <button className="ctrl-btn btn-stop" onClick={stopRecording}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                <rect x="5" y="5" width="14" height="14" rx="2" />
              </svg>
            </button>
            <span className="ctrl-label">Stop</span>
          </div>
        </div>
      </div>
      <div className="or-divider">or type a memo</div>
      <textarea
        className="memo-box"
        value={memoText}
        onChange={(e) => setMemoText(e.target.value)}
        placeholder="What did you learn or work on? (Enter to log)"
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            submitMemo(memoText);
            setMemoText("");
          }
        }}
      />

      <div className={`popup-backdrop ${pendingLog ? "show" : ""}`} onClick={closeDetailPopup} />
      <div className={`detail-popup ${pendingLog ? "show" : ""}`}>
        <div className="popup-title">New Log Entry</div>
        <div className="popup-date-row">
          <span className="popup-date-label">Date</span>
          <input className="popup-date-input" value={popupDate} onChange={(e) => setPopupDate(e.target.value)} type="date" />
        </div>
        <div className="popup-field">
          <label>What you did / learned</label>
          <div
            className="popup-field-value"
            contentEditable
            suppressContentEditableWarning
            onInput={(e) => setPopupTask((e.target as HTMLDivElement).textContent || "")}
          >
            {popupTask}
          </div>
        </div>
        <div className="popup-field">
          <label>Skills demonstrated</label>
          <div className="popup-skills">
            {pendingLog?.skills.map((skill) => (
              <span key={skill} className="skill-chip">
                {skill}
              </span>
            ))}
          </div>
        </div>
        <div className="popup-field">
          <label>Impact</label>
          <div
            className="popup-field-value"
            contentEditable
            suppressContentEditableWarning
            onInput={(e) => setPopupImpact((e.target as HTMLDivElement).textContent || "")}
          >
            {popupImpact}
          </div>
        </div>
        <div className="popup-actions">
          <button className="btn-discard" onClick={closeDetailPopup}>
            Discard
          </button>
          <button className="btn-save-log-popup" onClick={confirmSave} disabled={saving}>
            {saving ? "Saving..." : "Save Log"}
          </button>
        </div>
      </div>
    </div>
  );

  function closeDetailPopup() {
    if (saving) return;
    setPendingLog(null);
  }

  async function confirmSave() {
    if (!pendingLog) return;
    setSaving(true);
    try {
      const res = await fetch("/api/logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          saveEntry: true,
          title: pendingLog.title,
          transcript: pendingLog.rawTranscript,
          rawTranscript: pendingLog.rawTranscript,
          task: popupTask,
          skills: pendingLog.skills,
          impact: popupImpact,
          resumeBullet: pendingLog.resumeBullet,
          starStory: pendingLog.starStory,
          time: `${pendingLog.startTime} - ${pendingLog.endTime}`,
          date: popupDate,
          source: pendingLog.source,
          folder: "",
          tag: "",
          dot: "",
        }),
      });

      if (!res.ok) return;

      const saved = await res.json();
      addLog({
        id: String(saved.id),
        title: saved.title || pendingLog.title,
        time: saved.time || `${pendingLog.startTime} - ${pendingLog.endTime}`,
        date: normalizeDate(saved.date),
        rawTranscript: saved.rawTranscript ?? pendingLog.rawTranscript,
        transcript: saved.transcript,
        task: saved.task || popupTask,
        skills: Array.isArray(saved.skills) ? saved.skills : pendingLog.skills,
        impact: saved.impact || popupImpact,
        resumeBullet: saved.resumeBullet,
        starStory: saved.starStory ?? pendingLog.starStory,
        folder: saved.folder || "",
        tag: saved.tag || "",
        dot: saved.dot || "",
        source: saved.source === "text" ? "text" : pendingLog.source,
      });

      setPendingLog(null);
    } finally {
      setSaving(false);
    }
  }
}

function deriveTitle(text: string) {
  const words = text
    .replace(/[^a-zA-Z\s]/g, "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 6);
  return words.length ? words.map((w) => w[0].toUpperCase() + w.slice(1)).join(" ") : "New Log";
}

function normalizeDate(rawDate: string) {
  if (!rawDate) return new Date().toLocaleDateString("en-US");
  if (/^\d{4}-\d{2}-\d{2}$/.test(rawDate)) {
    const [year, month, day] = rawDate.split("-").map(Number);
    return new Date(year, month - 1, day).toLocaleDateString("en-US");
  }
  return rawDate;
}

function todayDateValue() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

interface PendingLog {
  title: string;
  rawTranscript: string;
  task: string;
  skills: string[];
  impact: string;
  resumeBullet: string;
  starStory: StarStory | null;
  startTime: string;
  endTime: string;
  source: "voice" | "text";
}

export default MicRecorder;
