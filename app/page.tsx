import { Dashboard } from "@/components/dashboard/dashboard";
import { getServerInfo, getHealthStatus } from "@/lib/server-info";
import { getWeather } from "@/lib/weather";
import { getDeploymentInfo } from "@/lib/deployment";

export const dynamic = "force-dynamic";

function getServerTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    return "UTC";
  }
}

export default async function Home() {
  const [serverInfo, health, weather, deployment] = await Promise.all([
    getServerInfo(),
    getHealthStatus(),
    getWeather(),
    getDeploymentInfo(),
  ]);

  const serverTimezone = getServerTimezone();

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
