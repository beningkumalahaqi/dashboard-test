"use client";

import type { WeatherData } from "@/lib/types";
import {
  Sun,
  Cloud,
  CloudRain,
  CloudSnow,
  CloudLightning,
  Wind,
  CloudFog,
  CloudDrizzle,
  CloudSun,
  type LucideIcon,
} from "lucide-react";

const ICON_MAP: Record<string, LucideIcon> = {
  sun: Sun,
  cloud: Cloud,
  "cloud-rain": CloudRain,
  "cloud-snow": CloudSnow,
  "cloud-lightning": CloudLightning,
  "cloud-drizzle": CloudDrizzle,
  "cloud-fog": CloudFog,
  "cloud-sun": CloudSun,
  wind: Wind,
};

function getWeatherIcon(iconName: string): LucideIcon {
  return ICON_MAP[iconName] ?? Cloud;
}

export function WeatherCard({ weather }: { weather: WeatherData | null }) {
  if (!weather) {
    return (
      <div
        className="relative bg-surface border border-border rounded-[12px] min-w-0 overflow-hidden transition-[border-color] duration-200 hover:border-border-hi h-full"
        style={{ padding: "clamp(16px, 1.8vw, 24px)" }}
      >
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
          Weather
        </span>
        <p className="text-[14px] text-muted mt-4">Weather Unavailable</p>
      </div>
    );
  }

  const WeatherIcon = getWeatherIcon(weather.icon);

  return (
    <div
      className="relative bg-surface border border-border rounded-[12px] min-w-0 overflow-hidden transition-[border-color] duration-200 hover:border-border-hi h-full"
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
        Weather
      </span>

      {/* Top: Icon + Temp + Condition */}
      <div className="flex items-center gap-3.5 mt-4">
        <WeatherIcon
          className="shrink-0 opacity-90"
          style={{ width: 40, height: 40, color: "var(--warn)" }}
          strokeWidth={1.5}
        />
        <div
          className="font-light tabular-nums leading-none"
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(38px, 3.4vw, 46px)",
            letterSpacing: "-0.025em",
          }}
        >
          {Math.round(weather.temperature)}&deg;
        </div>
        <div>
          <div className="text-[14px] font-semibold">{weather.condition}</div>
          <div className="text-muted" style={{ fontSize: "12.5px", marginTop: "2px" }}>
            {weather.location}
          </div>
        </div>
      </div>

      {/* Stats grid */}
      <div
        className="grid grid-cols-3 gap-2 mt-4"
        style={{
          paddingTop: "14px",
          borderTop: "1px solid var(--border)",
        }}
      >
        <div>
          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "9.5px",
              letterSpacing: ".12em",
              textTransform: "uppercase",
              color: "var(--faint)",
            }}
          >
            Feels
          </div>
          <div className="text-[14px] font-semibold tabular-nums mt-1">
            {Math.round(weather.feelsLike)}&deg;
          </div>
        </div>
        <div>
          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "9.5px",
              letterSpacing: ".12em",
              textTransform: "uppercase",
              color: "var(--faint)",
            }}
          >
            Humidity
          </div>
          <div className="text-[14px] font-semibold tabular-nums mt-1">
            {weather.humidity}%
          </div>
        </div>
        <div>
          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "9.5px",
              letterSpacing: ".12em",
              textTransform: "uppercase",
              color: "var(--faint)",
            }}
          >
            Wind
          </div>
          <div className="text-[14px] font-semibold tabular-nums mt-1">
            {Math.round(weather.windSpeed)} km/h
          </div>
        </div>
      </div>
    </div>
  );
}
