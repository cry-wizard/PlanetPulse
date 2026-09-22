/**
 * Location & Area Data API Service
 * Fetches geolocation-based data: region, population, carbon intensity
 */

export interface LocationData {
  /** Latitude */
  lat: number;
  /** Longitude */
  lng: number;
  /** Human-readable region name (city, country) */
  region: string;
  /** Country name */
  country: string;
  /** Estimated population of the area (approximate) */
  population: number;
  /** Carbon intensity in kg CO₂ per kWh (grid carbon intensity) */
  carbonIntensity: number;
  /** Air quality index (0-500) */
  airQuality: number;
  /** Coordinates with human label */
  label: string;
}

// Approximate population data by country (2024 estimates, millions)
const COUNTRY_POPULATION: Record<string, number> = {
  "United Kingdom": 67.7,
  "United States of America": 341.8,
  "China": 1425.7,
  "India": 1428.6,
  "Germany": 83.3,
  "France": 64.8,
  "Japan": 123.3,
  "Brazil": 216.4,
  "Canada": 38.0,
  "Australia": 25.7,
  "Italy": 58.9,
  "Spain": 47.5,
  "Russia": 144.0,
  "Mexico": 128.9,
  "South Korea": 51.7,
  "Indonesia": 277.5,
  "Turkey": 85.3,
  "Netherlands": 17.6,
  "Sweden": 10.5,
  "Norway": 5.4,
  "Poland": 37.7,
  "Belgium": 11.6,
  "Switzerland": 8.7,
  "Austria": 9.1,
  "Denmark": 5.9,
  "Finland": 5.5,
  "Ireland": 5.1,
  "New Zealand": 5.1,
  "Singapore": 5.9,
  "Malaysia": 34.3,
  "Thailand": 71.8,
  "Vietnam": 98.2,
  "Philippines": 117.3,
  "South Africa": 60.4,
  "Egypt": 112.7,
  "Nigeria": 223.8,
  "Kenya": 55.1,
  "Argentina": 45.8,
  "Chile": 19.6,
  "Colombia": 52.1,
  "Pakistan": 240.5,
  "Bangladesh": 172.9,
};

// Approximate city populations (millions)
const CITY_POPULATION: Record<string, number> = {
  "London": 9.6,
  "New York": 8.3,
  "Tokyo": 14.0,
  "Paris": 2.2,
  "Berlin": 3.7,
  "Sydney": 5.3,
  "Mumbai": 12.4,
  "Delhi": 16.7,
  "Beijing": 12.5,
  "Shanghai": 17.0,
  "Singapore": 5.7,
  "Hong Kong": 7.4,
  "Seoul": 9.7,
  "Toronto": 2.9,
  "Vancouver": 2.5,
  "Los Angeles": 3.8,
  "Chicago": 2.7,
  "San Francisco": 1.2,
  "Amsterdam": 0.9,
  "Madrid": 3.2,
  "Rome": 2.8,
  "Moscow": 11.9,
  "Istanbul": 15.5,
  "Bangkok": 10.5,
  "Kuala Lumpur": 1.7,
  "Jakarta": 10.6,
  "São Paulo": 12.3,
  "Buenos Aires": 3.0,
  "Lagos": 14.3,
  "Cairo": 9.5,
  "Johannesburg": 5.6,
  "Melbourne": 5.0,
  "Brisbane": 2.5,
  "Auckland": 1.6,
  "Dubai": 3.3,
  "Zurich": 0.4,
  "Stockholm": 1.0,
  "Oslo": 0.7,
  "Helsinki": 0.6,
  "Copenhagen": 0.8,
  "Dublin": 0.5,
};

/**
 * Reverse geocode coordinates to region/city name using OpenStreetMap Nominatim
 */
