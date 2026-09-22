const API_BASE = "https://api.carbonintensity.org.uk";
const CACHE_KEY = "planetpulse_grid_cache";
const CACHE_DURATION_MS = 10 * 60 * 1000; // 10 minutes

export interface GridIntensityResponse {
  data: Array<{
    intensity: {
      actual: number;
      forecast: number;
      index: string;
      description: string;
    };
  }>;
}

export interface GridIntensity {
  actual: number;   // gCO₂/kWh
  forecast: number; // gCO₂/kWh
  index: string;
  description: string;
  fetchedAt: number;
}

/**
 * Fetch live grid carbon intensity from UK National Grid API.
 * Returns null if the API is unreachable (graceful degradation).
 */
export async function fetchGridIntensity(): Promise<GridIntensity | null> {
  // Check cache first
  const cached = getCache();
  if (cached && Date.now() - cached.fetchedAt < CACHE_DURATION_MS) {
    return cached;
  }

  try {
    const response = await fetch(`${API_BASE}/intensity`);
    if (!response.ok) return null;

    const json = (await response.json()) as GridIntensityResponse;
    const data = json.data[0]?.intensity;
    if (!data) return null;

    const intensity: GridIntensity = {
      actual: data.actual,
      forecast: data.forecast ?? data.actual,
      index: data.index,
      description: data.description,
      fetchedAt: Date.now(),
    };

    setCache(intensity);
    return intensity;
  } catch {
    return null;
  }
}

// --- Cache helpers (in-memory for SSR safety + localStorage for client) ---
const memoryCache: { data: GridIntensity | null; ts: number } | null = null;

function getCache(): GridIntensity | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as GridIntensity;
  } catch {
    return null;
  }
}

function setCache(intensity: GridIntensity): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(intensity));
  } catch {
    // ignore
  }
}

/**
 * Get a descriptive label for the current grid intensity.
 */
export function describeIntensity(intensity: number): string {
  if (intensity < 100) return "very low";
  if (intensity < 200) return "low";
  if (intensity < 300) return "moderate";
  if (intensity < 400) return "high";
  if (intensity < 500) return "very high";
  return "extremely high";
}

/**
 * Format grid intensity for display.
 */
export function formatGridIntensity(intensity: GridIntensity): string {
  const diff = intensity.forecast - intensity.actual;
  const diffLabel = diff > 0 ? `forecasted to rise to ${intensity.forecast} gCO₂/kWh` :
    diff < 0 ? `forecasted to drop to ${intensity.forecast} gCO₂/kWh` :
    "stable";
  return `${intensity.actual} gCO₂/kWh — ${intensity.description} (${diffLabel})`;
}
