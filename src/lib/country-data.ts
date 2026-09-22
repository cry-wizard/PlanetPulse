/**
 * Country carbon & population dataset
 * Sources: Our World in Data (CO2 per capita), World Bank (population),
 * Global Carbon Atlas, IPCC AR6. Approximated to kg CO₂/kWh grid intensity
 * and annual per-capita emissions for choropleth coloring.
 *
 * Fields:
 *   carbonIntensity  — estimated grid carbon intensity (kg CO₂/kWh)
 *   co2PerCapita     — annual per-capita CO₂ emissions (tonnes/year)
 *   populationMillions — population in millions (2023 est.)
 *   renewableShare   — approximate renewable share of electricity (%)
 */
export const COUNTRIES: Record<string, {
  carbonIntensity: number;
  co2PerCapita: number;
  populationMillions: number;
  renewableShare: number;
  region: string;
}> = {
  // --- Europe ---
  "Norway":       { carbonIntensity: 0.03, co2PerCapita: 2.6,  populationMillions: 5.5,  renewableShare: 98, region: "Europe" },
  "Sweden":       { carbonIntensity: 0.04, co2PerCapita: 3.5,  populationMillions: 10.5, renewableShare: 60, region: "Europe" },
  "Finland":      { carbonIntensity: 0.06, co2PerCapita: 5.6,  populationMillions: 5.5,  renewableShare: 55, region: "Europe" },
  "Switzerland":   { carbonIntensity: 0.05, co2PerCapita: 3.3,  populationMillions: 8.8,  renewableShare: 65, region: "Europe" },
  "Denmark":      { carbonIntensity: 0.08, co2PerCapita: 4.0,  populationMillions: 5.9,  renewableShare: 70, region: "Europe" },
  "France":       { carbonIntensity: 0.06, co2PerCapita: 4.4,  populationMillions: 68.4, renewableShare: 40, region: "Europe" },
  "Belgium":      { carbonIntensity: 0.20, co2PerCapita: 7.8,  populationMillions: 11.6, renewableShare: 15, region: "Europe" },
  "Netherlands":   { carbonIntensity: 0.32, co2PerCapita: 8.6,  populationMillions: 17.6, renewableShare: 18, region: "Europe" },
  "Germany":      { carbonIntensity: 0.38, co2PerCapita: 7.7,  populationMillions: 83.3, renewableShare: 46, region: "Europe" },
  "United Kingdom": { carbonIntensity: 0.21, co2PerCapita: 5.2, populationMillions: 67.7, renewableShare: 43, region: "Europe" },
  "Spain":        { carbonIntensity: 0.18, co2PerCapita: 5.0,  populationMillions: 47.5, renewableShare: 55, region: "Europe" },
  "Italy":        { carbonIntensity: 0.22, co2PerCapita: 5.2,  populationMillions: 58.9, renewableShare: 42, region: "Europe" },
  "Poland":       { carbonIntensity: 0.70, co2PerCapita: 7.5,  populationMillions: 37.7, renewableShare: 16, region: "Europe" },
  "Austria":      { carbonIntensity: 0.14, co2PerCapita: 5.5,  populationMillions: 9.1,  renewableShare: 55, region: "Europe" },
  "Ireland":      { carbonIntensity: 0.31, co2PerCapita: 9.9,  populationMillions: 5.1,  renewableShare: 12, region: "Europe" },
  "Portugal":     { carbonIntensity: 0.20, co2PerCapita: 4.5,  populationMillions: 10.4, renewableShare: 50, region: "Europe" },
  "Greece":       { carbonIntensity: 0.38, co2PerCapita: 5.5,  populationMillions: 10.4, renewableShare: 35, region: "Europe" },
  "Czech Republic": { carbonIntensity: 0.45, co2PerCapita: 8.6, populationMillions: 10.5, renewableShare: 17, region: "Europe" },
  "Romania":      { carbonIntensity: 0.40, co2PerCapita: 4.5,  populationMillions: 19.1, renewableShare: 35, region: "Europe" },
  "Hungary":      { carbonIntensity: 0.35, co2PerCapita: 4.8,  populationMillions: 9.6,  renewableShare: 15, region: "Europe" },
  "Ukraine":      { carbonIntensity: 0.45, co2PerCapita: 3.8,  populationMillions: 38.0, renewableShare: 10, region: "Europe" },
  "Russia":       { carbonIntensity: 0.45, co2PerCapita: 11.6, populationMillions: 144.0, renewableShare: 18, region: "Europe/Asia" },
  "Turkey":       { carbonIntensity: 0.48, co2PerCapita: 5.0,  populationMillions: 85.3, renewableShare: 35, region: "Europe/Asia" },

  // --- North America ---
  "United States of America": { carbonIntensity: 0.40, co2PerCapita: 13.7, populationMillions: 341.8, renewableShare: 22, region: "North America" },
  "Canada":       { carbonIntensity: 0.10, co2PerCapita: 14.2, populationMillions: 38.0, renewableShare: 68, region: "North America" },
  "Mexico":       { carbonIntensity: 0.50, co2PerCapita: 3.5,  populationMillions: 128.9, renewableShare: 22, region: "North America" },

  // --- South America ---
  "Brazil":       { carbonIntensity: 0.09, co2PerCapita: 2.2,  populationMillions: 216.4, renewableShare: 89, region: "South America" },
  "Argentina":    { carbonIntensity: 0.30, co2PerCapita: 4.0,  populationMillions: 45.8, renewableShare: 35, region: "South America" },
  "Chile":        { carbonIntensity: 0.30, co2PerCapita: 2.5,  populationMillions: 19.6, renewableShare: 45, region: "South America" },
  "Colombia":     { carbonIntensity: 0.20, co2PerCapita: 1.9,  populationMillions: 52.1, renewableShare: 70, region: "South America" },
  "Peru":         { carbonIntensity: 0.25, co2PerCapita: 1.5,  populationMillions: 34.0, renewableShare: 55, region: "South America" },

  // --- Asia ---
  "China":        { carbonIntensity: 0.62, co2PerCapita: 8.0,  populationMillions: 1425.7, renewableShare: 31, region: "Asia" },
  "India":        { carbonIntensity: 0.72, co2PerCapita: 1.9,  populationMillions: 1428.6, renewableShare: 22, region: "Asia" },
  "Japan":        { carbonIntensity: 0.47, co2PerCapita: 8.3,  populationMillions: 123.3, renewableShare: 22, region: "Asia" },
  "South Korea":  { carbonIntensity: 0.55, co2PerCapita: 11.8, populationMillions: 51.7, renewableShare: 8,  region: "Asia" },
  "Indonesia":    { carbonIntensity: 0.65, co2PerCapita: 2.1,  populationMillions: 277.5, renewableShare: 12, region: "Asia" },
  "Thailand":     { carbonIntensity: 0.45, co2PerCapita: 4.3,  populationMillions: 71.8, renewableShare: 18, region: "Asia" },
  "Vietnam":      { carbonIntensity: 0.58, co2PerCapita: 2.5,  populationMillions: 98.2, renewableShare: 20, region: "Asia" },
  "Malaysia":     { carbonIntensity: 0.50, co2PerCapita: 7.0,  populationMillions: 34.3, renewableShare: 15, region: "Asia" },
  "Singapore":    { carbonIntensity: 0.42, co2PerCapita: 9.0,  populationMillions: 5.9,  renewableShare: 5,  region: "Asia" },
  "Philippines":  { carbonIntensity: 0.55, co2PerCapita: 1.3,  populationMillions: 117.3, renewableShare: 25, region: "Asia" },
  "Bangladesh":   { carbonIntensity: 0.68, co2PerCapita: 0.6,  populationMillions: 172.9, renewableShare: 5,  region: "Asia" },
  "Pakistan":     { carbonIntensity: 0.65, co2PerCapita: 1.0,  populationMillions: 240.5, renewableShare: 35, region: "Asia" },
  "Myanmar":      { carbonIntensity: 0.35, co2PerCapita: 0.5,  populationMillions: 54.0, renewableShare: 35, region: "Asia" },
  "Kazakhstan":   { carbonIntensity: 0.55, co2PerCapita: 14.0, populationMillions: 19.0, renewableShare: 12, region: "Asia" },
  "Saudi Arabia":  { carbonIntensity: 0.65, co2PerCapita: 17.6, populationMillions: 36.0, renewableShare: 1,  region: "Asia" },
  "Iran":         { carbonIntensity: 0.58, co2PerCapita: 7.5,  populationMillions: 89.0, renewableShare: 5,  region: "Asia" },
  "Iraq":         { carbonIntensity: 0.60, co2PerCapita: 4.0,  populationMillions: 45.0, renewableShare: 3,  region: "Asia" },
  "Israel":       { carbonIntensity: 0.40, co2PerCapita: 7.0,  populationMillions: 9.5,  renewableShare: 12, region: "Asia" },
  "United Arab Emirates": { carbonIntensity: 0.55, co2PerCapita: 15.0, populationMillions: 10.2, renewableShare: 5, region: "Asia" },

  // --- Oceania ---
  "Australia":    { carbonIntensity: 0.25, co2PerCapita: 14.8, populationMillions: 25.7, renewableShare: 35, region: "Oceania" },
  "New Zealand":  { carbonIntensity: 0.08, co2PerCapita: 3.0,  populationMillions: 5.1,  renewableShare: 85, region: "Oceania" },

  // --- Africa ---
  "South Africa": { carbonIntensity: 0.85, co2PerCapita: 7.5,  populationMillions: 60.4, renewableShare: 10, region: "Africa" },
  "Nigeria":      { carbonIntensity: 0.60, co2PerCapita: 0.4,  populationMillions: 223.8, renewableShare: 15, region: "Africa" },
  "Egypt":        { carbonIntensity: 0.65, co2PerCapita: 2.0,  populationMillions: 112.7, renewableShare: 5,  region: "Africa" },
  "Kenya":        { carbonIntensity: 0.30, co2PerCapita: 0.3,  populationMillions: 55.1, renewableShare: 90, region: "Africa" },
  "Ethiopia":     { carbonIntensity: 0.10, co2PerCapita: 0.1,  populationMillions: 123.0, renewableShare: 95, region: "Africa" },
  "Morocco":      { carbonIntensity: 0.25, co2PerCapita: 1.8,  populationMillions: 37.0, renewableShare: 35, region: "Africa" },
  "Algeria":      { carbonIntensity: 0.55, co2PerCapita: 3.5,  populationMillions: 45.0, renewableShare: 5,  region: "Africa" },
  "Angola":       { carbonIntensity: 0.45, co2PerCapita: 1.5,  populationMillions: 35.0, renewableShare: 55, region: "Africa" },
  "Ghana":        { carbonIntensity: 0.40, co2PerCapita: 1.0,  populationMillions: 33.0, renewableShare: 35, region: "Africa" },
  "Tanzania":     { carbonIntensity: 0.20, co2PerCapita: 0.1,  populationMillions: 65.0, renewableShare: 60, region: "Africa" },
  "Democratic Republic of the Congo": { carbonIntensity: 0.05, co2PerCapita: 0.05, populationMillions: 102.0, renewableShare: 98, region: "Africa" },

  // --- Middle East ---
  "Qatar":        { carbonIntensity: 0.60, co2PerCapita: 35.0, populationMillions: 2.7,  renewableShare: 5,  region: "Middle East" },
  "Kuwait":       { carbonIntensity: 0.62, co2PerCapita: 20.0, populationMillions: 4.3,  renewableShare: 2,  region: "Middle East" },
  "Oman":         { carbonIntensity: 0.58, co2PerCapita: 14.0, populationMillions: 4.6,  renewableShare: 3,  region: "Middle East" },
  "Bahrain":      { carbonIntensity: 0.58, co2PerCapita: 18.0, populationMillions: 1.8,  renewableShare: 2,  region: "Middle East" },

  // --- Central Asia ---
  "Uzbekistan":   { carbonIntensity: 0.55, co2PerCapita: 3.5,  populationMillions: 35.0, renewableShare: 10, region: "Central Asia" },
  "Turkmenistan": { carbonIntensity: 0.60, co2PerCapita: 5.0,  populationMillions: 6.3,  renewableShare: 5,  region: "Central Asia" },

  // --- Caucasus ---
  "Georgia":      { carbonIntensity: 0.30, co2PerCapita: 3.0,  populationMillions: 3.7,  renewableShare: 45, region: "Caucasus" },
  "Armenia":      { carbonIntensity: 0.35, co2PerCapita: 3.5,  populationMillions: 2.8,  renewableShare: 35, region: "Caucasus" },
  "Azerbaijan":   { carbonIntensity: 0.40, co2PerCapita: 4.0,  populationMillions: 10.3, renewableShare: 15, region: "Caucasus" },
};

