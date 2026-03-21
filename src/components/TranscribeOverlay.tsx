"use client";

interface Props {
  show: boolean;
  progress: number;
  text: string;
}

export function TranscribeOverlay({ show, progress, text }: Props) {
  return (
    <div className={`transcribe-overlay ${show ? "show" : ""}`}>
      <div className="transcribe-label">Transcribing your recording...</div>
      <div className="transcribe-bar">
        <div className="transcribe-bar-fill" style={{ width: `${Math.round(progress * 100)}%` }} />
      </div>
      <div className="transcribe-text">
        {text}
        <span className="transcribe-cursor" />
      </div>
    </div>
  );
}

export default TranscribeOverlay;
