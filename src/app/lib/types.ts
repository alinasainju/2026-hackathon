
export interface StarStory {
  situation: string;
  task: string;
  action: string;
  result: string;
}

export interface LogEntry {
  id: string;
  date: string;
  title?: string;
  time?: string;
  transcript: string;
  rawTranscript?: string;
  task: string;
  skills: string[];
  impact: string;
  resumeBullet: string;
  starStory: StarStory | null;
  folder?: string;
  tag?: string;
  dot?: string;
  source?: "voice" | "text";
}

export interface WeeklySummary {
  weekOf: string;
  topSkills: string[];
  keyAccomplishments: string[];
  resumeBullets: string[];
  starStories: StarStory[];
  generatedAt: string;
}
