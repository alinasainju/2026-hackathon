"use client";

import { useMemo, useState } from "react";
import { useRecorder } from "@/hooks/useRecorder";
import { useLogs } from "@/context/LogsContext";

import TranscribeOverlay from "./TranscribeOverlay";

const pad = (n: number) => String(n).padStart(2, "0");
const fmt = (secs: number) => `${pad(Math.floor(secs / 3600))}:${pad(Math.floor((secs % 3600) / 60))}:${pad(secs % 60)}`;

export function MicRecorder() {
  const { addLog } = useLogs();
  const [memoText, setMemoText] = useState("");

  const { isRecording, isPaused, seconds, transcribe, startRecording, stopRecording, togglePause, submitMemo } = useRecorder({
    onComplete: (text, source) => {
      const now = new Date();
      const timeStr = now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
      const newLog = {
        id: `log-${Date.now()}`,
        title: deriveTitle(text),
        time: `${timeStr} - ${timeStr}`,
        date: now.toLocaleDateString("en-US"),
        rawTranscript: text,
        task: text,
        skills: [],
        impact: "",
        folder: "",
        tag: "",
        dot: "",
        source,
      };
      addLog(newLog);
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
    </div>
  );
}

function deriveTitle(text: string) {
  const words = text
    .replace(/[^a-zA-Z\s]/g, "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 6);
  return words.length ? words.map((w) => w[0].toUpperCase() + w.slice(1)).join(" ") : "New Log";
}

export default MicRecorder;
