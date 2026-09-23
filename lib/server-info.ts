import type { HealthStatus, ServerInfo } from "@/lib/types";

/**
 * Gather runtime information about the Node.js / Next.js server.
 * Server-side only — uses Node.js process APIs.
 */
export function getServerInfo(): ServerInfo {
  const memory = process.memoryUsage();

  return {
    nodeVersion: process.version,
    nextVersion: require("next/package.json").version as string,
    platform: process.platform,
    architecture: process.arch,
    memory: {
      rss: memory.rss,
      heapUsed: memory.heapUsed,
      heapTotal: memory.heapTotal,
    },
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || "development",
  };
}

/**
 * Derive a health status from current memory usage thresholds:
 *  - >1 GB heap → error
 *  - >500 MB heap → warning
 *  - otherwise → healthy
 */
export function getHealthStatus(): HealthStatus {
  const heapUsed = process.memoryUsage().heapUsed;
  const heapMB = heapUsed / (1024 * 1024);

  let status: HealthStatus["status"] = "healthy";
  if (heapMB > 1024) {
    status = "error";
  } else if (heapMB > 500) {
    status = "warning";
  }

  return {
    status,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || "development",
  };
}
