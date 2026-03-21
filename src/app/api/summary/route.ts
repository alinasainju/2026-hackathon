// app/api/summary/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getLogsByDateRange } from "@lib/storage";
import { weeklyPrompt } from "@lib/prompts";
import { WeeklySummary } from "@lib/types";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

export async function POST(req: NextRequest) {
  try {
    const { startDate, endDate } = await req.json();

    if (!startDate || !endDate) {
      return NextResponse.json({ error: "startDate and endDate are required" }, { status: 400 });
    }

    const logs = getLogsByDateRange(startDate, endDate);

    if (logs.length === 0) {
      return NextResponse.json({ error: "No logs found for this date range" }, { status: 404 });
    }

    // Format logs for the prompt
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

    // Send to Claude for weekly summary
    const message = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: weeklyPrompt(formattedLogs),
        },
      ],
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

    return NextResponse.json(summary);
  } catch (error) {
    console.error("Error generating summary:", error);
    return NextResponse.json({ error: "Failed to generate summary" }, { status: 500 });
  }
}