// components/VoiceRecorder.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Mic, MicOff, Send, RotateCcw, Loader2 } from "lucide-react";
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

export default function VoiceRecorder({ onLogSaved }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");
  const [supported, setSupported] = useState(true);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSupported(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let finalTranscript = "";
      for (let i = 0; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript + " ";
        }
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
        body: JSON.stringify({
          transcript,
          rawTranscript: transcript,
        }),
      });
      if (!res.ok) throw new Error("Failed to process log");
      const log: LogEntry = await res.json();
      onLogSaved(log);
      setTranscript("");
    } catch (err) {
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
      <Card className="border-red-200 bg-red-50">
        <CardContent className="pt-4 text-sm text-red-600">
          Your browser doesn't support voice recording. Please use Chrome or Edge.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-md border-slate-200">
      <CardContent className="pt-6 space-y-4">
        {/* Mic Button */}
        <div className="flex flex-col items-center gap-3">
          <button
            onClick={toggleRecording}
            className={`relative w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg
              ${isRecording
                ? "bg-red-500 hover:bg-red-600 scale-110"
                : "bg-slate-800 hover:bg-slate-700"
              }`}
          >
            {isRecording && (
              <span className="absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-60 animate-ping" />
            )}
            {isRecording ? (
              <MicOff className="w-8 h-8 text-white z-10" />
            ) : (
              <Mic className="w-8 h-8 text-white z-10" />
            )}
          </button>
          <p className="text-sm text-slate-500">
            {isRecording ? "Recording... tap to stop" : "Tap to start recording"}
          </p>
        </div>

        {/* Transcript Box */}
        <Textarea
          value={transcript}
          onChange={(e) => setTranscript(e.target.value)}
          placeholder="Your transcript will appear here... or type directly."
          className="min-h-[100px] resize-none text-sm"
        />

        {/* Error */}
        {error && <p className="text-xs text-red-500">{error}</p>}

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleReset}
            disabled={isProcessing}
            className="flex items-center gap-1"
          >
            <RotateCcw className="w-3 h-3" /> Reset
          </Button>
          <Button
            size="sm"
            onClick={handleSubmit}
            disabled={!transcript.trim() || isProcessing}
            className="flex-1 bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center gap-2"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Processing...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" /> Save Log
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
