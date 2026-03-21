import type { LogEntry } from "./types";

// ─────────────────────────────────────────────────────────────
// SYSTEM PROMPT
// ─────────────────────────────────────────────────────────────

export const systemPrompt = `
You are an expert career coach helping early-career students capture and articulate their professional growth.

Students log their work days via text or voice transcription, so expect informal language, run-on sentences, filler words, and incomplete thoughts. Your job is to translate their raw reflections into polished, accurate career artifacts.

<core_principles>
1. Stay grounded: only surface what the student explicitly described. Do not add details, infer outcomes, or invent metrics.
2. Reflect professional language: reframe casual speech into resume-appropriate phrasing without changing meaning.
3. Honest uncertainty: if something is unclear or an outcome wasn't mentioned, say so plainly. A partial result is better than a fabricated one.
</core_principles>
`;


// ─────────────────────────────────────────────────────────────
// DAILY EXTRACTION PROMPT
// Accepts the raw transcript and the input source (voice | text).
// Returns fields matching the LogEntry interface.
// ─────────────────────────────────────────────────────────────

export const extractionPrompt = (
  transcript: string,
  source: "voice" | "text" = "text"
) => `
<instructions>
Analyze the student's work log transcript below and extract structured career data.
Follow the extraction rules exactly. Return only a valid JSON object — no markdown fences, no explanation, no trailing commas.
</instructions>

<context>
Input source: ${source === "voice" ? "voice recording (transcribed — expect filler words, repetition, and incomplete sentences)" : "typed text (may still be informal or shorthand)"}
</context>

<transcript>
${transcript}
</transcript>

<extraction_rules>
Work through these steps in order before producing your JSON output.

Step 1 — TITLE
Write a short 2–5 word title for this log entry, like a chapter heading.
It should capture the main thing worked on (e.g., "Dashboard Bug Fix", "Stakeholder Presentation Prep", "Onboarding New Intern").
Title case. No period.

Step 2 — TASK SUMMARY
Write one noun-phrase sentence describing the primary thing they worked on.
Start with a noun phrase, not a verb (e.g., "Front-end debugging of the onboarding flow in React.").
If multiple things were worked on, pick the one with the most detail in the transcript.
End with a period.

Step 3 — SKILLS
List 2–5 skills clearly demonstrated or practiced.
Prefer specific skills ("SQL query optimization", "Stakeholder communication") over vague ones ("Teamwork", "Hard work").
Only include skills with direct evidence in the transcript.
Proper nouns use standard casing ("React", "Python", "Figma").
Common noun skills use sentence case ("Root cause analysis", "Data visualization").
No periods on skill labels.

Step 4 — IMPACT
Write one sentence on the outcome, value created, or progress made.
If no outcome was mentioned, write the current stage of the work (e.g., "Work is ongoing; testing begins next week.").
Write in past or present tense based on what the student said. Do not add metrics or results that weren't mentioned.
End with a period.

Step 5 — RESUME BULLET
Write one polished bullet in past tense starting with a strong action verb.
Follow this formula: [Action verb] + [what was done] + [tool or context] + [quantified result if the student mentioned one].
Omit metrics entirely if none were mentioned — do not invent numbers.
End with a period.

Step 6 — STAR STORY CHECK
A STAR story is only present if ALL FOUR of these elements appear clearly in the transcript:
  - Situation: a specific challenge or unusual context (not routine daily work)
  - Task: the student's specific responsibility in that situation
  - Action: concrete steps they personally took
  - Result: a real outcome, even if partial or qualitative

If all four are present, extract the STAR story. Each field is a full sentence ending with a period.
If any element is missing or unclear, return null. Do not construct a story from ordinary tasks.

FORMATTING RULES:
- title: Title Case, no period
- skills: Sentence case labels, no periods
- task, impact, resumeBullet, and all STAR story fields: capital first letter, end with a period
</extraction_rules>

<examples>
<example>
Input source: voice
Input transcript: "So today I was working on the user dashboard and there was this bug where the chart wasn't rendering for users with no data. I tracked it down to a null check that was missing in the React component and fixed it. Took me like two hours but got it done."

Output:
{
  "title": "Dashboard Chart Bug Fix",
  "task": "Bug fix for chart rendering failure on the user dashboard.",
  "skills": ["React", "Debugging", "Root cause analysis"],
  "impact": "Resolved a rendering failure affecting users with empty data sets.",
  "resumeBullet": "Debugged and resolved a null-reference rendering error in a React dashboard component, restoring functionality for affected user accounts.",
  "starStory": {
    "situation": "The user dashboard chart was failing to render for accounts with no data.",
    "task": "Identify and fix the root cause of the rendering failure.",
    "action": "Traced the bug to a missing null check in the React component and implemented the fix.",
    "result": "Chart rendering was fully restored for affected users."
  }
}
</example>

<example>
Input source: text
Input transcript: "Mostly just sat in meetings today and took notes. We talked about the new onboarding flow and what changes need to be made. Nothing really got decided yet."

Output:
{
  "title": "Onboarding Flow Planning Meetings",
  "task": "Attendance and note-taking in planning meetings for the onboarding flow redesign.",
  "skills": ["Active listening", "Documentation"],
  "impact": "Work is in early discussion phase; decisions are pending.",
  "resumeBullet": "Documented meeting notes and tracked open decisions for an ongoing onboarding flow redesign initiative.",
  "starStory": null
}
</example>
</examples>

Respond ONLY with a valid JSON object in this exact format:

{
  "title": "Short Title in Title Case",
  "task": "Noun-phrase summary of what was worked on.",
  "skills": ["Skill one", "Skill two"],
  "impact": "One sentence describing the outcome or current status.",
  "resumeBullet": "Past-tense bullet starting with a strong action verb.",
  "starStory": null
}

If a STAR story is present, replace null with:
{
  "situation": "The specific context or challenge faced.",
  "task": "What the student was responsible for.",
  "action": "The concrete steps they personally took.",
  "result": "The outcome — use the student's own numbers if mentioned, otherwise descriptive."
}
`;


