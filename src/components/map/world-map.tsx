"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { MapContainer, TileLayer, useMap, Marker, Popup, Circle } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { getCountryData, getCarbonColor, getEmissionsColor, COUNTRIES } from "@/lib/country-data";
import { LocationData, fetchLocationData } from "@/lib/location-api";

// Fix Leaflet default icon issue in webpack
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

interface WorldMapProps {
  className?: string;
}

// ─── User location marker (green pulse) ───────────────────────────────
const createUserMarkerIcon = () =>
  L.divIcon({
    className: "user-location-marker",
    html: `
      <div style="
        width: 28px; height: 28px;
        background: radial-gradient(circle, #22c55e 0%, #16a34a 60%, transparent 70%);
        border: 3px solid white;
        border-radius: 50%;
        box-shadow: 0 0 0 4px rgba(34,197,94,0.3), 0 4px 12px rgba(0,0,0,0.4);
        animation: pulse-marker 2s ease-in-out infinite;
      "></div>
      <div style="
        position: absolute; top: 50%; left: 50%;
        width: 10px; height: 10px;
        background: white;
        border-radius: 50%;
        transform: translate(-50%, -50%);
      "></div>
    `,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -18],
  });

// ─── GeoJSON country polygons with choropleth coloring ────────────────
const WORLD_GEOJSON_URL =
  "https://raw.githubusercontent.com/johan/world.plus/master/countries/mapped/features.json";

function GeoJSONLayer({ userCountry }: { userCountry: string | null }) {
  const map = useMap();

  useEffect(() => {
    if (!map) return;

    const geoLayer = L.geoJSON(null, {
      style: (feature) => {
        const props = feature?.properties;
        const name =
          props?.name || props?.ADMIN || props?.NAME || props?.sovereignt || props?.SOVEREIGNT || "";

        const data = getCountryData(name);
        const color =
          data && data.carbonIntensity !== undefined
            ? getCarbonColor(data.carbonIntensity)
            : "#374151";

        return {
          fillColor: color,
          fillOpacity: userCountry && name === userCountry ? 0.55 : 0.35,
          color: userCountry && name === userCountry ? "#fbbf24" : "rgba(255,255,255,0.15)",
          weight: userCountry && name === userCountry ? 3 : 0.8,
          opacity: 0.9,
          dashArray: userCountry && name === userCountry ? "4 4" : undefined,
        };
      },
      onEachFeature: (feature, layer) => {
        const props = feature?.properties as any;
        // GeoJSON 속성에서 국가 이름 추출 (여러 데이터셋 호환)
        const name =
          props?.name ||
          props?.ADMIN ||
          props?.NAME ||
          props?.sovereignt ||
          props?.SOVEREIGNT ||
          props?.formal_en ||
          props?.FORMAL_EN ||
          props?.gwname ||
          props?.LABEL ||
          "";

        // country-data.ts에서 데이터 조회
        const data = getCountryData(name);

        // 툴팁 항상 바인딩 (데이터가 없어도 빈 툴팁)
        const tooltipHtml = data && data.carbonIntensity !== undefined
          ? `<div style="font-family:'Inter',sans-serif;font-size:12px;line-height:1.4;min-width:140px;">
              <div style="font-weight:600;color:#f1f5f9;margin-bottom:2px;">${name}</div>
              <div style="color:#94a3b8;">Grid: <b style="color:#22c55e;">${data.carbonIntensity.toFixed(2)}</b> kg CO₂/kWh</div>
              <div style="color:#94a3b8;">Per capita: <b style="color:#f59e0b;">${data.co2PerCapita.toFixed(1)}</b> t/yr</div>
              <div style="color:#94a3b8;">Pop: <b style="color:#4ade80;">${data.populationMillions.toFixed(1)}M</b></div>
            </div>`
          : `<div style="font-family:'Inter',sans-serif;font-size:12px;color:#94a3b8;">${name}</div>`;

        layer.bindTooltip(tooltipHtml, {
          direction: "top",
          offset: [0, -4],
          className: "country-tooltip",
        });

        layer.on("click", () => {
          // 클릭 시 맵 이벤트로 처리
        });

        layer.on("mouseover", (e) => {
          if (!userCountry || name !== userCountry) {
            (e.target as L.Path).setStyle({ fillOpacity: 0.55, weight: 1.5 });
          }
          // Glow on hover
          (e.target as L.Path).bringToFront();
        });
        layer.on("mouseout", (e) => {
          if (!userCountry || name !== userCountry) {
            (e.target as L.Path).setStyle({ fillOpacity: 0.35, weight: 0.8 });
          }
        });
      },
    });

    fetch(WORLD_GEOJSON_URL)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((geojson) => {
        if (geojson && geojson.features) {
          geoLayer.addData(geojson);
        }
      })
      .catch(() => {
        // Safe silent fallback: map still functions with markers, tiles, and population bubbles
      });

    return () => {
      geoLayer.clearLayers();
    };
  }, [map, userCountry]);

  return null;
}

