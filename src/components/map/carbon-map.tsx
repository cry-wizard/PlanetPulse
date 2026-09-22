"use client";

import { useEffect, useRef, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
  Circle,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { LocationData, fetchLocationData } from "@/lib/location-api";

// Fix Leaflet default icon issue in webpack
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

interface CarbonMapProps {
  className?: string;
  onLocationFound?: (data: LocationData) => void;
}

// Custom green marker icon
const createGreenIcon = () => {
  const icon = L.divIcon({
    className: "custom-green-marker",
    html: `
      <div style="
        width: 20px; height: 20px;
        background: #22c55e;
        border: 3px solid white;
        border-radius: 50%;
        box-shadow: 0 2px 8px rgba(34, 197, 94, 0.5);
      "></div>
    `,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
    popupAnchor: [0, -10],
  });
  return icon;
};

const GreenMarker = createGreenIcon();

// Component that updates map center when location is found
function LocationUpdater({ center }: { center: [number, number] | null }) {
  const map = useMap();

  useEffect(() => {
    if (center) {
      map.setView(center, 10);
    }
  }, [center, map]);

  return null;
}

export function CarbonMap({ className = "", onLocationFound }: CarbonMapProps) {
  const [position, setPosition] = useState<[number, number] | null>(null);
  const [locationData, setLocationData] = useState<LocationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const coords: [number, number] = [pos.coords.latitude, pos.coords.longitude];
        setPosition(coords);

        // Fetch area data
        try {
          const data = await fetchLocationData(coords[0], coords[1]);
          setLocationData(data);
          onLocationFound?.(data);
        } catch {
          // Fetch failed, but we still have the position
        }

        setLoading(false);
      },
      (err) => {
        console.warn("Geolocation error:", err.message);
        // Fallback: use IP-based location
        fetch("https://ipapi.co/json/")
          .then((r) => r.json())
          .then((data) => {
            if (data.latitude && data.longitude) {
              const coords: [number, number] = [data.latitude, data.longitude];
              setPosition(coords);
              (async () => {
                try {
                  const locData = await fetchLocationData(coords[0], coords[1]);
                  setLocationData(locData);
                  onLocationFound?.(locData);
                } catch {}
                setLoading(false);
              })();
            } else {
              setError("Could not detect your location");
              setLoading(false);
            }
          })
          .catch(() => {
            setError("Could not detect your location");
            setLoading(false);
          });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 600000,
      },
    );
  }, [onLocationFound]);

  return (
    <div className={`relative w-full h-full rounded-xl overflow-hidden ${className}`}>
      {/* Loading overlay */}
      {loading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-dark-950/80 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-dark-300">Finding your location...</p>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-dark-950/80">
          <p className="text-sm text-dark-300 text-center px-4">{error}</p>
        </div>
      )}

      {/* Map */}
      <MapContainer
        center={position || [20, 0]}
        zoom={position ? 10 : 2}
        className="w-full h-full"
        ref={(ref) => { mapRef.current = ref as any; }}
        zoomControl={true}
        attributionControl={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {position && (
          <>
            <LocationUpdater center={position} />
            <Marker position={position} icon={GreenMarker}>
              <Popup>
                <div className="text-sm">
                  <p className="font-semibold text-dark-900">Your Location</p>
                  <p className="text-dark-600 mt-1">
                    Lat: {position[0].toFixed(4)}, Lng: {position[1].toFixed(4)}
                  </p>
                  {locationData?.region && (
                    <p className="text-dark-600 mt-1">{locationData.region}</p>
                  )}
                </div>
              </Popup>
            </Marker>

            {/* Carbon intensity circle */}
            {locationData?.carbonIntensity !== undefined && (
              <Circle
                center={position}
                radius={Math.min(locationData.carbonIntensity * 1000, 50000)}
                pathOptions={{
                  color: locationData.carbonIntensity > 0.5 ? "#ef4444" : locationData.carbonIntensity > 0.3 ? "#f59e0b" : "#22c55e",
                  fillColor: locationData.carbonIntensity > 0.5 ? "#ef4444" : locationData.carbonIntensity > 0.3 ? "#f59e0b" : "#22c55e",
                  fillOpacity: 0.1,
                  weight: 1,
                }}
              >
                <Popup>
                  <p className="font-semibold">Carbon Intensity</p>
                  <p className="text-sm">{locationData.carbonIntensity.toFixed(2)} kg CO₂/kWh</p>
                </Popup>
              </Circle>
            )}
          </>
        )}
      </MapContainer>

      {/* Map legend */}
      <div className="absolute bottom-4 left-4 z-20 glass-dark rounded-lg p-3 text-xs">
        <p className="font-semibold text-dark-100 mb-1">Carbon Intensity</p>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-green-500 inline-block" />
            <span className="text-dark-300">Low (renewable)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-amber-500 inline-block" />
            <span className="text-dark-300">Medium (mixed)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-red-500 inline-block" />
            <span className="text-dark-300">High (fossil)</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CarbonMap;