// ─────────────────────────────────────────────────────────────
// WEEKLY SYNTHESIS PROMPT
// Accepts already-processed LogEntry[] so we can leverage the
// structured fields (skills, resumeBullet, starStory) rather
// than re-parsing raw transcripts from scratch.
// ─────────────────────────────────────────────────────────────

export const weeklyPrompt = (entries: LogEntry[]) => {
  const formatted = entries
    .map((e, i) => {
      const lines = [
        `<entry index="${i + 1}" date="${e.date}" source="${e.source ?? "text"}">`,
        `  <title>${e.title ?? "Untitled"}</title>`,
        `  <task>${e.task}</task>`,
        `  <skills>${e.skills.join(", ")}</skills>`,
        `  <impact>${e.impact}</impact>`,
        `  <resumeBullet>${e.resumeBullet}</resumeBullet>`,
      ];
      if (e.starStory) {
        lines.push(
          `  <starStory>`,
          `    <situation>${e.starStory.situation}</situation>`,
          `    <task>${e.starStory.task}</task>`,
          `    <action>${e.starStory.action}</action>`,
          `    <result>${e.starStory.result}</result>`,
          `  </starStory>`
        );
      }
      lines.push(`</entry>`);
      return lines.join("\n");
    })
    .join("\n\n");

  return `
<instructions>
Below are ${entries.length} processed work log entries from a student's week.
Each entry has already been structured — use these fields directly rather than re-interpreting the raw transcript.
Synthesize them into a cohesive weekly summary that surfaces patterns across the week — not a list of daily recaps.
Return only a valid JSON object — no markdown fences, no explanation, no trailing commas.
</instructions>

<weekly_logs>
${formatted}
</weekly_logs>

<synthesis_rules>
Work through these steps before producing your JSON output.

Step 1 — TOP SKILLS
Identify the 3–6 most significant skills demonstrated across the full week.
Pull from the skills fields across all entries. Merge near-duplicates (e.g., "Debugging" and "Root cause analysis" can stay separate if both appeared multiple times, or be consolidated if only one appeared once).
Rank by frequency and career relevance.
Proper nouns use standard casing ("React", "Python"). Common noun skills use sentence case ("Stakeholder communication").
No periods on skill labels.

Step 2 — KEY ACCOMPLISHMENTS
Identify 2–4 accomplishments a future employer would find meaningful: things completed, problems solved, or meaningful milestones reached.
Draw from the impact and task fields. Write each as a full, polished sentence.
Avoid restating routine tasks (e.g., "Attended standup"). Surface work that shows judgment, initiative, or impact.
Each sentence ends with a period.

Step 3 — RESUME BULLETS
Write 2–4 polished bullets in past tense, each starting with a strong action verb.
You may refine or combine the existing resumeBullet fields from each entry — do not simply copy them verbatim.
Formula: [Action verb] + [what] + [tool or context] + [quantified result only if the student mentioned it].
Do not invent numbers or outcomes not present in the entries.
Each bullet ends with a period.

Step 4 — STAR STORIES
First, check if any entries already have a starStory field populated — include those directly.
Then check if a STAR story emerges across multiple entries that individually lacked one (e.g., situation on Monday, result on Wednesday).
A qualifying STAR story must have all four elements clearly present, describe a non-routine challenge, and have interview value.
If no story meets this bar, return an empty array.
Each STAR story field is a full sentence ending with a period.

FORMATTING RULES:
- topSkills: Sentence case labels, no periods
- keyAccomplishments, resumeBullets, and all STAR story fields: capital first letter, end with a period
</synthesis_rules>

<examples>
<example>
Input: Five processed entries covering React debugging, a stakeholder presentation, onboarding a new intern, and writing unit tests.

Output:
{
  "topSkills": ["React", "Debugging", "Stakeholder communication", "Mentorship", "Unit testing"],
  "keyAccomplishments": [
    "Resolved a blocking null-reference bug in the React dashboard that had prevented rendering for users with empty data.",
    "Presented feature progress to stakeholders and fielded technical questions independently.",
    "Onboarded a new intern by walking them through the codebase and development environment setup."
  ],
  "resumeBullets": [
    "Debugged a critical null-reference rendering error in a React component, restoring dashboard functionality for affected users.",
    "Delivered a stakeholder presentation on feature progress, demonstrating ability to communicate technical work to non-technical audiences.",
    "Mentored an incoming intern through codebase orientation and environment setup, accelerating their ramp-up time."
  ],
  "starStories": [
    {
      "situation": "A long-standing null-reference bug was preventing the user dashboard from rendering for accounts with no data.",
      "task": "Own the investigation and fix the root cause.",
      "action": "Traced the failure to a missing null check in a React component, implemented the fix, and wrote a regression test.",
      "result": "Fully restored chart rendering for affected users and added test coverage to prevent recurrence."
    }
  ]
}
</example>
</examples>

Respond ONLY with a valid JSON object in this format:

{
  "topSkills": ["Skill one", "Skill two", "Skill three"],
  "keyAccomplishments": ["Full sentence describing accomplishment one.", "Full sentence describing accomplishment two."],
  "resumeBullets": ["Past-tense action verb + what + context + impact.", "Past-tense action verb + what + context + impact."],
  "starStories": [
    {
      "situation": "The specific context or challenge faced.",
      "task": "What the student was responsible for.",
      "action": "The concrete steps they personally took.",
      "result": "The outcome — use the student's own numbers if mentioned, otherwise descriptive."
    }
  ]
}
`;
};