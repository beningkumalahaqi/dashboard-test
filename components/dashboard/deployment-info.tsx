"use client";

import type { DeploymentInfo } from "@/lib/types";
import { timeAgo } from "@/lib/utils";

export function DeploymentInfoCard({
  deployment,
}: {
  deployment: DeploymentInfo;
}) {
  const sha = deployment.commitSha
    ? deployment.commitSha.length > 7
      ? deployment.commitSha.slice(0, 7)
      : deployment.commitSha
    : "\u2014";

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
        Deployment
      </span>

      {/* Env row */}
      <div className="flex items-center gap-2.5 mt-4 flex-wrap">
        <span className="text-[20px] font-semibold tracking-[-0.015em]">
          {deployment.environment || "\u2014"}
        </span>
        <span
          className="rounded-[5px] px-[7px] py-[3px]"
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "9.5px",
            letterSpacing: ".12em",
            textTransform: "uppercase",
            color: "var(--ok)",
            background: "var(--ok-soft)",
            border: "1px solid color-mix(in oklch, var(--ok) 30%, transparent)",
          }}
        >
          Live
        </span>
      </div>

      {/* Env meta */}
      <div className="text-muted mt-[7px]" style={{ fontSize: "13.5px" }}>
        {deployment.provider || "\u2014"}
        {deployment.region ? ` \u00b7 ${deployment.region}` : ""}
      </div>

      {/* Facts grid */}
      <div
        className="grid grid-cols-2 gap-3 mt-4"
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
            Commit
          </div>
          <div
            className="mt-[5px] tracking-[-0.01em]"
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "14px",
              fontWeight: 500,
            }}
          >
            {sha}
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
            Deployed
          </div>
          <div
            className="mt-[5px]"
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "14px",
              fontWeight: 600,
            }}
          >
            {deployment.deployedAt ? timeAgo(deployment.deployedAt) : "\u2014"}
          </div>
        </div>
      </div>
    </div>
  );
}