// ─── Population bubbles ────────────────────────────────────────────────
const countryLatLng: Record<string, [number, number]> = {
  "United States of America": [38, -98],
  "China": [35, 105],
  "India": [22, 78],
  "Brazil": [-10, -55],
  "Russia": [60, 90],
  "Japan": [36, 138],
  "Mexico": [23, -102],
  "Germany": [51, 10],
  "United Kingdom": [54, -2],
  "France": [46, 2],
  "Italy": [42, 12],
  "South Africa": [-30, 25],
  "Egypt": [26, 30],
  "Turkey": [39, 35],
  "Iran": [32, 53],
  "Thailand": [15, 101],
  "South Korea": [36, 128],
  "Australia": [-25, 135],
  "Canada": [56, -106],
  "Spain": [40, -3],
  "Argentina": [-34, -64],
  "Algeria": [28, 3],
  "Poland": [52, 20],
  "Indonesia": [-5, 120],
  "Saudi Arabia": [24, 45],
  "Ukraine": [49, 31],
  "Nigeria": [9, 8],
  "Morocco": [32, -6],
  "Iraq": [33, 43],
  "Afghanistan": [33, 65],
  "Malaysia": [4, 102],
  "Peru": [-10, -75],
  "Angola": [-10, 20],
  "Mozambique": [-19, 35],
  "Venezuela": [7, -65],
  "Philippines": [13, 122],
  "Ghana": [7, -2],
  "Nepal": [28, 84],
  "Yemen": [15, 48],
  "North Korea": [40, 127],
  "Taiwan": [24, 121],
  "Vietnam": [16, 108],
  "Burkina Faso": [13, -2],
  "Mali": [17, -4],
  "Niger": [17, 8],
  "Malawi": [-13, 34],
  "Chile": [-36, -71],
  "Kazakhstan": [48, 68],
  "Zambia": [-13, 28],
};

function PopulationBubbles() {
  const map = useMap();

  useEffect(() => {
    if (!map) return;

    const bubbleData = Object.entries(COUNTRIES)
      .filter(([, d]) => d.populationMillions >= 10)
      .map(([name, d]) => ({
        name,
        lat: countryLatLng[name]?.[0] ?? 0,
        lng: countryLatLng[name]?.[1] ?? 0,
        pop: d.populationMillions,
        carbon: d.carbonIntensity,
        co2pc: d.co2PerCapita,
      }))
      .sort((a, b) => b.pop - a.pop)
      .slice(0, 40);

    bubbleData.forEach((b) => {
      if (b.lat === 0 && b.lng === 0) return;

      const radius = Math.max(4, Math.min(20, b.pop / 15));
      const color = getCarbonColor(b.carbon);

      L.circleMarker([b.lat, b.lng], {
        radius,
        fillColor: color,
        fillOpacity: 0.5,
        color: "rgba(255,255,255,0.3)",
        weight: 0.5,
      })
        .bindTooltip(
          `<div style="font-family:'Inter',sans-serif;font-size:11px;line-height:1.3;min-width:100px;">
            <b style="color:#f1f5f9;">${b.name}</b><br>
            <span style="color:#94a3b8;">Pop: ${b.pop.toFixed(0)}M</span><br>
            <span style="color:#94a3b8;">Grid: ${b.carbon.toFixed(2)} kg CO₂/kWh</span>
          </div>`,
          { direction: "top", className: "bubble-tooltip" }
        )
        .addTo(map);
    });
  }, [map]);

  return null;
}

