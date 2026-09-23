import { NextResponse } from "next/server";
import { getServerInfo, getHealthStatus } from "@/lib/server-info";

export const dynamic = "force-dynamic";

export async function GET() {
  const health = getHealthStatus();
  const server = getServerInfo();

  return NextResponse.json(
    {
      status: health.status,
      timestamp: health.timestamp,
      uptime: health.uptime,
      environment: health.environment,
      nodeVersion: server.nodeVersion,
      nextVersion: server.nextVersion,
    },
    {
      headers: {
        "Cache-Control": "no-cache, no-store, must-revalidate",
      },
    },
  );
}
