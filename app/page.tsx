import { Dashboard } from "@/components/dashboard/dashboard";
import { getServerInfo, getHealthStatus } from "@/lib/server-info";
import { getWeather } from "@/lib/weather";
import { getDeploymentInfo } from "@/lib/deployment";

export const dynamic = "force-dynamic";

interface IPGeoResponse {
  status: string;
  timezone?: string;
}

async function detectTimezone(): Promise<string> {
  // 1. Try IP geolocation (detects actual server location, not OS timezone)
  try {
    const res = await fetch("http://ip-api.com/json/?fields=timezone", {
      next: { revalidate: 3600 },
    });
    if (res.ok) {
      const data: IPGeoResponse = await res.json();
      if (data.status === "success" && data.timezone) {
        return data.timezone;
      }
    }
  } catch {
    // fall through
  }

  // 2. Fallback to OS timezone
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    return "UTC";
  }
}

export default async function Home() {
  const [serverInfo, health, weather, deployment, serverTimezone] =
    await Promise.all([
      getServerInfo(),
      getHealthStatus(),
      getWeather(),
      getDeploymentInfo(),
      detectTimezone(),
    ]);

  return (
    <Dashboard
      health={health}
      server={serverInfo}
      weather={weather}
      deployment={deployment}
      serverTimezone={serverTimezone}
    />
  );
}
