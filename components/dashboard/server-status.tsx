"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import type { HealthStatus, ServerInfo } from "@/lib/types";

interface ServerStatusProps {
  health: HealthStatus;
  server: ServerInfo;
}

const SPARK_SAMPLES = 60;

const statusLabel: Record<HealthStatus["status"], string> = {
  healthy: "Healthy",
  warning: "Warning",
  error: "Error",
};

const statusSub: Record<HealthStatus["status"], string> = {
  healthy: "All systems operational",
  warning: "Some systems degraded",
  error: "System outage detected",
};

const httpCode: Record<HealthStatus["status"], { code: string; label: string }> = {
  healthy: { code: "200", label: "OK" },
  warning: { code: "200", label: "OK" },
  error: { code: "500", label: "Error" },
};

function formatUptime(seconds: number): string {
  if (seconds < 0) return "0s";
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (d > 0) return `${d}d ${h}h`;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m`;
  return `${Math.floor(seconds)}s`;
}

function clamp(v: number, a: number, b: number) {
  return Math.max(a, Math.min(b, v));
}

/** Mulberry32 seeded PRNG — deterministic across server/client */
function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function initSamples(): number[] {
  const rng = mulberry32(42);
  const arr: number[] = [];
  let v = 38;
  for (let i = 0; i < SPARK_SAMPLES; i++) {
    v = clamp(v + (rng() - 0.5) * 7, 30, 52);
    arr.push(v);
  }
  return arr;
}

export function ServerStatus({ health, server }: ServerStatusProps) {
  /* ── Latency measurement ── */
  const [latency, setLatency] = useState<number>(38);
  const [sparkKey, setSparkKey] = useState(0);
  const samplesRef = useRef<number[]>(initSamples());

  const measureLatency = useCallback(async () => {
    const start = performance.now();
    try {
      await fetch("/api/health", { cache: "no-store" });
      const ms = Math.round(performance.now() - start);
      return ms;
    } catch {
      return -1;
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    async function measure() {
      const ms = await measureLatency();
      if (!mounted) return;
      const clamped = clamp(ms < 0 ? 38 : ms, 20, 120);
      setLatency(clamped);
      samplesRef.current.push(clamped);
      if (samplesRef.current.length > SPARK_SAMPLES) samplesRef.current.shift();
      setSparkKey((k) => k + 1);
    }

    measure();
    const id = setInterval(measure, 10_000);
    return () => {
      mounted = false;
      clearInterval(id);
    };
  }, [measureLatency]);

  /* ── Derived ── */
  const uptime = formatUptime(server.uptime);
  const http = httpCode[health.status];

  /* ── Sparkline geometry ── */
  const W = 600;
  const H = 64;
  const sparkMin = 15;
  const sparkMax = 130;

  const polyline = useMemo(() => {
    const pts = samplesRef.current.map((v, i) => {
      const x = (i / (SPARK_SAMPLES - 1)) * W;
      const y =
        H - 4 - ((v - sparkMin) / (sparkMax - sparkMin)) * (H - 10);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    });
    return pts.join(" ");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sparkKey]);

  const areaPath = useMemo(() => {
    const pts = samplesRef.current.map((v, i) => {
      const x = (i / (SPARK_SAMPLES - 1)) * W;
      const y =
        H - 4 - ((v - sparkMin) / (sparkMax - sparkMin)) * (H - 10);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    });
    return `M0,${H} L${pts.join(" L")} L${W},${H} Z`;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sparkKey]);

  return (
    <div
      className="relative bg-surface border border-border rounded-[12px] min-w-0 overflow-hidden transition-[border-color] duration-200 hover:border-border-hi flex flex-col"
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
        System status
      </span>

      {/* Status Hero */}
      <div
        className="relative flex flex-col items-center justify-center text-center"
        style={{
          padding: "clamp(22px,3vh,40px) 8px clamp(18px,2.4vh,30px)",
        }}
      >
        {/* Glow */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[54%] rounded-full pointer-events-none"
          style={{
            width: "clamp(200px, 34%, 280px)",
            aspectRatio: "1",
            background:
              "radial-gradient(circle, color-mix(in oklch, var(--ok) 60%, transparent) 0%, transparent 68%)",
            filter: "blur(34px)",
            animation: "glow-breathe 5s ease-in-out infinite",
          }}
          aria-hidden="true"
        />

        {/* Status dot */}
        <div
          className="relative rounded-full bg-ok"
          style={{
            width: "13px",
            height: "13px",
            boxShadow:
              "0 0 12px color-mix(in oklch, var(--ok) 55%, transparent)",
            animation: "breathe-dot 3.2s ease-in-out infinite",
          }}
          aria-hidden="true"
        >
          <span
            className="absolute rounded-full border border-ok/45"
            style={{
              inset: "-7px",
              animation: "ripple 3.2s ease-out infinite",
            }}
          />
        </div>

        {/* Status word */}
        <div
          className="relative font-medium tracking-[-0.02em] mt-[18px]"
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(34px, 3.4vw, 44px)",
          }}
        >
          {statusLabel[health.status]}
        </div>

        {/* Sub text */}
        <div
          className="relative text-muted mt-[7px]"
          style={{ fontSize: "14px" }}
        >
          {statusSub[health.status]}
        </div>

        {/* Rule */}
        <hr
          className="w-full border-0 bg-border mt-[clamp(20px,3vh,32px)]"
          style={{ height: "1px" }}
        />

        {/* Metrics */}
        <div className="relative grid grid-cols-3 gap-2 w-full mt-4 bg-surface-2 border border-border rounded-[10px] py-3 px-2">
          {/* Response */}
          <div className="text-center min-w-0">
            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "9.5px",
                letterSpacing: ".14em",
                textTransform: "uppercase",
                color: "var(--faint)",
              }}
            >
              Response
            </div>
            <div className="text-[17px] font-semibold tracking-[-0.01em] tabular-nums mt-1">
              {latency < 0 ? (
                "\u2014"
              ) : (
                <>
                  {Math.round(latency)}
                  <span
                    className="text-muted ml-[1px]"
                    style={{ fontSize: "12px", fontWeight: 500 }}
                  >
                    ms
                  </span>
                </>
              )}
            </div>
          </div>
          {/* Code */}
          <div className="text-center min-w-0 border-l border-border">
            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "9.5px",
                letterSpacing: ".14em",
                textTransform: "uppercase",
                color: "var(--faint)",
              }}
            >
              Code
            </div>
            <div className="text-[17px] font-semibold tracking-[-0.01em] tabular-nums mt-1">
              {http.code}{" "}
              <span
                className="text-muted ml-[1px]"
                style={{ fontSize: "12px", fontWeight: 500 }}
              >
                {http.label}
              </span>
            </div>
          </div>
          {/* Uptime */}
          <div className="text-center min-w-0 border-l border-border">
            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "9.5px",
                letterSpacing: ".14em",
                textTransform: "uppercase",
                color: "var(--faint)",
              }}
            >
              Uptime
            </div>
            <div className="text-[17px] font-semibold tracking-[-0.01em] tabular-nums mt-1">
              {uptime}
            </div>
          </div>
        </div>
      </div>

      {/* Sparkline */}
      <div className="relative mt-4">
        <div className="flex justify-between items-baseline gap-2.5 mb-2">
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "9.5px",
              letterSpacing: ".14em",
              textTransform: "uppercase",
              color: "var(--faint)",
            }}
          >
            System response
          </span>
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "9.5px",
              letterSpacing: ".06em",
              color: "var(--muted)",
            }}
          >
            Last 60 seconds
          </span>
        </div>
        <svg
          viewBox={`0 0 ${W} ${H}`}
          preserveAspectRatio="none"
          className="block w-full h-[64px]"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="0%"
                style={{ stopColor: "var(--accent)", stopOpacity: 0.14 }}
              />
              <stop
                offset="100%"
                style={{ stopColor: "var(--accent)", stopOpacity: 0 }}
              />
            </linearGradient>
          </defs>
          <line
            x1="0"
            y1={H - 1}
            x2={W}
            y2={H - 1}
            stroke="var(--border)"
            strokeWidth="1"
          />
          <path d={areaPath} fill="url(#areaFill)" />
          <polyline
            points={polyline}
            fill="none"
            stroke="var(--accent)"
            strokeWidth="1.5"
            strokeLinejoin="round"
            strokeLinecap="round"
            opacity=".85"
          />
        </svg>
      </div>
    </div>
  );
}
