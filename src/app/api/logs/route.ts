// app/api/logs/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getLogs, saveLog } from "@lib/storage";
import { extractionPrompt } from "@lib/prompts";
import { LogEntry } from "@lib/types";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

export async function GET() {
  try {
    const logs = getLogs();
    return NextResponse.json(logs);
  } catch (error) {
    console.error("Error fetching logs:", error);
    return NextResponse.json({ error: "Failed to fetch logs" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { transcript, rawTranscript } = await req.json();

    if (!transcript || transcript.trim() === "") {
      return NextResponse.json({ error: "Transcript is required" }, { status: 400 });
    }

    // Send transcript to Claude for structured extraction
    const message = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: extractionPrompt(transcript),
        },
      ],
    });

    // Parse the AI response
    const rawText = message.content[0].type === "text" ? message.content[0].text : "";
    const extracted = JSON.parse(rawText);

    // Build the log entry
    const entry: LogEntry = {
      id: crypto.randomUUID(),
      date: new Date().toISOString().split("T")[0], // YYYY-MM-DD
      transcript,
      rawTranscript: rawTranscript ?? transcript,
      task: extracted.task,
      skills: extracted.skills,
      impact: extracted.impact,
      resumeBullet: extracted.resumeBullet,
      starStory: extracted.starStory ?? null,
    };

    saveLog(entry);

    return NextResponse.json(entry, { status: 201 });
  } catch (error) {
    console.error("Error processing log:", error);
    return NextResponse.json({ error: "Failed to process log" }, { status: 500 });
  }
}
