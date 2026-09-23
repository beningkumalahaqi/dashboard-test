"use client";

import { useState, useCallback, useEffect } from "react";
import { RotateCw, Sun, Moon, Monitor } from "lucide-react";
import { cn } from "@/lib/utils";
import type {
  HealthStatus,
  ServerInfo,
  WeatherData,
  DeploymentInfo,
} from "@/lib/types";
import { Header } from "./header";
import { ServerStatus } from "./server-status";
import { ServerClock } from "./server-clock";
import { WeatherCard } from "./weather-card";
import { DeploymentInfoCard } from "./deployment-info";
import { RuntimeInfo } from "./runtime-info";
import { Calendar } from "./calendar";

/* ── Theme Toggle ─────────────────────────────────────── */
type ThemePref = "light" | "dark" | "system";

function resolveTheme(pref: ThemePref): "light" | "dark" {
  if (pref === "system") {
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }
  return pref;
}

function applyTheme(pref: ThemePref) {
  document.documentElement.dataset.theme = resolveTheme(pref);
}

/* ── Dashboard ────────────────────────────────────────── */
interface DashboardProps {
  health: HealthStatus;
  server: ServerInfo;
  weather: WeatherData | null;
  deployment: DeploymentInfo;
}

export function Dashboard({
  health,
  server,
  weather,
  deployment,
}: DashboardProps) {
  const [data, setData] = useState({ health, server, weather, deployment });
  const [isRefreshing, setIsRefreshing] = useState(false);

  /* theme state */
  const [themePref, setThemePref] = useState<ThemePref>("system");
  const [popoverOpen, setPopoverOpen] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("sd-theme") as ThemePref | null;
    const initial = saved || "system";
    setThemePref(initial);
    applyTheme(initial);

    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => {
      if ((saved || "system") === "system") applyTheme("system");
    };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const selectTheme = useCallback((pref: ThemePref) => {
    setThemePref(pref);
    localStorage.setItem("sd-theme", pref);
    applyTheme(pref);
    setPopoverOpen(false);
  }, []);

  /* close popover on outside click / Escape */
  useEffect(() => {
    if (!popoverOpen) return;
    const close = (e: MouseEvent | KeyboardEvent) => {
      if (e instanceof KeyboardEvent && e.key === "Escape") {
        setPopoverOpen(false);
        return;
      }
      if (e instanceof MouseEvent) {
        const target = e.target as HTMLElement;
        if (!target.closest("[data-popover]") && !target.closest("[data-appearance-btn]")) {
          setPopoverOpen(false);
        }
      }
    };
    document.addEventListener("click", close);
    document.addEventListener("keydown", close);
    return () => {
      document.removeEventListener("click", close);
      document.removeEventListener("keydown", close);
    };
  }, [popoverOpen]);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch("/api/health", { cache: "no-store" });
      const healthData = await res.json();
      setData((prev) => ({
        ...prev,
        health: { ...prev.health, ...healthData },
      }));
    } catch {
      // keep existing data on error
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  const themeIcon = themePref === "dark" ? Moon : themePref === "light" ? Sun : Monitor;

  return (
    <div className="min-h-screen flex justify-center items-start p-[clamp(14px,3.5vh,44px)_clamp(12px,3vw,40px)]">
      <div className="shell">
        {/* ── Toolbar ── */}
        <header className="toolbar">
          {/* Traffic lights */}
          <div className="flex gap-[7px] shrink-0" aria-hidden="true">
            <span className="w-[11px] h-[11px] rounded-full bg-traffic-red border border-black/10" />
            <span className="w-[11px] h-[11px] rounded-full bg-traffic-yellow border border-black/10" />
            <span className="w-[11px] h-[11px] rounded-full bg-traffic-green border border-black/10" />
          </div>

          <span className="text-[13px] font-medium tracking-[-0.005em] text-muted">
            Server Dashboard
          </span>

          <div className="ml-auto flex items-center gap-1.5 relative">
            {/* Refresh button */}
            <button
              type="button"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className={cn(
                "inline-flex items-center justify-center gap-1.5 min-w-[30px] h-[28px] px-[9px]",
                "rounded-[7px] border border-transparent text-[12px] text-muted",
                "transition-[background,color,border-color,transform] duration-150 ease-[cubic-bezier(.4,0,.2,1)]",
                "hover:bg-press-bg hover:text-foreground hover:border-border",
                "active:scale-[.96] focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-1",
                "disabled:opacity-50 disabled:cursor-not-allowed"
              )}
              title="Refresh server status"
              aria-label="Refresh"
            >
              <RotateCw
                className={cn(
                  "w-[13px] h-[13px]",
                  isRefreshing && "animate-spin"
                )}
              />
              <span className="hidden sm:inline">Refresh</span>
            </button>

            {/* Appearance toggle */}
            <button
              type="button"
              data-appearance-btn
              onClick={() => setPopoverOpen((o) => !o)}
              aria-haspopup="true"
              aria-expanded={popoverOpen}
              title="Appearance"
              aria-label="Appearance"
              className={cn(
                "inline-flex items-center justify-center min-w-[30px] h-[28px] px-[9px]",
                "rounded-[7px] border border-transparent text-[12px] text-muted",
                "transition-[background,color,border-color,transform] duration-150 ease-[cubic-bezier(.4,0,.2,1)]",
                "hover:bg-press-bg hover:text-foreground hover:border-border",
                "active:scale-[.96] focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-1"
              )}
            >
              {(() => {
                const Icon = themeIcon;
                return <Icon className="w-[13px] h-[13px]" />;
              })()}
            </button>

            {/* Theme popover */}
            <div
              data-popover
              role="menu"
              aria-label="Appearance"
              className={cn(
                "absolute top-[calc(100%+8px)] right-0 w-[168px] z-40",
                "bg-surface border border-border rounded-[10px] p-[5px]",
                "shadow-[0_10px_34px_-8px_oklch(20%_0.02_70/.25),0_2px_8px_oklch(20%_0.02_70/.08)]",
                "transition-[opacity,transform] duration-[160ms] ease-[cubic-bezier(.4,0,.2,1)]",
                popoverOpen
                  ? "opacity-100 translate-y-0 scale-100 pointer-events-auto"
                  : "opacity-0 -translate-y-1 scale-[.98] pointer-events-none"
              )}
            >
              <div className="font-[var(--font-mono)] text-[9.5px] tracking-[.14em] uppercase text-faint px-[9px] pt-[7px] pb-[5px]">
                Appearance
              </div>
              {(["light", "dark", "system"] as const).map((opt) => (
                <button
                  key={opt}
                  type="button"
                  role="menuitemradio"
                  aria-checked={themePref === opt}
                  onClick={() => selectTheme(opt)}
                  className="flex items-center gap-2.5 w-full px-[9px] py-[7px] rounded-[6px] text-[13px] text-foreground hover:bg-press-bg transition-[background] duration-[120ms] capitalize"
                >
                  <span className={cn("w-3.5 shrink-0 text-accent text-[11px]", themePref === opt ? "opacity-100" : "opacity-0")}>{"\u2713"}</span>
                  {opt}
                </button>
              ))}
            </div>
          </div>
        </header>

        {/* ── Body ── */}
        <main style={{ padding: "clamp(18px, 2.4vw, 30px) clamp(16px, 2.4vw, 30px) clamp(20px, 2.6vw, 32px)" }}>
          {/* Page Header */}
          <Header status={data.health.status} />

          {/* Grid */}
          <div className="grid grid-cols-12 gap-[var(--gap)]">
            {/* Status — 7 cols on desktop */}
            <div className="col-span-12 lg:col-span-7">
              <ServerStatus health={data.health} server={data.server} />
            </div>

            {/* Clock — 5 cols on desktop */}
            <div className="col-span-12 lg:col-span-5">
              <ServerClock />
            </div>

            {/* Weather — 4 cols on desktop, 6 on tablet */}
            <div className="col-span-12 md:col-span-6 lg:col-span-4">
              <WeatherCard weather={data.weather} />
            </div>

            {/* Deployment — 4 cols on desktop, 6 on tablet */}
            <div className="col-span-12 md:col-span-6 lg:col-span-4">
              <DeploymentInfoCard deployment={data.deployment} />
            </div>

            {/* Runtime — 4 cols on desktop, full on tablet */}
            <div className="col-span-12 lg:col-span-4">
              <RuntimeInfo server={data.server} />
            </div>

            {/* Calendar — full width */}
            <div className="col-span-12">
              <Calendar />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
