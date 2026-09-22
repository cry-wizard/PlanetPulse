"use client";

import { Suspense } from "react";
import dynamic from "next/dynamic";

// Dynamic import to avoid SSR issues with Three.js
const EarthGlobe = dynamic(() => import("./earth-globe"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-[#04060d]">
      <div className="w-10 h-10 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
    </div>
  ),
});

interface LandingPageProps {
  className?: string;
  transitionActive?: boolean;
  transitionTarget?: [number, number] | null;
  onTransitionComplete?: () => void;
  horizonMode?: boolean;
}

export function LandingPage3D({
  className,
  transitionActive,
  transitionTarget,
  onTransitionComplete,
  horizonMode = true,
}: LandingPageProps) {
  return (
    <div className={`relative w-full h-full overflow-hidden bg-[#04060d] ${className || ""}`}>
      {/* 3D Earth Globe with Google Earth Horizon */}
      <div className="absolute inset-0">
        <Suspense fallback={null}>
          <EarthGlobe
            transitionActive={transitionActive}
            transitionTarget={transitionTarget}
            onTransitionComplete={onTransitionComplete}
            horizonMode={horizonMode}
          />
        </Suspense>
      </div>

      {/* Atmospheric Horizon Gradient Accent */}
      <div className="absolute inset-0 bg-gradient-to-t from-dark-980/60 via-transparent to-transparent pointer-events-none" />
    </div>
  );
}

export default LandingPage3D;
