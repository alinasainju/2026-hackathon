// app/api/weekly-summaries/route.ts
import { NextResponse } from "next/server";
import {
  getElapsedWeekRanges,
  getLogsByDateRange,
  getWeeklySummaries,
  saveWeeklySummary,
} from "@lib/storage";
import { weeklyPrompt } from "@lib/prompts";
import { WeeklySummary } from "@lib/types";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

export async function GET() {
  try {
    const elapsedWeeks = getElapsedWeekRanges();
    if (elapsedWeeks.length === 0) {
      return NextResponse.json([]);
    }

    const cached = getWeeklySummaries();
    const cachedByWeek = new Map(cached.map((s) => [s.weekOf, s]));

    // Generate summaries for any elapsed weeks that have logs but no cached summary
    for (const { startDate, endDate } of elapsedWeeks) {
      if (cachedByWeek.has(startDate)) continue;

      const logs = getLogsByDateRange(startDate, endDate);
      if (logs.length === 0) continue;

      const formattedLogs = logs
        .map(
          (log, i) => `
--- Entry ${i + 1} (${log.date}) ---
Transcript: ${log.transcript}
Task: ${log.task}
Skills: ${log.skills.join(", ")}
Impact: ${log.impact}
Resume Bullet: ${log.resumeBullet}
${log.starStory ? `STAR Story Detected: Situation - ${log.starStory.situation} | Task - ${log.starStory.task} | Action - ${log.starStory.action} | Result - ${log.starStory.result}` : ""}
`.trim()
        )
        .join("\n\n");

      const message = await client.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1024,
        messages: [{ role: "user", content: weeklyPrompt(formattedLogs) }],
      });

      const rawText = message.content[0].type === "text" ? message.content[0].text : "";
      const extracted = JSON.parse(rawText);

      const summary: WeeklySummary = {
        weekOf: startDate,
        topSkills: extracted.topSkills,
        keyAccomplishments: extracted.keyAccomplishments,
        resumeBullets: extracted.resumeBullets,
        starStories: extracted.starStories ?? [],
        generatedAt: new Date().toISOString(),
      };

      saveWeeklySummary(summary);
      cachedByWeek.set(startDate, summary);
    }

    // Return all summaries sorted newest first
    const all = Array.from(cachedByWeek.values()).sort((a, b) =>
      b.weekOf.localeCompare(a.weekOf)
    );

    return NextResponse.json(all);
  } catch (error) {
    console.error("Error generating weekly summaries:", error);
    return NextResponse.json({ error: "Failed to generate weekly summaries" }, { status: 500 });
  }
}
