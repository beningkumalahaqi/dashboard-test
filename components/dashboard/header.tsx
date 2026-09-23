"use client";

import type { HealthStatus } from "@/lib/types";

interface HeaderProps {
  status: HealthStatus["status"];
}

const statusPillLabel: Record<HealthStatus["status"], string> = {
  healthy: "Operational",
  warning: "Degraded",
  error: "Down",
};

export function Header({ status }: HeaderProps) {
  return (
    <div className="flex items-start justify-between gap-4 mb-[clamp(18px,2.2vw,26px)] flex-wrap">
      {/* Left */}
      <div>
        <h1
          className="font-[var(--font-display)] font-semibold tracking-[-0.022em] leading-[1.1]"
          style={{ fontSize: "clamp(24px, 2.4vw, 30px)" }}
        >
          Server Dashboard
        </h1>
        <p className="text-[14px] text-muted mt-[5px]">
          Your deployment at a glance
        </p>
      </div>

      {/* Right — status pill */}
      <div className="inline-flex items-center gap-[7px] text-[13px] text-muted px-3 py-[7px] border border-border rounded-full bg-surface whitespace-nowrap">
        <span
          className="w-[7px] h-[7px] rounded-full bg-ok"
          style={{
            boxShadow: "0 0 0 3px var(--ok-soft)",
            animation: "breathe-dot 3.2s ease-in-out infinite",
          }}
        />
        {statusPillLabel[status]}
      </div>
    </div>
  );
}