const createUserCountryMarkerIcon = () =>
  L.divIcon({
    className: "user-country-marker",
    html: `<div style="
      width:16px;height:16px;
      background:#fbbf24;
      border:2px solid white;
      border-radius:50%;
      box-shadow:0 0 8px rgba(251,191,36,0.5);
    "></div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  });

export function WorldMap({ className = "" }: WorldMapProps) {
  const [position, setPosition] = useState<[number, number] | null>(null);
  const [userCountry, setUserCountry] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const mapRef = useRef<L.Map | null>(null);

  const locateUser = useCallback(() => {
    if (!navigator.geolocation) {
      setError("Geolocation not supported");
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const coords: [number, number] = [pos.coords.latitude, pos.coords.longitude];
        setPosition(coords);

        try {
          const data = await fetchLocationData(coords[0], coords[1]);
          if (data.country) setUserCountry(data.country);
        } catch {}
        setLoading(false);
      },
      () => {
        fetch("https://ipapi.co/json/")
          .then((r) => r.json())
          .then((d) => {
            if (d.latitude && d.longitude) {
              const coords: [number, number] = [d.latitude, d.longitude];
              setPosition(coords);
              (async () => {
                try {
                  const data = await fetchLocationData(coords[0], coords[1]);
                  if (data.country) setUserCountry(data.country);
                } catch {}
                setLoading(false);
              })();
            } else {
              setError("No location found");
              setLoading(false);
            }
          })
          .catch(() => {
            setError("Location unavailable");
            setLoading(false);
          });
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 600000 }
    );
  }, []);

  useEffect(() => {
    locateUser();
  }, [locateUser]);

  return (
    <div className={`relative w-full h-full rounded-xl overflow-hidden ${className}`}>
      {/* Map */}
      <MapContainer
        center={position ?? [20, 0]}
        zoom={position ? 5 : 2}
        className="w-full h-full"
        ref={(ref) => { mapRef.current = ref as any; }}
        zoomControl={true}
        attributionControl={true}
        fadeAnimation={true}
        zoomAnimation={true}
        markerZoomAnimation={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.esri.com/">Esri</a> &mdash; World Dark Gray Canvas'
          url="https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}"
        />

        {/* Country choropleth */}
        <GeoJSONLayer userCountry={userCountry} />

        {/* Population bubbles */}
        <PopulationBubbles />

        {/* User location */}
        {position && (
          <Marker position={position} icon={createUserMarkerIcon()}>
            <Popup>
              <div style={{ fontFamily: "'Inter',sans-serif", minWidth: 160 }}>
                <div style={{ fontWeight: 700, color: "#f1f5f9", fontSize: 13 }}>Your Location</div>
                <div style={{ color: "#94a3b8", fontSize: 11, marginTop: 2 }}>
                  {position[0].toFixed(4)}, {position[1].toFixed(4)}
                </div>
                {userCountry && (
                  <div style={{ color: "#22c55e", fontSize: 11, marginTop: 2 }}>{userCountry}</div>
                )}
              </div>
            </Popup>
          </Marker>
        )}

        {/* User country marker */}
        {userCountry && countryLatLng[userCountry] && (
          <Marker
            position={countryLatLng[userCountry]}
            icon={createUserCountryMarkerIcon()}
          >
            <Popup>
              <div style={{ fontFamily: "'Inter',sans-serif" }}>
                <div style={{ fontWeight: 700, color: "#fbbf24", fontSize: 12 }}>{userCountry}</div>
              </div>
            </Popup>
          </Marker>
        )}
      </MapContainer>

      {/* Loading overlay */}
      {loading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-dark-950/80 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-dark-300">Finding your location...</p>
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="absolute bottom-4 left-4 z-20 glass-dark rounded-lg p-3 text-xs max-w-[180px]">
        <p className="font-semibold text-dark-100 mb-2 text-[11px] uppercase tracking-wider">
          Carbon Intensity
        </p>
        <div className="space-y-1.5">
          {[
            { label: "Very Low", color: "#0a2e1a" },
            { label: "Low", color: "#15803d" },
            { label: "Moderate", color: "#22c55e" },
            { label: "Mixed", color: "#fcd34d" },
            { label: "High", color: "#f59e0b" },
            { label: "Very High", color: "#ef4444" },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-2">
              <span
                className="w-2.5 h-2.5 rounded-full inline-block shrink-0"
                style={{ background: item.color }}
              />
              <span className="text-dark-300 text-[10px]">{item.label}</span>
            </div>
          ))}
        </div>
        <p className="text-[10px] text-dark-500 mt-2 pt-2 border-t border-white/5">
          Bubble size = population · Color = grid carbon intensity
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-dark-950/80">
          <p className="text-sm text-dark-300 text-center px-4">{error}</p>
        </div>
      )}
    </div>
  );
}

export default WorldMap;