/** Countries with no data — will appear grey on map */
export const UNMAPPED_COUNTRIES = new Set<string>();

/** Get country data, returning a default "no data" placeholder for unknown countries */
export function getCountryData(countryName: string): (typeof COUNTRIES)[string] | null {
  const data = COUNTRIES[countryName];
  if (!data) return null;
  return data;
}

/** Get carbon intensity color based on value (kg CO₂/kWh) */
export function getCarbonColor(intensity: number): string {
  if (intensity <= 0.05) return "#0a2e1a";       // very dark green
  if (intensity <= 0.10) return "#15803d";        // dark green
  if (intensity <= 0.20) return "#22c55e";        // green
  if (intensity <= 0.30) return "#86efac";        // light green
  if (intensity <= 0.40) return "#fcd34d";        // yellow
  if (intensity <= 0.55) return "#f59e0b";        // amber
  if (intensity <= 0.70) return "#f97316";        // orange
  return "#ef4444";                                 // red
}

/** Get CO2 per capita color based on tonnes/year */
export function getEmissionsColor(tonnes: number): string {
  if (tonnes <= 1) return "#0a2e1a";
  if (tonnes <= 2.5) return "#15803d";
  if (tonnes <= 5) return "#22c55e";
  if (tonnes <= 7.5) return "#86efac";
  if (tonnes <= 10) return "#fcd34d";
  if (tonnes <= 15) return "#f59e0b";
  if (tonnes <= 20) return "#f97316";
  return "#ef4444";
}