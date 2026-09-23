import type { WeatherData } from "@/lib/types";

interface GeoResult {
  name: string;
  latitude: number;
  longitude: number;
  country?: string;
}

interface IPGeoResponse {
  status: string;
  city: string;
  country: string;
  lat: number;
  lon: number;
}

interface OpenMeteoCurrent {
  temperature_2m: number;
  relative_humidity_2m: number;
  apparent_temperature: number;
  weather_code: number;
  wind_speed_10m: number;
}

interface OpenMeteoDaily {
  temperature_2m_max: number[];
  temperature_2m_min: number[];
}

interface OpenMeteoResponse {
  current: OpenMeteoCurrent;
  daily: OpenMeteoDaily;
  timezone: string;
}

/**
 * Map WMO weather codes to lucide-react icon names and condition strings.
 */
function mapWMO(code: number): { condition: string; icon: string } {
  if (code === 0) return { condition: "Clear Sky", icon: "sun" };
  if (code === 1) return { condition: "Mainly Clear", icon: "sun" };
  if (code === 2) return { condition: "Partly Cloudy", icon: "cloud-sun" };
  if (code === 3) return { condition: "Overcast", icon: "cloud" };
  if (code === 45 || code === 48)
    return { condition: "Fog", icon: "cloud-fog" };
  if (code >= 51 && code <= 57)
    return { condition: "Drizzle", icon: "cloud-drizzle" };
  if (code >= 61 && code <= 67)
    return { condition: "Rain", icon: "cloud-rain" };
  if (code >= 71 && code <= 77)
    return { condition: "Snow", icon: "cloud-snow" };
  if (code >= 80 && code <= 82)
    return { condition: "Rain Showers", icon: "cloud-rain" };
  if (code >= 85 && code <= 86)
    return { condition: "Snow Showers", icon: "cloud-snow" };
  if (code >= 95) return { condition: "Thunderstorm", icon: "cloud-lightning" };
  return { condition: "Unknown", icon: "cloud" };
}

/**
 * Detect the server's location from its public IP address.
 * Uses ip-api.com (free, no API key, 45 req/min).
 */
async function detectLocationFromIP(): Promise<{
  name: string;
  lat: number;
  lon: number;
} | null> {
  try {
    const res = await fetch("http://ip-api.com/json/?fields=status,city,country,lat,lon", {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;

    const data: IPGeoResponse = await res.json();
    if (data.status !== "success" || !data.city) return null;

    return {
      name: `${data.city}, ${data.country}`,
      lat: data.lat,
      lon: data.lon,
    };
  } catch {
    return null;
  }
}

/**
 * Resolve a location name to coordinates via Open-Meteo geocoding.
 */
async function geocode(location: string): Promise<GeoResult | null> {
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(location)}&count=1&language=en`;
  const res = await fetch(url);
  if (!res.ok) return null;

  const data = await res.json();
  const results: GeoResult[] = data.results;
  return results?.[0] ?? null;
}

/**
 * Fetch current weather from Open-Meteo (free, no API key).
 * Location is auto-detected from server IP.
 * Override with WEATHER_LOCATION env var.
 */
export async function getWeather(): Promise<WeatherData | null> {
  try {
    let location: { name: string; lat: number; lon: number } | null = null;

    // 1. Check env override first
    const envLocation = process.env.WEATHER_LOCATION;
    if (envLocation) {
      const geo = await geocode(envLocation);
      if (geo) {
        location = {
          name: `${geo.name}${geo.country ? `, ${geo.country}` : ""}`,
          lat: geo.latitude,
          lon: geo.longitude,
        };
      }
    }

    // 2. Auto-detect from server IP
    if (!location) {
      location = await detectLocationFromIP();
    }

    if (!location) return null;

    const url = new URL("https://api.open-meteo.com/v1/forecast");
    url.searchParams.set("latitude", String(location.lat));
    url.searchParams.set("longitude", String(location.lon));
    url.searchParams.set(
      "current",
      "temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m",
    );
    url.searchParams.set("daily", "temperature_2m_max,temperature_2m_min");
    url.searchParams.set("timezone", "auto");
    url.searchParams.set("forecast_days", "1");

    const res = await fetch(url.toString(), { next: { revalidate: 900 } });
    if (!res.ok) return null;

    const data: OpenMeteoResponse = await res.json();
    const { condition, icon } = mapWMO(data.current.weather_code);

    return {
      location: location.name,
      temperature: Math.round(data.current.temperature_2m),
      feelsLike: Math.round(data.current.apparent_temperature),
      humidity: data.current.relative_humidity_2m,
      windSpeed: Math.round(data.current.wind_speed_10m),
      condition,
      icon,
      high: Math.round(data.daily.temperature_2m_max[0]),
      low: Math.round(data.daily.temperature_2m_min[0]),
    };
  } catch {
    return null;
  }
}
