"use client";

import type { ServerInfo } from "@/lib/types";
import { formatBytes, formatUptime } from "@/lib/utils";

function stripVPrefix(version: string): string {
  return version.startsWith("v") ? version.slice(1) : version;
}

function shortVersion(version: string): string {
  const cleaned = stripVPrefix(version);
  const parts = cleaned.split("-");
  const semver = parts[0]!;
  const segments = semver.split(".");
  if (segments.length >= 2) return `${segments[0]}.${segments[1]}`;
  return semver;
}

export function RuntimeInfo({ server }: { server: ServerInfo }) {
  const metrics = [
    { label: "Node.js", value: shortVersion(server.nodeVersion) },
    { label: "Memory", value: formatBytes(server.memory.rss) },
    { label: "Next.js", value: shortVersion(server.nextVersion) },
    { label: "Architecture", value: server.architecture },
    { label: "Platform", value: server.platform },
    { label: "Uptime", value: formatUptime(server.uptime) },
  ];

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
        Runtime
      </span>

      {/* 2-column grid */}
      <div
        className="grid gap-0 mt-3"
        style={{ gridTemplateColumns: "1fr 1fr", gap: "0 20px" }}
      >
        {metrics.map((metric) => (
          <div
            key={metric.label}
            className="flex justify-between items-baseline gap-2"
            style={{
              padding: "9px 0",
              borderBottom: "1px solid var(--border)",
            }}
          >
            <span className="text-muted" style={{ fontSize: "13px" }}>
              {metric.label}
            </span>
            <span
              className="text-right tabular-nums"
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "13.5px",
                fontWeight: 500,
              }}
            >
              {metric.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
