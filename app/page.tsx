import { Dashboard } from "@/components/dashboard/dashboard";
import { getServerInfo, getHealthStatus } from "@/lib/server-info";
import { getWeather } from "@/lib/weather";
import { getDeploymentInfo } from "@/lib/deployment";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [serverInfo, health, weather, deployment] = await Promise.all([
    getServerInfo(),
    getHealthStatus(),
    getWeather(),
    getDeploymentInfo(),
  ]);

  return (
    <Dashboard
      health={health}
      server={serverInfo}
      weather={weather}
      deployment={deployment}
    />
  );
}
