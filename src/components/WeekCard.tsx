"use client";

import { LogItem } from "@/context/LogsContext";
import { useRouter } from "next/navigation";

interface Props {
  weekKey: string;
  weekLabel: string;
  dateRange: string;
  logs: LogItem[];
  showBullets: boolean;
  hasStar: boolean;
  showStar: boolean;
  onToggleStar: (weekKey: string) => void;
}

export function WeekCard({ weekKey, weekLabel, dateRange, logs, showBullets, hasStar, showStar, onToggleStar }: Props) {
  const router = useRouter();
  const skills = aggregateSkills(logs);
  const bullets = generateBullets(logs);
  const summary = generateSummary(logs, skills);

  return (
    <div className="week-card">
      <div className="week-card-inner">
        <div className="week-left">
          <div className="week-header">
            <div>
              <div className="week-heading">{weekLabel}</div>
              <div className="week-dates">{dateRange}</div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              {hasStar && (
                <button className="star-toggle-btn" onClick={() => onToggleStar(weekKey)}>
                  {showStar ? "\u2190 Key Skills" : "STAR Stories \u2192"}
                </button>
              )}
              <button className="view-logs-btn" onClick={() => router.push("/tasks")}>
                View Logs
              </button>
            </div>
          </div>
          <div className="summary-section">
            <div className="section-label">Weekly Summary</div>
            <div className="summary-text">{summary}</div>
          </div>
          {showBullets && (
            <div className="bullets-section">
              <div className="section-label">Resume Bullets</div>
              {bullets.map((b, i) => (
                <div key={i} className="bullet-item">
                  <div className="bullet-dot" />
                  <div>{b}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {showStar ? buildStarPanel(logs) : buildSkillsPanel(skills)}
      </div>
    </div>
  );
}

function aggregateSkills(logs: LogItem[]) {
  const map: Record<string, number> = {};
  logs.forEach((l) => (l.skills || []).forEach((s) => (map[s] = (map[s] || 0) + 1)));
  return Object.entries(map)
    .sort((a, b) => b[1] - a[1])
    .map(([name, count]) => ({ name, count }));
}

function generateBullets(logs: LogItem[]) {
  return logs.slice(0, 4).map((l) => l.resumeBullet || l.impact || l.title);
}

function generateSummary(logs: LogItem[], skills: { name: string; count: number }[]) {
  if (logs.length === 0) return "No activity this week.";
  const skillNames = skills.slice(0, 3).map((s) => s.name).join(", ");
  const titles = logs.map((l) => l.title).join(", ");
  return `Covered ${logs.length} session${logs.length !== 1 ? "s" : ""}: ${titles}. Focus areas: ${skillNames || "general skills"}.`;
}

function buildSkillsPanel(skills: { name: string; count: number }[]) {
  return (
    <div className="week-skills">
      <div className="skills-label">
        Key Skills
        <br />
        this week
      </div>
      {skills.length === 0 && (
        <div style={{ fontSize: "12px", color: "var(--text-muted)", fontStyle: "italic", marginTop: "8px" }}>
          No skills tagged yet
        </div>
      )}
      {skills.slice(0, 7).map((s) => (
        <div className="skill-row" key={s.name}>
          <span className="skill-tag">{s.name}</span>
          <span className="skill-freq">×{s.count}</span>
        </div>
      ))}
    </div>
  );
}

function buildStarPanel(logs: LogItem[]) {
  const eligible = logs
    .filter((log) => !!log.starStory)
    .sort((a, b) => (b.task.length + b.impact.length) - (a.task.length + a.impact.length));

  if (eligible.length === 0) {
    return (
      <div className="star-panel">
        <div className="star-panel-label">STAR STORIES</div>
        <div className="star-notice">Add more detail to your logs to unlock STAR stories.</div>
      </div>
    );
  }

  const best = eligible[0];
  const story = best.starStory;
  if (!story) {
    return (
      <div className="star-panel">
        <div className="star-panel-label">STAR STORIES</div>
        <div className="star-notice">Add more detail to your logs to unlock STAR stories.</div>
      </div>
    );
  }

  return (
    <div className="star-panel">
      <div className="star-panel-header">
        <div className="star-panel-label">STAR STORIES</div>
        <span className="star-badge">STAR</span>
      </div>
      <div className="star-notice">
        We noticed your log has the STAR structure — here it is formatted for interviews.
      </div>
      <div className="star-boxes">
        <div className="star-box star-box-s">
          <div className="star-box-letter" style={{ color: "#a05a20" }}>
            S — Situation
          </div>
          <div className="star-box-text">{story.situation}</div>
        </div>
        <div className="star-box star-box-t">
          <div className="star-box-letter" style={{ color: "#1f5a8a" }}>
            T — Task
          </div>
          <div className="star-box-text">{story.task}</div>
        </div>
        <div className="star-box star-box-a">
          <div className="star-box-letter" style={{ color: "#1a6630" }}>
            A — Action
          </div>
          <div className="star-box-text">{story.action}</div>
        </div>
        <div className="star-box star-box-r">
          <div className="star-box-letter" style={{ color: "#7a2a8a" }}>
            R — Result
          </div>
          <div className="star-box-text">{story.result}</div>
        </div>
      </div>
    </div>
  );
}

export default WeekCard;
