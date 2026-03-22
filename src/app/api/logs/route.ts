// app/api/logs/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getLogs, saveLog } from "@lib/storage";
import { extractionPrompt } from "@lib/prompts";
import { LogEntry, StarStory } from "@lib/types";
import Anthropic from "@anthropic-ai/sdk";

const client = process.env.ANTHROPIC_API_KEY ? new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY }) : null;

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
    const body = await req.json();
    const {
      transcript,
      rawTranscript,
      time,
      source,
      folder,
      tag,
      dot,
      saveEntry,
      title,
      task,
      skills,
      impact,
      date,
      resumeBullet,
      starStory,
    } = body;

    if (saveEntry) {
      if (!rawTranscript || !task) {
        return NextResponse.json({ error: "rawTranscript and task are required" }, { status: 400 });
      }

      const entry: LogEntry = {
        id: crypto.randomUUID(),
        date: date || new Date().toISOString().split("T")[0],
        title,
        time,
        transcript: transcript ?? rawTranscript,
        rawTranscript,
        task,
        skills: Array.isArray(skills) ? skills : [],
        impact: impact || "",
        resumeBullet: resumeBullet || buildResumeBullet(title || task, impact || ""),
        starStory: starStory ?? null,
        folder: folder ?? "",
        tag: tag ?? "",
        dot: dot ?? "",
        source: source === "text" ? "text" : "voice",
      };

      saveLog(entry);
      return NextResponse.json(entry, { status: 201 });
    }

    if (!transcript || transcript.trim() === "") {
      return NextResponse.json({ error: "Transcript is required" }, { status: 400 });
    }

    const extracted = client
      ? await extractWithClaude(transcript, source === "text" ? "text" : "voice")
      : extractFallback(transcript);
    return NextResponse.json(extracted);
  } catch (error) {
    console.error("Error processing log:", error);
    return NextResponse.json({ error: "Failed to process log" }, { status: 500 });
  }
}

async function extractWithClaude(transcript: string, source: "voice" | "text") {
  if (!client) return extractFallback(transcript);

  const message = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1024,
    messages: [
      {
        role: "user",
        content: extractionPrompt(transcript, source),
      },
    ],
  });

  const rawText = message.content[0].type === "text" ? message.content[0].text : "";
  return JSON.parse(rawText);
}

function extractFallback(transcript: string) {
  const task = summarizeTask(transcript);
  const title = keywordTitle(task !== "Captured work from the log." ? task : transcript);
  const skills = inferSkills(transcript);
  const impact = inferImpact(transcript, task);
  const story = inferStarStory(transcript);

  return {
    title,
    task,
    skills,
    impact,
    resumeBullet: buildResumeBullet(title, impact),
    starStory: story,
  };
}

function keywordTitle(text: string) {
  const stop = new Set([
    "the", "a", "an", "and", "or", "but", "in", "on", "at", "to",
    "for", "of", "with", "how", "why", "what", "that", "this", "is", "are",
    "was", "were", "i", "my", "we", "our", "from", "by", "it", "as",
    "worked", "working", "learned", "documented", "captured", "related",
    "what", "did", "primary", "task", "summary",
  ]);

  const words = text
    .replace(/[^a-z\s]/gi, "")
    .toLowerCase()
    .split(/\s+/)
    .filter((word) => word.length > 2 && !stop.has(word));

  return [...new Set(words)]
    .slice(0, 5)
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(" ") || "New Log";
}

function inferSkills(transcript: string) {
  const lower = transcript.toLowerCase();
  const matches: string[] = [];

  if (lower.includes("api")) matches.push("API Design");
  if (lower.includes("react")) matches.push("React");
  if (lower.includes("review")) matches.push("Code Review");
  if (lower.includes("stakeholder") || lower.includes("proposal")) matches.push("Communication");
  if (lower.includes("sql") || lower.includes("query")) matches.push("SQL");
  if (lower.includes("performance")) matches.push("Performance");

  return matches.length > 0 ? matches : ["Problem Solving"];
}

