"use client";

import { useState, useEffect, useMemo } from "react";

function formatTime(date: Date, tz: string): string {
  return date.toLocaleTimeString("en-GB", {
    timeZone: tz,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
}

function formatWeekday(date: Date, tz: string): string {
  return date.toLocaleDateString("en-US", {
    timeZone: tz,
    weekday: "long",
  });
}

function formatDate(date: Date, tz: string): string {
  return date.toLocaleDateString("en-US", {
    timeZone: tz,
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function getUtcOffset(tz: string): string {
  try {
    const now = new Date();
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: tz,
      timeZoneName: "shortOffset",
    }).formatToParts(now);
    const tzPart = parts.find((p) => p.type === "timeZoneName");
    return tzPart?.value ?? "";
  } catch {
    return "";
  }
}

export function ServerClock({ timezone }: { timezone: string }) {
  const [now, setNow] = useState<Date>(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const utcOffset = useMemo(() => getUtcOffset(timezone), [timezone]);
  const tzLabel = utcOffset ? `${timezone} \u00b7 ${utcOffset}` : timezone;

  const weekday = formatWeekday(now, timezone);
  const dateStr = formatDate(now, timezone);

  return (
    <div
      className="relative bg-surface border border-border rounded-[12px] min-w-0 overflow-hidden transition-[border-color] duration-200 hover:border-border-hi flex flex-col h-full"
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
        Server time
      </span>

      {/* Clock wrap */}
      <div
        className="flex flex-col justify-center"
        style={{
          flex: 1,
          padding: "clamp(14px, 2vh, 26px) 0 4px",
        }}
      >
        {/* Clock text */}
        <time
          dateTime={now.toISOString()}
          suppressHydrationWarning
          className="leading-none tabular-nums"
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(52px, 5.6vw, 78px)",
            fontWeight: 200,
            letterSpacing: "-0.03em",
            fontVariantNumeric: "tabular-nums",
            background: "linear-gradient(180deg, var(--fg) 30%, color-mix(in oklch, var(--fg) 55%, var(--muted)) 100%)",
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            WebkitTextFillColor: "transparent",
            color: "transparent",
          }}
        >
          {formatTime(now, timezone)}
        </time>

        {/* Rule */}
        <hr
          className="border-0 bg-border"
          style={{
            height: "1px",
            marginTop: "clamp(18px, 2.6vh, 28px)",
          }}
        />

        {/* Meta */}
        <div style={{ marginTop: "clamp(16px, 2.4vh, 26px)" }}>
          <div
            className="font-semibold tracking-[-0.01em]"
            style={{ fontSize: "17px" }}
          >
            {weekday}
          </div>
          <div
            className="text-muted mt-[3px]"
            style={{ fontSize: "14px" }}
          >
            {dateStr}
          </div>
          {tzLabel && (
            <div
              className="text-faint mt-3"
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "11px",
                letterSpacing: ".08em",
              }}
            >
              {tzLabel}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
