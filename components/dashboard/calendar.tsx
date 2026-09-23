"use client";

import { useMemo, useState, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
}

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfWeek(year: number, month: number): number {
  // 0=Sun, 1=Mon, ..., 6=Sat
  return new Date(year, month, 1).getDay();
}

function buildCalendarGrid(year: number, month: number): CalendarDay[] {
  const today = new Date();
  const todayDate = today.getDate();
  const todayMonth = today.getMonth();
  const todayYear = today.getFullYear();

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfWeek(year, month);

  const days: CalendarDay[] = [];

  // Previous month fill
  if (firstDay > 0) {
    const prevMonth = month === 0 ? 11 : month - 1;
    const prevYear = month === 0 ? year - 1 : year;
    const daysInPrevMonth = getDaysInMonth(prevYear, prevMonth);
    for (let i = firstDay - 1; i >= 0; i--) {
      days.push({
        date: new Date(prevYear, prevMonth, daysInPrevMonth - i),
        isCurrentMonth: false,
        isToday: false,
      });
    }
  }

  // Current month
  for (let d = 1; d <= daysInMonth; d++) {
    days.push({
      date: new Date(year, month, d),
      isCurrentMonth: true,
      isToday: d === todayDate && month === todayMonth && year === todayYear,
    });
  }

  // Next month fill (complete to 42 cells = 6 rows)
  const remaining = 42 - days.length;
  const nextMonth = month === 11 ? 0 : month + 1;
  const nextYear = month === 11 ? year + 1 : year;
  for (let d = 1; d <= remaining; d++) {
    days.push({
      date: new Date(nextYear, nextMonth, d),
      isCurrentMonth: false,
      isToday: false,
    });
  }

  return days;
}

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export function Calendar() {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [slideDir, setSlideDir] = useState<0 | 1 | -1>(0);
  const [animKey, setAnimKey] = useState(0);

  const grid = useMemo(
    () => buildCalendarGrid(viewYear, viewMonth),
    [viewYear, viewMonth]
  );

  const goToPrevMonth = useCallback(() => {
    setSlideDir(-1);
    setAnimKey((k) => k + 1);
    setViewMonth((m) => {
      if (m === 0) {
        setViewYear((y) => y - 1);
        return 11;
      }
      return m - 1;
    });
  }, []);

  const goToNextMonth = useCallback(() => {
    setSlideDir(1);
    setAnimKey((k) => k + 1);
    setViewMonth((m) => {
      if (m === 11) {
        setViewYear((y) => y + 1);
        return 0;
      }
      return m + 1;
    });
  }, []);

  const goToToday = useCallback(() => {
    const t = new Date();
    const isSameMonth =
      t.getMonth() === viewMonth && t.getFullYear() === viewYear;
    if (!isSameMonth) {
      setSlideDir(t.getMonth() > viewMonth ? 1 : -1);
      setAnimKey((k) => k + 1);
    }
    setViewYear(t.getFullYear());
    setViewMonth(t.getMonth());
  }, [viewMonth, viewYear]);

  const isViewingCurrentMonth =
    viewMonth === today.getMonth() && viewYear === today.getFullYear();

  return (
    <div
      className="relative bg-surface border border-border rounded-[12px] min-w-0 overflow-hidden transition-[border-color] duration-200 hover:border-border-hi"
      style={{ padding: "clamp(16px, 1.8vw, 24px)" }}
    >
      {/* Eyebrow */}
      <span
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "10px",
          fontWeight: 500,
          letterSpacing: ".16em",
          textTransform: "uppercase",
          color: "var(--faint)",
        }}
      >
        Calendar
      </span>

      {/* Header */}
      <div className="flex items-center gap-2 mt-3.5">
        <button
          type="button"
          onClick={goToPrevMonth}
          className="inline-flex items-center justify-center text-muted transition-[background,color,border-color,transform] duration-150 hover:bg-press-bg hover:text-foreground hover:border-border-hi active:scale-[.93] focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-1"
          style={{
            width: "30px",
            height: "30px",
            borderRadius: "7px",
            border: "1px solid var(--border)",
          }}
          aria-label="Previous month"
        >
          <ChevronLeft style={{ width: 12, height: 12 }} />
        </button>

        <div
          className="font-semibold tracking-[-0.012em] flex-1 text-center"
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "17px",
            minWidth: "170px",
          }}
        >
          {MONTH_NAMES[viewMonth]} {viewYear}
        </div>

        <button
          type="button"
          onClick={goToNextMonth}
          className="inline-flex items-center justify-center text-muted transition-[background,color,border-color,transform] duration-150 hover:bg-press-bg hover:text-foreground hover:border-border-hi active:scale-[.93] focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-1"
          style={{
            width: "30px",
            height: "30px",
            borderRadius: "7px",
            border: "1px solid var(--border)",
          }}
          aria-label="Next month"
        >
          <ChevronRight style={{ width: 12, height: 12 }} />
        </button>

        {!isViewingCurrentMonth && (
          <button
            type="button"
            onClick={goToToday}
            className="text-muted font-medium transition-[background,color,border-color,transform] duration-150 hover:bg-press-bg hover:text-foreground hover:border-border-hi active:scale-[.96] focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-1"
            style={{
              height: "30px",
              padding: "0 12px",
              borderRadius: "7px",
              border: "1px solid var(--border)",
              fontSize: "12.5px",
            }}
          >
            Today
          </button>
        )}
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 mt-3.5">
        {WEEKDAYS.map((day) => (
          <div
            key={day}
            className="text-center"
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "10px",
              letterSpacing: ".14em",
              textTransform: "uppercase",
              color: "var(--faint)",
              padding: "6px 0 8px",
            }}
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid with slide animation */}
      <div
        key={animKey}
        className="grid grid-cols-7"
        style={{
          rowGap: "2px",
          "--cal-dir": slideDir >= 0 ? "8px" : "-8px",
          animation:
            animKey > 0
              ? "cal-in .22s cubic-bezier(.3,0,.2,1)"
              : undefined,
        } as React.CSSProperties}
      >
        {grid.map((day, i) => {
          const isEmpty = false; // we always render the number
          const isOther = !day.isCurrentMonth;
          return (
            <div
              key={i}
              className="flex items-center justify-center tabular-nums transition-[background] duration-[150ms] hover:bg-press-bg"
              style={{
                height: "40px",
                width: "36px",
                borderRadius: "50%",
                fontSize: "13.5px",
                justifySelf: "center",
                color: day.isToday
                  ? "var(--accent)"
                  : isOther
                    ? "var(--faint)"
                    : "var(--fg)",
                fontWeight: day.isToday ? 600 : undefined,
                background: day.isToday ? "var(--accent-soft)" : undefined,
                boxShadow: day.isToday
                  ? "inset 0 0 0 1px color-mix(in oklch, var(--accent) 35%, transparent)"
                  : undefined,
              }}
              aria-current={day.isToday ? "date" : undefined}
            >
              {day.date.getDate()}
            </div>
          );
        })}
      </div>
    </div>
  );
}
