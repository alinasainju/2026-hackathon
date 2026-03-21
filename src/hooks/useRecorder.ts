"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type SourceKind = "voice" | "text";

interface RecorderOptions {
  onComplete: (text: string, source: SourceKind) => void;
}

interface TranscribeState {
  overlay: boolean;
  progress: number; // 0-1
  text: string;
}

export function useRecorder({ onComplete }: RecorderOptions) {
  const [isRecording, setRecording] = useState(false);
  const [isPaused, setPaused] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [supportMic, setSupportMic] = useState(false);
  const [transcribe, setTranscribe] = useState<TranscribeState>({ overlay: false, progress: 0, text: "" });

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const srRef = useRef<SpeechRecognition | null>(null);
  const transcriptRef = useRef<string>("");
  const startedRef = useRef<Date | null>(null);

  // Check browser capabilities on mount
  useEffect(() => {
    if (typeof window === "undefined") return;
    const hasMic = !!navigator.mediaDevices?.getUserMedia;
    setSupportMic(hasMic);
  }, []);

  const clearTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
  };

  const resetTranscribe = () => setTranscribe({ overlay: false, progress: 0, text: "" });

  const startRecording = useCallback(async () => {
    if (isRecording) return;
    transcriptRef.current = "";
    startedRef.current = new Date();
    setSeconds(0);
    setPaused(false);

    const startTimer = () => {
      clearTimer();
      timerRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
    };

    const startSpeechRecognition = () => {
      const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!SR) return;
      const sr: SpeechRecognition = new SR();
      sr.continuous = true;
      sr.interimResults = true;
      sr.lang = "en-US";
      sr.onresult = (e: SpeechRecognitionEvent) => {
        let acc = "";
        for (let i = 0; i < e.results.length; i++) acc += e.results[i][0].transcript + " ";
        transcriptRef.current = acc.trim();
      };
      sr.onerror = () => sr.stop();
      sr.start();
      srRef.current = sr;
    };

    const begin = () => {
      setRecording(true);
      startTimer();
      startSpeechRecognition();
    };

    if (!supportMic) {
      begin();
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      mr.ondataavailable = () => undefined;
      mr.onstop = () => stream.getTracks().forEach((t) => t.stop());
      mr.start();
      mediaRecorderRef.current = mr;
      begin();
    } catch (err) {
      begin(); // fallback to simulated mode
    }
  }, [isRecording, supportMic]);

  const togglePause = useCallback(() => {
    if (!isRecording) return;
    setPaused((p) => !p);
  }, [isRecording]);

  useEffect(() => {
    if (timerRef.current) {
      if (isPaused) clearTimer();
      else timerRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPaused]);

  const stopRecording = useCallback(() => {
    if (!isRecording) return;
    setRecording(false);
    setPaused(false);
    clearTimer();
    if (srRef.current) {
      try { srRef.current.stop(); } catch (_) {}
      srRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    // Kick off fake transcription animation
    const raw = transcriptRef.current;
    const source: SourceKind = "voice";
    const text = raw || fallbackSamples[Math.floor(Math.random() * fallbackSamples.length)];
    animateTranscription(text, source);
  }, [isRecording]);

  const submitMemo = useCallback(
    (memo: string) => {
      if (!memo.trim()) return;
      const source: SourceKind = "text";
      animateTranscription(memo.trim(), source);
    },
    []
  );

  const animateTranscription = (text: string, source: SourceKind) => {
    setTranscribe({ overlay: true, progress: 0, text: "" });
    const length = text.length || 1;
    let i = 0;
    const iv = setInterval(() => {
      i += 1;
      setTranscribe((prev) => ({ overlay: true, progress: Math.min(1, i / length), text: text.slice(0, i) }));
      if (i >= length) {
        clearInterval(iv);
        setTimeout(() => {
          setTranscribe({ overlay: false, progress: 1, text });
          onComplete(text, source);
        }, 200);
      }
    }, 18);
  };

  useEffect(() => () => clearTimer(), []);

  return {
    isRecording,
    isPaused,
    seconds,
    supportMic,
    transcribe,
    startRecording,
    stopRecording,
    togglePause,
    submitMemo,
  };
}

const fallbackSamples = [
  "Studied how useEffect cleanup prevents memory leaks with async operations",
  "Reviewed how database indexing speeds up query performance on large tables",
  "Practiced explaining technical concepts to non-technical stakeholders using analogies",
  "Explored how memoization with useMemo prevents expensive recalculations on re-renders",
  "Learned structured error response patterns for REST APIs",
];
