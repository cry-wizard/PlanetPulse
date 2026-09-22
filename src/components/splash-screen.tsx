"use client";

import { useEffect, useState } from "react";
import { Earth } from "lucide-react";

export function SplashScreen({ onComplete }: { onComplete: () => void }) {
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setFading(true);
      setTimeout(() => {
        onComplete();
      }, 700);
    }, 2600);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div
      onClick={() => {
        setFading(true);
        setTimeout(onComplete, 300);
      }}
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-dark-950/40 backdrop-blur-[1px] transition-opacity duration-700 select-none cursor-pointer ${
        fading ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
    >
      {/* Subtle Space Vignette that lets 3D Earth shine through */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_top_left,rgba(4,6,13,0.15)_0%,rgba(4,6,13,0.65)_100%)]" />

      {/* Center Branding & Iconic Loading Arc like Google Earth */}
      <div className="relative z-10 flex flex-col items-center text-center px-4 animate-fade-in pointer-events-auto">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-display font-medium text-white tracking-tight flex items-center justify-center">
          PlanetPulse
        </h1>

        {/* Pure Amber Google Earth Style Spinning Arc */}
        <div className="mt-5 relative w-10 h-10 flex items-center justify-center">
          <svg className="w-10 h-10 animate-spin" viewBox="0 0 48 48">
            <circle
              cx="24"
              cy="24"
              r="18"
              fill="none"
              stroke="#f59e0b"
              strokeWidth="3.2"
              strokeDasharray="42 120"
              strokeLinecap="round"
            />
          </svg>
        </div>

        <p className="text-xs text-neutral-400 font-medium tracking-wide mt-5 max-w-xs">
          Calibrating Global Satellite & Carbon Intensity Grid
        </p>

        {/* Skip button for instant access */}
        <button
          onClick={() => {
            setFading(true);
            setTimeout(onComplete, 200);
          }}
          className="mt-6 text-xs text-neutral-500 hover:text-neutral-300 font-medium transition-colors cursor-pointer px-3 py-1 rounded-full hover:bg-white/5"
        >
          Skip Intro →
        </button>
      </div>
    </div>
  );
}
