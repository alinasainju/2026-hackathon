
export const extractionPrompt = (transcript: string, source: "voice" | "text") => `
You are an expert career coach. A student has just logged their work day via ${source === "voice" ? "voice recording" : "typed text"}.
Analyze the transcript and extract structured career data.

Also check if the transcript contains a STAR story (Situation, Task, Action, Result).
A STAR story is present if the user describes a specific challenge or situation they faced,
what they did about it, and what the outcome was.

Transcript: "${transcript}"

Respond ONLY with a valid JSON object in this exact format (no markdown, no explanation):
{
  "title": "3-5 keyword title based on the transcript",
  "task": "one sentence summary of what they worked on",
  "skills": ["skill1", "skill2", "skill3"],
  "impact": "one sentence describing the impact or outcome",
  "resumeBullet": "a strong resume bullet point starting with an action verb",
  "starStory": null
}

If a STAR story IS detected, replace null with:
{
  "situation": "the situation or challenge they faced",
  "task": "what they were responsible for",
  "action": "specific actions they took",
  "result": "the outcome or result"
}
`;

export const weeklyPrompt = (transcripts: string) => `
You are an expert career coach. Below are a week's worth of work log entries from a student.
Generate a structured weekly summary.

Logs:
${transcripts}

Respond ONLY with a valid JSON object (no markdown, no explanation):
{
  "topSkills": ["skill1", "skill2", "skill3", "skill4", "skill5"],
  "keyAccomplishments": ["accomplishment1", "accomplishment2", "accomplishment3"],
  "resumeBullets": ["bullet1", "bullet2", "bullet3"],
  "starStories": [
    {
      "situation": "the situation or challenge they faced",
      "task": "what they were responsible for",
      "action": "specific actions they took",
      "result": "the outcome or result"
    }
  ]
}

If no STAR stories are found across the week's logs, return an empty array for starStories.
A STAR story is only worth surfacing at the weekly level if it shows clear impact or
a specific challenge overcome — don't force one if the logs don't support it.
`;
