"use client";

interface Props {
  year: number;
  month: number;
  logDays: Set<number>;
  selected?: number | null;
  onSelect: (day: number) => void;
}

export function CalendarRow({ year, month, logDays, selected, onSelect }: Props) {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();

  return (
    <div className="cal-row-scroll">
      {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((d) => {
        const isToday = d === today.getDate() && month === today.getMonth() && year === today.getFullYear();
        const hasLog = logDays.has(d);
        return (
          <div
            key={d}
            className={`cal-row-day ${hasLog ? "has-log" : ""} ${isToday ? "today" : ""} ${selected === d ? "selected" : ""}`}
            onClick={() => onSelect(d)}
          >
            <div className="cal-row-num">{d}</div>
            <div className="cal-row-dot" />
          </div>
        );
      })}
    </div>
  );
}

export default CalendarRow;
