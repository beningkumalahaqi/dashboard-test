export interface HealthStatus {
  status: "healthy" | "warning" | "error";
  timestamp: string;
  uptime: number;
  environment: string;
}

export interface ServerInfo {
  nodeVersion: string;
  nextVersion: string;
  platform: string;
  architecture: string;
  memory: { rss: number; heapUsed: number; heapTotal: number };
  uptime: number;
  environment: string;
}

export interface WeatherData {
  location: string;
  temperature: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  condition: string;
  icon: string;
  high: number;
  low: number;
}

export interface DeploymentInfo {
  environment: string;
  provider: string;
  region: string;
  commitSha: string;
  commitRef: string;
  deployedAt: string;
}
