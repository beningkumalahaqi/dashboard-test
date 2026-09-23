import fs from "node:fs";
import path from "node:path";
import type { DeploymentInfo } from "@/lib/types";

/**
 * Detect the current deployment environment and return metadata.
 * Checks for Vercel first, then Docker, then falls back to local dev.
 * Server-side only.
 */
export function getDeploymentInfo(): DeploymentInfo {
  // --- Vercel ---
  if (process.env.VERCEL) {
    return {
      environment: process.env.VERCEL_ENV || "production",
      provider: "Vercel",
      region: process.env.VERCEL_REGION || "unknown",
      commitSha: process.env.VERCEL_GIT_COMMIT_SHA || "",
      commitRef: process.env.VERCEL_GIT_COMMIT_REF || "",
      deployedAt:
        process.env.VERCEL_GIT_COMMIT_MESSAGE || new Date().toISOString(),
    };
  }

  // --- Docker ---
  const isDocker =
    process.env.DOCKER_CONTAINER === "true" ||
    fs.existsSync(path.join("/.dockerenv"));

  if (isDocker) {
    return {
      environment: process.env.NODE_ENV || "production",
      provider: "Docker",
      region: process.env.DOCKER_REGION || "local",
      commitSha: process.env.GIT_COMMIT_SHA || "",
      commitRef: process.env.GIT_COMMIT_REF || "",
      deployedAt: new Date().toISOString(),
    };
  }

  // --- Local ---
  return {
    environment: process.env.NODE_ENV || "development",
    provider: "Local",
    region: "local",
    commitSha: "",
    commitRef: "",
    deployedAt: new Date().toISOString(),
  };
}