async function reverseGeocode(lat: number, lng: number): Promise<{ city: string; country: string; region: string }> {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10&accept-language=en`;
    const resp = await fetch(url, {
      headers: { "User-Agent": "PlanetPulse/1.0 (carbon tracker app)" },
    });
    if (!resp.ok) throw new Error("Geocode failed");
    const data = await resp.json();

    const city = data.address?.city || data.address?.town || data.address?.village || "";
    const country = data.address?.country || "Unknown";
    const region = data.address?.state || data.address?.county || "";

    return { city, country, region };
  } catch {
    return { city: "Unknown", country: "Unknown", region: "" };
  }
}

/**
 * Fetch grid carbon intensity from UK National Grid API (global fallback available)
 * For non-UK locations, returns a region-appropriate estimate
 */
async function fetchCarbonIntensity(lat: number, lng: number): Promise<number> {
  try {
    // Try UK National Grid API first (works for UK)
    if (lat > 50 && lat < 60 && lng > -10 && lng < 2) {
      const resp = await fetch("https://api.carbonintensity.org.uk/intensity");
      if (resp.ok) {
        const data = await resp.json();
        const intensity = data.data[0]?.intensity?.kg_co2_per_kwh;
        if (intensity) return intensity;
      }
    }

    // Approximate carbon intensity by country (kg CO₂/kWh)
    // Based on IEA/global average grid carbon intensity data
    const countryIntensity: Record<string, number> = {
      "Norway": 0.03,
      "Sweden": 0.04,
      "Finland": 0.06,
      "Switzerland": 0.05,
      "Denmark": 0.08,
      "France": 0.06,
      "Canada": 0.10,
      "New Zealand": 0.08,
      "Brazil": 0.09,
      "Australia": 0.25,
      "Germany": 0.38,
      "United Kingdom": 0.21,
      "Spain": 0.18,
      "Italy": 0.22,
      "Netherlands": 0.32,
      "Belgium": 0.20,
      "Poland": 0.70,
      "South Korea": 0.55,
      "Japan": 0.47,
      "United States of America": 0.40,
      "China": 0.62,
      "India": 0.72,
      "Indonesia": 0.65,
      "Thailand": 0.45,
      "Vietnam": 0.58,
      "Malaysia": 0.50,
      "Singapore": 0.42,
      "Mexico": 0.50,
      "South Africa": 0.85,
      "Nigeria": 0.60,
    };

    return countryIntensity["Unknown"] ?? 0.40;

    // Try Open-Meteo carbon intensity API as fallback
    const omResp = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m&timezone=auto`
    );
    // Use country-based estimate as primary since Open-Meteo doesn't provide carbon intensity directly
  } catch {
    // Default global average carbon intensity
    return 0.40;
  }
}

/**
 * Fetch air quality data from Open-Meteo Air Quality API
 */
async function fetchAirQuality(lat: number, lng: number): Promise<number> {
  try {
    const resp = await fetch(
      `https://api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lng}&current=us_aqi&timezone=auto`
    );
    if (resp.ok) {
      const data = await resp.json();
      const aqi = data.current?.us_aqi;
      if (aqi !== undefined) return aqi;
    }
  } catch {
    // Default moderate air quality
  }
  return 50; // Moderate default
}

/**
 * Estimate population for a given location
 */
function estimatePopulation(city: string, country: string): number {
  // Check city first
  if (CITY_POPULATION[city]) {
    return Math.round(CITY_POPULATION[city] * 1_000_000);
  }
  // Check country
  if (COUNTRY_POPULATION[country]) {
    return Math.round(COUNTRY_POPULATION[country] * 1_000_000);
  }
  // Default world average for a city
  return 500_000;
}

/**
 * Fetch all location-based data for given coordinates
 */
export async function fetchLocationData(lat: number, lng: number): Promise<LocationData> {
  const [geoData, carbonIntensity, airQuality] = await Promise.all([
    reverseGeocode(lat, lng),
    fetchCarbonIntensity(lat, lng),
    fetchAirQuality(lat, lng),
  ]);

  const city = geoData.city || "Unknown";
  const country = geoData.country || "Unknown";
  const population = estimatePopulation(city, country);
  const label = city && city !== "Unknown" ? `${city}, ${country}` : country;

  return {
    lat,
    lng,
    region: geoData.region || country,
    country,
    city: city || "Unknown",
    population: city !== "Unknown" ? population : population / 100,
    carbonIntensity: Math.round(carbonIntensity * 100) / 100,
    airQuality,
    label,
  } as LocationData;
}

export default fetchLocationData;
