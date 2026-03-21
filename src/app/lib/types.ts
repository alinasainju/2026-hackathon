
export interface StarStory {
  situation: string;
  task: string;
  action: string;
  result: string;
}

export interface LogEntry {
  id: string;
  date: string;
  transcript: string;
  task: string;
  skills: string[];
  impact: string;
  resumeBullet: string;
  starStory: StarStory | null;
}

export interface WeeklySummary {
  weekOf: string;
  topSkills: string[];
  keyAccomplishments: string[];
  resumeBullets: string[];
  starStories: StarStory[];
  generatedAt: string;
}