function inferImpact(transcript: string, task: string) {
  const sentences = transcript
    .split(/[.!?]/)
    .map((part) => part.trim())
    .filter(Boolean);

  const outcomeVerbs =
    /approved|merged|fixed|reduced|improved|sped up|resolved|completed|launched|shipped|identified|restored|documented|presented|implemented|secured|influenced|added|tested|refactored|wrote/;
  const weakPersonal =
    /felt|nervous|awesome|glad|happy|impressed|called my|my dad|palms sweating|humbling|helpful|good|great/;

  const best = sentences
    .map((sentence) => {
      let score = 0;
      if (outcomeVerbs.test(sentence)) score += 3;
      if (/\b(team|manager|customer|users|production|roadmap|pr|feature|page|system|export|bug|tests?)\b/i.test(sentence)) score += 2;
      if (/\b(by end of day|under \d|%|same day|next quarter|q[1-4]|weekly wins)\b/i.test(sentence)) score += 1;
      if (weakPersonal.test(sentence)) score -= 2;
      return { sentence, score };
    })
    .sort((a, b) => b.score - a.score)[0];

  if (best && best.score > 0) {
    return ensureSentence(best.sentence);
  }

  if (/approved|merged|fixed|reduced|improved|sped up|resolved|completed|launched|shipped|identified/i.test(transcript)) {
    return `Created a concrete outcome related to ${stripPeriod(task).toLowerCase()}.`;
  }

  return `Made progress on ${stripPeriod(task).toLowerCase()} and documented the result for future use.`;
}

function inferStarStory(transcript: string): StarStory | null {
  if (transcript.length < 120) return null;

  return {
    situation: "You were working through a specific challenge described in the log.",
    task: transcript.length > 100 ? `${transcript.slice(0, 100).trim()}...` : transcript.trim(),
    action: "You documented the steps you took to address the problem and move the work forward.",
    result: inferImpact(transcript),
  };
}

function buildResumeBullet(title: string, impact: string) {
  return `Delivered ${title.toLowerCase()} and drove the outcome that ${stripPeriod(impact).charAt(0).toLowerCase()}${stripPeriod(impact).slice(1)}.`;
}

function summarizeTask(transcript: string) {
  const cleaned = transcript
    .replace(/\s+/g, " ")
    .replace(/^(so|today|basically|actually|like)\s+/i, "")
    .trim();

  const firstSentence = cleaned.split(/[.!?]/).map((part) => part.trim()).find(Boolean) || cleaned;
  const normalized = firstSentence.charAt(0).toLowerCase() + firstSentence.slice(1);

  if (/learned|understood|studied|reviewed|practiced|explored/i.test(cleaned)) {
    return ensureSentence(`Learning and documentation related to ${normalized}`.replace(/\s+/g, " "));
  }

  if (/worked on|built|created|implemented|designed|debugged|fixed|wrote|reviewed/i.test(cleaned)) {
    return ensureSentence(
      normalized
        .replace(/^worked on\s+/i, "")
        .replace(/^implemented\s+/i, "Implementation of ")
        .replace(/^built\s+/i, "Development of ")
        .replace(/^created\s+/i, "Creation of ")
        .replace(/^designed\s+/i, "Design of ")
        .replace(/^debugged\s+/i, "Debugging of ")
        .replace(/^fixed\s+/i, "Fix for ")
        .replace(/^wrote\s+/i, "Writing of ")
        .replace(/^reviewed\s+/i, "Review of ")
        .replace(/\s+/g, " ")
    );
  }

  return "Captured work from the log.";
}

function ensureSentence(text: string) {
  const trimmed = text.trim();
  if (!trimmed) return "";
  const normalized = trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
  return /[.!?]$/.test(normalized) ? normalized : `${normalized}.`;
}

function stripPeriod(text: string) {
  return text.replace(/[.!?]+$/, "");
}
