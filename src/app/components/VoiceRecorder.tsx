// components/VoiceRecorder.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Mic, StopCircle, Send, RotateCcw, Loader2 } from "lucide-react";
import { LogEntry } from "@lib/types";

interface VoiceRecorderProps {
  onLogSaved: (log: LogEntry) => void;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

function getTodayLabel() {
  return new Date().toLocaleDateString("en-US", {
    weekday: "long", month: "long", day: "numeric",
  });
}

export default function VoiceRecorder({ onLogSaved }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");
  const [supported, setSupported] = useState(true);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) { setSupported(false); return; }
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";
    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let finalTranscript = "";
      for (let i = 0; i < event.results.length; i++) {
        if (event.results[i].isFinal) finalTranscript += event.results[i][0].transcript + " ";
      }
      if (finalTranscript) setTranscript((prev) => prev + finalTranscript);
    };
    recognition.onerror = () => {
      setError("Microphone error. Please check permissions.");
      setIsRecording(false);
    };
    recognitionRef.current = recognition;
  }, []);

  const toggleRecording = () => {
    if (!recognitionRef.current) return;
    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      setError("");
      recognitionRef.current.start();
      setIsRecording(true);
    }
  };

  const handleSubmit = async () => {
    if (!transcript.trim()) return;
    setIsProcessing(true);
    setError("");
    try {
      const res = await fetch("/api/logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcript }),
      });
      if (!res.ok) throw new Error("Failed to process log");
      const log: LogEntry = await res.json();
      onLogSaved(log);
      setTranscript("");
    } catch {
      setError("Failed to save log. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    if (isRecording && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsRecording(false);
    }
    setTranscript("");
    setError("");
  };

  if (!supported) {
    return (
      <div className="rounded-xl border border-stone-200 bg-stone-50 p-5 text-sm text-stone-600">
        Your browser doesn't support voice recording. Please use Chrome or Edge.
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-stone-200 bg-white overflow-hidden">
      {/* Header */}
      <div className="px-5 pt-5 pb-5 border-b border-stone-100">
        <p className="text-xs text-brand-grey mb-1">{getTodayLabel()}</p>
        <h2 className="text-base font-semibold text-brand-black">What did you work on today?</h2>

        {/* Mic button + waveform */}
        <div className="mt-4 flex items-center gap-4">
          <button
            onClick={toggleRecording}
            className={`relative w-11 h-11 rounded-full flex items-center justify-center transition-all duration-200
              ${isRecording
                ? "bg-brand-indigo text-white shadow-sm"
                : "bg-brand-offwhite border border-stone-200 text-brand-grey hover:text-brand-black hover:border-stone-300"
              }`}
          >
            {isRecording && (
              <span className="absolute inset-0 rounded-full bg-brand-indigo animate-ping opacity-20" />
            )}
            {isRecording
              ? <StopCircle className="w-5 h-5 z-10" />
              : <Mic className="w-5 h-5 z-10" />
            }
          </button>

          <div>
            {isRecording ? (
              <div className="flex items-end gap-1 h-7 text-brand-indigo mb-1">
                {Array.from({ length: 7 }).map((_, i) => (
                  <span key={i} className="waveform-bar" />
                ))}
              </div>
            ) : (
              <div className="flex items-end gap-1 h-7 text-stone-200 mb-1">
                {Array.from({ length: 7 }).map((_, i) => (
                  <span key={i} className="waveform-bar" style={{ animation: "none", transform: "scaleY(0.25)" }} />
                ))}
              </div>
            )}
            <p className="text-xs text-brand-grey">
              {isRecording ? "Recording — tap to stop" : "Tap to start speaking"}
            </p>
          </div>
        </div>
      </div>

      {/* Transcript + actions */}
      <div className="p-5 space-y-3">
        <Textarea
          value={transcript}
          onChange={(e) => setTranscript(e.target.value)}
          placeholder="Your transcript will appear here… or type directly."
          className="min-h-[90px] resize-none text-sm bg-brand-offwhite border-stone-200 focus:bg-white transition-colors placeholder:text-stone-400"
        />
        {error && <p className="text-xs text-red-500">{error}</p>}
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleReset}
            disabled={isProcessing}
            className="flex items-center gap-1.5 text-brand-grey border-stone-200 hover:text-brand-black"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset
          </Button>
          <Button
            size="sm"
            onClick={handleSubmit}
            disabled={!transcript.trim() || isProcessing}
            className="flex-1 bg-brand-black hover:bg-brand-black/85 text-white flex items-center justify-center gap-2"
          >
            {isProcessing
              ? <><Loader2 className="w-4 h-4 animate-spin" /> Processing…</>
              : <><Send className="w-4 h-4" /> Save Log</>
            }
          </Button>
        </div>
      </div>
    </div>
  );
}
