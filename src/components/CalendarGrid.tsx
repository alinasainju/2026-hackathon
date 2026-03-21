"use client";

interface CalendarGridProps {
  year: number;
  month: number; // 0-index
  logDays: Set<number>;
  selected?: number | null;
  onSelect: (day: number) => void;
}

export function CalendarGrid({ year, month, logDays, selected, onSelect }: CalendarGridProps) {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <>
      <div className="cal-dow-row">
        {"Sun,Mon,Tue,Wed,Thu,Fri,Sat".split(",").map((d) => (
          <span key={d}>{d}</span>
        ))}
      </div>
      <div className="cal-grid">
        {cells.map((day, idx) => {
          if (!day) return <div key={`b-${idx}`} />;
          const isToday =
            day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
          const hasLog = logDays.has(day);
          return (
            <div
              key={day}
              className={`cal-day ${hasLog ? "has-log" : ""} ${isToday ? "today" : ""} ${selected === day ? "selected" : ""}`}
              onClick={() => onSelect(day)}
            >
              <div className="cal-day-num">{day}</div>
              <div className="cal-dot" />
            </div>
          );
        })}
      </div>
    </>
  );
}

export default CalendarGrid;
