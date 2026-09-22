"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

interface EarthGlobeProps {
  width?: number;
  height?: number;
  rotationSpeed?: number;
  transitionActive?: boolean;
  transitionTarget?: [number, number] | null;
  onTransitionComplete?: () => void;
  horizonMode?: boolean;
}

export function EarthGlobe({
  width = 400,
  height = 400,
  rotationSpeed = 0.0012,
  transitionActive = false,
  transitionTarget = null,
  onTransitionComplete,
  horizonMode = true,
}: EarthGlobeProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const transitionRef = useRef({
    active: transitionActive,
    target: transitionTarget,
    startedAt: 0,
    startY: 0,
    endY: 0,
    startX: 0,
    endX: 0,
    startPosZ: 0,
    endPosZ: 0,
    startPosX: 0,
    endPosX: 0,
    startPosY: 0,
    endPosY: 0,
    startScale: 1,
    endScale: 1,
  });
  const onTransitionCompleteRef = useRef(onTransitionComplete);

  useEffect(() => {
    onTransitionCompleteRef.current = onTransitionComplete;
  }, [onTransitionComplete]);

  useEffect(() => {
    const transition = transitionRef.current;
    transition.target = transitionTarget;
    if (transitionActive && !transition.active && transitionTarget) {
      transition.active = true;
      transition.startedAt = 0;
    } else if (!transitionActive) {
      transition.active = false;
    }
  }, [transitionActive, transitionTarget]);

  useEffect(() => {
    if (!mountRef.current) return;
    const mountElement = mountRef.current;
    mountElement.innerHTML = "";

    // -------------------------------------------------------------
    // ATTEMPT 1: THREE.JS WEBGL RENDERER
    // -------------------------------------------------------------
    let renderer: THREE.WebGLRenderer | null = null;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: "high-performance",
      });
    } catch {
      renderer = null;
    }

    if (!renderer) {
      // -------------------------------------------------------------
      // FALLBACK: HIGH-FIDELITY 2D CANVAS GOOGLE EARTH HORIZON
      // Authentic Day/Night Terminator + NASA Black Marble City Lights
      // Shimmering Galaxy Stars + Random Meteor in 50s Timeframe
      // -------------------------------------------------------------
      const canvas = document.createElement("canvas");
      canvas.className = "w-full h-full block";
      mountElement.appendChild(canvas);
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      let animId: number;
      let angle = 0;
      let transitionStart = 0;
      let transitionDone = false;

      // 1. Shimmering Galaxy Starfield (500 astronomical stars with stellar classes)
      const stars: {
        x: number;
        y: number;
        r: number;
        baseAlpha: number;
        speed: number;
        phase: number;
        color: string;
        isSpikeStar: boolean;
      }[] = [];

      const starColors = [
        "rgba(255, 255, 255,", // Diamond White
        "rgba(224, 242, 254,", // Celestial Cyan-White
        "rgba(191, 219, 254,", // Type B Blue-White
        "rgba(254, 240, 138,", // Type G Warm Gold
        "rgba(253, 230, 138,", // Amber Tint
        "rgba(237, 233, 254,", // Lavender White
      ];

      for (let i = 0; i < 500; i++) {
        const color = starColors[Math.floor(Math.random() * starColors.length)];
        const isSpikeStar = i < 8; // 8 navigational gems with 4-point diffraction rays
        stars.push({
          x: Math.random(),
          y: Math.random(),
          r: isSpikeStar ? 1.6 + Math.random() * 0.7 : 0.35 + Math.random() * 1.25,
          baseAlpha: 0.3 + Math.random() * 0.7,
          speed: 0.0012 + Math.random() * 0.0028,
          phase: Math.random() * Math.PI * 2,
          color,
          isSpikeStar,
        });
      }

      // 2. Rare Random Shooting Star (Falls at a random second in ~50s timeframe)
      let nextMeteorTime = performance.now() + 6000 + Math.random() * 8000;
      let activeMeteor: {
        startX: number;
        startY: number;
        endX: number;
        endY: number;
        startTime: number;
        duration: number;
        tailLen: number;
      } | null = null;

      // 3. Dense Constellations of Golden City Lights (NASA Black Marble Grid)
      // Representing megalopolises and regional electrical networks
      const cityLights: {
        x: number;
        y: number;
        r: number;
        intensity: number;
        isMajor: boolean;
      }[] = [];

      // Generate clustered nodes across continent paths
      const clusters = [
        // North America East Coast / Midwest
        { cx: 0.18, cy: -0.22, count: 45, spread: 0.18 },
        // West Coast
        { cx: -0.05, cy: -0.28, count: 25, spread: 0.12 },
        // Europe / UK / Mediterranean
        { cx: 0.42, cy: -0.15, count: 50, spread: 0.2 },
        // Asia / East Asia / India
        { cx: 0.65, cy: -0.05, count: 55, spread: 0.22 },
        // South America / Africa Coasts
        { cx: 0.28, cy: 0.25, count: 35, spread: 0.2 },
      ];

      clusters.forEach((cl) => {
        for (let i = 0; i < cl.count; i++) {
          const theta = Math.random() * Math.PI * 2;
          const rad = Math.pow(Math.random(), 1.5) * cl.spread;
          cityLights.push({
            x: cl.cx + Math.cos(theta) * rad,
            y: cl.cy + Math.sin(theta) * rad,
            r: Math.random() < 0.2 ? 2.0 : 0.8 + Math.random() * 1.0,
            intensity: 0.6 + Math.random() * 0.4,
            isMajor: Math.random() < 0.18,
          });
        }
      });

      const renderFallback = () => {
        animId = requestAnimationFrame(renderFallback);
        const w = (canvas.width = mountElement.clientWidth || 800);
        const h = (canvas.height = mountElement.clientHeight || 600);
        const now = performance.now();
        const isMobile = w < 640 || w / h < 0.8;

        // 1. Pitch Black Cosmic Void
        ctx.fillStyle = "#010206";
        ctx.fillRect(0, 0, w, h);

        // 2. Swirling Milky Way Nebula & Galactic Dust
        const mwGrad = ctx.createLinearGradient(0, 0, w * 0.75, h * 0.65);
        mwGrad.addColorStop(0, "rgba(255, 255, 255, 0)");
        mwGrad.addColorStop(0.2, "rgba(56, 189, 248, 0.03)"); // Cyan stardust
        mwGrad.addColorStop(0.45, "rgba(147, 197, 253, 0.045)"); // Electric blue band
        mwGrad.addColorStop(0.65, "rgba(168, 85, 247, 0.025)"); // Deep purple dust
        mwGrad.addColorStop(1, "rgba(255, 255, 255, 0)");
        ctx.fillStyle = mwGrad;
        ctx.fillRect(0, 0, w, h);

        const coreGrad = ctx.createRadialGradient(w * 0.35, h * 0.25, 10, w * 0.35, h * 0.25, w * 0.45);
        coreGrad.addColorStop(0, "rgba(254, 240, 138, 0.02)");
        coreGrad.addColorStop(0.5, "rgba(129, 140, 248, 0.015)");
        coreGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = coreGrad;
        ctx.fillRect(0, 0, w, h);

        // 3. Shimmering Galaxy Stars
        stars.forEach((s) => {
          const twinkle = 0.65 + 0.35 * Math.sin(now * s.speed + s.phase);
          const alpha = s.baseAlpha * twinkle;
          const sx = s.x * w;
          const sy = s.y * h;

          ctx.fillStyle = `${s.color}${alpha})`;
          ctx.beginPath();
          ctx.arc(sx, sy, s.r, 0, Math.PI * 2);
          ctx.fill();

          // 4-point microscopic diffraction rays on prominent stars
          if (s.isSpikeStar && alpha > 0.45) {
            ctx.save();
            ctx.strokeStyle = `rgba(255, 255, 255, ${alpha * 0.6})`;
            ctx.lineWidth = 0.75;
            const spikeLen = s.r * 3.8;
            ctx.beginPath();
            ctx.moveTo(sx - spikeLen, sy);
            ctx.lineTo(sx + spikeLen, sy);
            ctx.moveTo(sx, sy - spikeLen);
            ctx.lineTo(sx, sy + spikeLen);
            ctx.stroke();
            ctx.restore();
          }
        });

        // 4. Rare Meteorite Falling at Random Seconds in 50s Timeframe
        if (!activeMeteor && now >= nextMeteorTime) {
          const sx = (0.15 + Math.random() * 0.5) * w;
          const sy = (0.04 + Math.random() * 0.25) * h;
          const dist = 140 + Math.random() * 110;
          const angleRad = (28 + Math.random() * 12) * (Math.PI / 180);
          activeMeteor = {
            startX: sx,
            startY: sy,
            endX: sx + Math.cos(angleRad) * dist,
            endY: sy + Math.sin(angleRad) * dist,
            startTime: now,
            duration: 650 + Math.random() * 200,
            tailLen: 85 + Math.random() * 55,
          };
          // Next meteor strictly scheduled at random in ~35s-50s timeframe
          nextMeteorTime = now + (35000 + Math.random() * 25000);
        }

        if (activeMeteor) {
          const p = (now - activeMeteor.startTime) / activeMeteor.duration;
          if (p >= 1) {
            activeMeteor = null;
          } else {
            const currentX = activeMeteor.startX + (activeMeteor.endX - activeMeteor.startX) * p;
            const currentY = activeMeteor.startY + (activeMeteor.endY - activeMeteor.startY) * p;
            const alpha = p < 0.2 ? p / 0.2 : Math.max(0, 1 - (p - 0.2) / 0.8);

            const dx = activeMeteor.endX - activeMeteor.startX;
            const dy = activeMeteor.endY - activeMeteor.startY;
            const dLen = Math.hypot(dx, dy);
            const nx = (dx / dLen) * activeMeteor.tailLen;
            const ny = (dy / dLen) * activeMeteor.tailLen;

            const mGrad = ctx.createLinearGradient(currentX, currentY, currentX - nx, currentY - ny);
            mGrad.addColorStop(0, `rgba(255, 255, 255, ${alpha})`);
            mGrad.addColorStop(0.3, `rgba(186, 230, 253, ${alpha * 0.85})`);
            mGrad.addColorStop(1, "rgba(56, 189, 248, 0)");

            ctx.save();
            ctx.strokeStyle = mGrad;
            ctx.lineWidth = 1.6;
            ctx.beginPath();
            ctx.moveTo(currentX, currentY);
            ctx.lineTo(currentX - nx, currentY - ny);
            ctx.stroke();

            // Meteor head incandescent glow
            ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
            ctx.beginPath();
            ctx.arc(currentX, currentY, 1.8, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
          }
        }

        // 5. Earth Geometry (Google Earth Curved Horizon across lower right)
        let cx: number;
        let cy: number;
        let r: number;

        const transition = transitionRef.current;
        if (transition.active) {
          if (!transitionStart) transitionStart = performance.now();
          const elapsed = performance.now() - transitionStart;
          const dur = 1400;
          const p = Math.min(elapsed / dur, 1);
          const ease = 1 - Math.pow(1 - p, 4);

          // Fast spin & glide to center
          angle += 0.08 * (1 - ease * 0.5);
          const startCx = isMobile ? w * 0.95 : w * 0.95;
          const startCy = isMobile ? h * 1.40 : h * 1.75;
          const startR = isMobile ? h * 0.95 : h * 1.35;

          cx = startCx + (w * 0.5 - startCx) * ease;
          cy = startCy + (h * 0.5 - startCy) * ease;
          r = startR + (Math.min(w, h) * 0.38 - startR) * ease;

          if (p >= 1 && !transitionDone) {
            transitionDone = true;
            setTimeout(() => {
              onTransitionCompleteRef.current?.();
            }, 200);
          }
        } else {
          angle += rotationSpeed * 3;
          if (isMobile) {
            cx = w * 0.95;
            cy = h * 1.40;
            r = h * 0.95;
          } else {
            cx = w * 0.95;
            cy = h * 1.75;
            r = h * 1.35;
          }
        }

        // 6. Atmospheric Glow Layer 1: Deep cosmic diffuse halo
        ctx.save();
        ctx.beginPath();
        ctx.arc(cx, cy, r + 50, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(14, 165, 233, 0.12)";
        ctx.lineWidth = 45;
        ctx.stroke();

        // Atmospheric Glow Layer 2: Electric Azure/Cyan limb scatter
        ctx.beginPath();
        ctx.arc(cx, cy, r + 18, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(56, 189, 248, 0.42)";
        ctx.lineWidth = 24;
        ctx.stroke();

        // Atmospheric Glow Layer 3: Brilliant Horizon Tangent line
        ctx.beginPath();
        ctx.arc(cx, cy, r + 4, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(186, 230, 253, 0.92)";
        ctx.lineWidth = 5;
        ctx.stroke();

        // Atmospheric Glow Layer 4: Pure White limb rim highlight
        ctx.beginPath();
        ctx.arc(cx, cy, r + 1, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(255, 255, 255, 0.98)";
        ctx.lineWidth = 2;
        ctx.stroke();

        // 7. Earth Body & Day/Night Terminator with Glowing City Lights
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.fillStyle = "#040914"; // Deep night base
        ctx.fill();
        ctx.clip();

        // Base Ocean Gradient (Sunlit Day Ocean in Upper-Left to Deep Night Ocean in Lower-Right)
        const oceanGrad = ctx.createLinearGradient(
          cx - r * 0.65,
          cy - r * 0.65,
          cx + r * 0.4,
          cy + r * 0.4
        );
        oceanGrad.addColorStop(0, "#194a80"); // Sunlit bright ocean
        oceanGrad.addColorStop(0.32, "#103259"); // Twilight ocean
        oceanGrad.addColorStop(0.5, "#081b33"); // Terminator ocean
        oceanGrad.addColorStop(0.72, "#040c1a"); // Night ocean
        oceanGrad.addColorStop(1, "#02060f");
        ctx.fillStyle = oceanGrad;
        ctx.fillRect(cx - r, cy - r, r * 2, r * 2);

        // Rotatable Earth Continents (Daylight Topography + Night Contours)
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(angle);

        const landmasses = [
          // North America
          { x: 0.15, y: -0.26, rx: 0.32, ry: 0.25, cDay: "#9a5626", cNight: "#0a1420" },
          // South America
          { x: 0.25, y: 0.22, rx: 0.24, ry: 0.32, cDay: "#26542c", cNight: "#070e17" },
          // Europe
          { x: 0.42, y: -0.16, rx: 0.22, ry: 0.18, cDay: "#355e32", cNight: "#0b1624" },
          // Africa
          { x: 0.45, y: 0.12, rx: 0.28, ry: 0.35, cDay: "#b0733a", cNight: "#08101a" },
          // Asia
          { x: 0.68, y: -0.12, rx: 0.38, ry: 0.28, cDay: "#8c5324", cNight: "#0c1828" },
          // Australia
          { x: 0.78, y: 0.38, rx: 0.22, ry: 0.18, cDay: "#a85d28", cNight: "#070d16" },
        ];

        landmasses.forEach((lm) => {
          ctx.fillStyle = lm.cDay;
          ctx.beginPath();
          ctx.ellipse(lm.x * r, lm.y * r, lm.rx * r, lm.ry * r, 0.35, 0, Math.PI * 2);
          ctx.fill();

          // Topographic canyons & river veins
          ctx.strokeStyle = "#461e0b";
          ctx.lineWidth = 2.2;
          ctx.beginPath();
          ctx.moveTo(lm.x * r - 20, lm.y * r - 15);
          ctx.bezierCurveTo(lm.x * r + 10, lm.y * r - 5, lm.x * r, lm.y * r + 25, lm.x * r + 35, lm.y * r + 10);
          ctx.stroke();
        });

        // 8. Sunset / Twilight Terminator Layer (Golden Hour Line)
        ctx.restore(); // back to Earth center (unrotated)
        const terminatorGrad = ctx.createLinearGradient(
          cx - r * 0.48,
          cy - r * 0.48,
          cx + r * 0.38,
          cy + r * 0.38
        );
        terminatorGrad.addColorStop(0, "rgba(0, 0, 0, 0)"); // Full sun
        terminatorGrad.addColorStop(0.35, "rgba(249, 115, 22, 0.38)"); // Golden sunset line
        terminatorGrad.addColorStop(0.46, "rgba(234, 88, 12, 0.6)"); // Orange twilight
        terminatorGrad.addColorStop(0.62, "rgba(4, 8, 18, 0.9)"); // Night shadow
        terminatorGrad.addColorStop(1, "rgba(2, 5, 12, 0.98)");
        ctx.fillStyle = terminatorGrad;
        ctx.fillRect(cx - r, cy - r, r * 2, r * 2);

        // 9. NASA Black Marble Night City Lights (Electric Grid on Night Side)
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(angle);

        cityLights.forEach((city) => {
          const cityX = city.x * r;
          const cityY = city.y * r;

          // Check if this point currently rotates through the night hemisphere
          const screenAngle = Math.atan2(cityY, cityX) + angle;
          // Night side corresponds to bottom-right quadrant
          const isNight = Math.sin(screenAngle) > -0.25 && Math.cos(screenAngle) > -0.25;

          if (isNight) {
            // Metropolitan ambient golden halo
            const haloGrad = ctx.createRadialGradient(
              cityX,
              cityY,
              0.5,
              cityX,
              cityY,
              city.isMajor ? city.r * 5.5 : city.r * 3.2
            );
            haloGrad.addColorStop(0, "rgba(251, 191, 36, 0.75)"); // Amber/gold core
            haloGrad.addColorStop(0.4, "rgba(245, 158, 11, 0.35)"); // Golden glow
            haloGrad.addColorStop(1, "rgba(217, 119, 6, 0)");
            ctx.fillStyle = haloGrad;
            ctx.beginPath();
            ctx.arc(cityX, cityY, city.isMajor ? city.r * 5.5 : city.r * 3.2, 0, Math.PI * 2);
            ctx.fill();

            // Incandescent white-gold core
            ctx.fillStyle = city.isMajor ? "#fef08a" : "#fbbf24";
            ctx.beginPath();
            ctx.arc(cityX, cityY, city.r, 0, Math.PI * 2);
            ctx.fill();

            // Intercity electrical filaments connecting hubs
            if (city.isMajor) {
              ctx.strokeStyle = "rgba(251, 191, 36, 0.38)";
              ctx.lineWidth = 0.9;
              ctx.beginPath();
              ctx.moveTo(cityX, cityY);
              ctx.lineTo(cityX + 18, cityY - 12);
              ctx.lineTo(cityX + 32, cityY + 6);
              ctx.stroke();
            }
          }
        });

        // 10. Wispy Atmospheric Cloud Swirls
        ctx.rotate(angle * 0.15);
        for (let i = 0; i < 24; i++) {
          const cloudAngle = (i / 24) * Math.PI * 2;
          const dist = (0.2 + (i % 5) * 0.15) * r;
          const cX = Math.cos(cloudAngle) * dist;
          const cY = Math.sin(cloudAngle) * dist;
          const rad = 25 + (i % 4) * 22;

          const cloudGrad = ctx.createRadialGradient(cX, cY, 0, cX, cY, rad);
          cloudGrad.addColorStop(0, "rgba(255, 255, 255, 0.3)");
          cloudGrad.addColorStop(0.6, "rgba(255, 255, 255, 0.1)");
          cloudGrad.addColorStop(1, "rgba(255, 255, 255, 0)");
          ctx.fillStyle = cloudGrad;
          ctx.beginPath();
          ctx.arc(cX, cY, rad, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();

        // 11. User Location Target Beacon (if transitioning to World Map)
        if (transition.active) {
          const pulse = 1 + Math.sin(Date.now() * 0.015) * 0.4;
          ctx.strokeStyle = "#4ade80";
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.arc(cx, cy, 24 * pulse, 0, Math.PI * 2);
          ctx.stroke();

          ctx.fillStyle = "#22c55e";
          ctx.beginPath();
          ctx.arc(cx, cy, 6, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore();
      };

      renderFallback();

      return () => {
        cancelAnimationFrame(animId);
        if (canvas.parentNode === mountElement) {
          mountElement.removeChild(canvas);
        }
      };
    }

    // -------------------------------------------------------------
    // ATTEMPT 1 CONTINUED: FULL THREE.JS 3D SCENE WITH SHADERS
    // -------------------------------------------------------------
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x010206);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 0, 3.2);

    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.35;
    mountElement.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0x182436, 0.5);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xffffff, 2.8);
    sunLight.position.set(6, 4, 3);
    scene.add(sunLight);

    const earthGroup = new THREE.Group();
    scene.add(earthGroup);

    const defaultPosX = horizonMode ? 1.45 : 0;
    const defaultPosY = horizonMode ? -2.05 : 0;
    const defaultScale = horizonMode ? 1.85 : 1.0;
    earthGroup.position.set(defaultPosX, defaultPosY, 0);
    earthGroup.scale.set(defaultScale, defaultScale, defaultScale);
    earthGroup.rotation.z = -0.22;

    const earthRadius = 1.25;
    const earthGeometry = new THREE.SphereGeometry(earthRadius, 64, 64);

    // ── Load Realistic NASA Earth Textures ──
    const textureLoader = new THREE.TextureLoader();
    const dayTexture = textureLoader.load("/textures/earth-daymap-4k.jpg");
    const bumpTexture = textureLoader.load("/textures/earth-bump-4k.jpg");
    const specularTexture = textureLoader.load("/textures/earth-specular-4k.jpg");

    // Realistic Earth with NASA Blue Marble imagery
    const earthMaterial = new THREE.MeshStandardMaterial({
      map: dayTexture,
      bumpMap: bumpTexture,
      bumpScale: 0.12,
      roughness: 0.6,
      metalness: 0.1,
    });

    const earth = new THREE.Mesh(earthGeometry, earthMaterial);
    earthGroup.add(earth);

    // ── Cloud Layer ──
    const cloudTexture = textureLoader.load("/textures/earth-clouds-map-4k.jpg");
    const cloudMesh = new THREE.Mesh(
      new THREE.SphereGeometry(earthRadius + 0.015, 64, 64),
      new THREE.MeshStandardMaterial({
        map: cloudTexture,
        transparent: true,
        opacity: 0.55,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        side: THREE.DoubleSide,
      })
    );
    earthGroup.add(cloudMesh);

    // Atmospheric Limb Shader
    const glowGeometry = new THREE.SphereGeometry(earthRadius + 0.048, 64, 64);
    const glowMaterial = new THREE.ShaderMaterial({
      vertexShader: `
        varying vec3 vNormal;
        varying vec3 vPosition;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          vPosition = (modelViewMatrix * vec4(position, 1.0)).xyz;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec3 vNormal;
        varying vec3 vPosition;
        void main() {
          vec3 normal = normalize(vNormal);
          vec3 viewDir = normalize(-vPosition);
          float rim = 1.0 - max(0.0, dot(viewDir, normal));
          float intensity = pow(rim, 3.6);
          vec3 color = mix(vec3(0.05, 0.45, 0.95), vec3(0.4, 0.9, 1.0), rim);
          gl_FragColor = vec4(color, intensity * 0.96);
        }
      `,
      transparent: true,
      side: THREE.FrontSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const atmosphere = new THREE.Mesh(glowGeometry, glowMaterial);
    earthGroup.add(atmosphere);

    // Target Beacon
    const beaconGroup = new THREE.Group();
    beaconGroup.visible = false;
    const beaconCore = new THREE.Mesh(new THREE.SphereGeometry(0.04, 16, 16), new THREE.MeshBasicMaterial({ color: 0x22c55e }));
    beaconGroup.add(beaconCore);
    const beaconPulseRing = new THREE.Mesh(new THREE.RingGeometry(0.05, 0.09, 32), new THREE.MeshBasicMaterial({ color: 0x4ade80, transparent: true, opacity: 0.9, side: THREE.DoubleSide }));
    beaconGroup.add(beaconPulseRing);
    earth.add(beaconGroup);

    // Galaxy Stars Field
    const starsGeometry = new THREE.BufferGeometry();
    const starsCount = 2800;
    const starsPositions = new Float32Array(starsCount * 3);
    const starsSizes = new Float32Array(starsCount);

    for (let i = 0; i < starsCount; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 40 + Math.random() * 160;
      starsPositions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      starsPositions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      starsPositions[i * 3 + 2] = r * Math.cos(phi);
      starsSizes[i] = 0.15 + Math.random() * 0.6;
    }
    starsGeometry.setAttribute("position", new THREE.BufferAttribute(starsPositions, 3));
    starsGeometry.setAttribute("size", new THREE.BufferAttribute(starsSizes, 1));

    const starsMaterial = new THREE.PointsMaterial({
      color: 0x93c5fd,
      size: 0.18,
      transparent: true,
      opacity: 0.85,
      sizeAttenuation: true,
    });
    const stars = new THREE.Points(starsGeometry, starsMaterial);
    scene.add(stars);

    let animationId: number;

    const animate = () => {
      animationId = requestAnimationFrame(animate);
      const transition = transitionRef.current;

      if (transition.active && transition.target) {
        if (!transition.startedAt) {
          transition.startedAt = performance.now();
          transition.startY = earth.rotation.y;
          transition.startX = earth.rotation.x;
          transition.startPosX = earthGroup.position.x;
          transition.startPosY = earthGroup.position.y;
          transition.startPosZ = camera.position.z;
          transition.startScale = earthGroup.scale.x;

          const [lat, lng] = transition.target;
          const theta = (lng + 180) * (Math.PI / 180);
          const phi = (90 - lat) * (Math.PI / 180);

          const r = earthRadius + 0.01;
          const bx = -r * Math.sin(phi) * Math.cos(theta);
          const by = r * Math.cos(phi);
          const bz = r * Math.sin(phi) * Math.sin(theta);
          beaconGroup.position.set(bx, by, bz);
          beaconPulseRing.lookAt(new THREE.Vector3(bx * 2, by * 2, bz * 2));
          beaconGroup.visible = true;

          const baseTargetY = Math.atan2(-bx, bz);
          const delta = THREE.MathUtils.euclideanModulo(baseTargetY - transition.startY + Math.PI, Math.PI * 2) - Math.PI;

          transition.endY = transition.startY + Math.PI * 8 + delta;
          transition.endX = -(lat * (Math.PI / 180)) * 0.75;
          transition.endPosX = 0;
          transition.endPosY = 0;
          transition.endPosZ = 1.6;
          transition.endScale = 1.0;
        }

        const duration = 1500;
        const elapsed = performance.now() - transition.startedAt;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 4);

        const rotY = THREE.MathUtils.lerp(transition.startY, transition.endY, eased);
        const rotX = THREE.MathUtils.lerp(transition.startX, transition.endX, eased);
        earth.rotation.y = rotY;
        earth.rotation.x = rotX;
        cloudMesh.rotation.y = rotY * 1.08;
        cloudMesh.rotation.x = rotX * 0.95;

        earthGroup.position.x = THREE.MathUtils.lerp(transition.startPosX, transition.endPosX, eased);
        earthGroup.position.y = THREE.MathUtils.lerp(transition.startPosY, transition.endPosY, eased);
        const currentScale = THREE.MathUtils.lerp(transition.startScale, transition.endScale, eased);
        earthGroup.scale.set(currentScale, currentScale, currentScale);

        camera.position.z = THREE.MathUtils.lerp(transition.startPosZ, transition.endPosZ, eased);

        const pulse = 1 + Math.sin(elapsed * 0.02) * 0.5;
        beaconPulseRing.scale.set(pulse, pulse, pulse);

        if (progress >= 1) {
          if (elapsed >= duration + 250) {
            transition.active = false;
            transition.startedAt = 0;
            onTransitionCompleteRef.current?.();
          }
        }
      } else {
        earth.rotation.y += rotationSpeed;
        cloudMesh.rotation.y += rotationSpeed * 1.12;
      }

      stars.rotation.y += rotationSpeed * 0.05;
      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!mountRef.current || !renderer) return;
      const rect = mountRef.current.getBoundingClientRect();
      const w = rect.width || width;
      const h = rect.height || height;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", handleResize);
      if (renderer && renderer.domElement.parentNode === mountElement) {
        mountElement.removeChild(renderer.domElement);
      }
      renderer?.dispose();
      dayTexture.dispose();
      bumpTexture.dispose();
      specularTexture.dispose();
      cloudTexture.dispose();
      cloudMesh.geometry.dispose();
      cloudMesh.material.dispose();
      earthGeometry.dispose();
      earthMaterial.dispose();
      glowGeometry.dispose();
      glowMaterial.dispose();
      starsGeometry.dispose();
      starsMaterial.dispose();
    };
  }, [width, height, rotationSpeed, horizonMode]);

  return (
    <div
      ref={mountRef}
      className="w-full h-full"
      style={{ minHeight: 320 }}
      role="img"
      aria-label="3D Earth curved horizon in deep space"
    />
  );
}

export default EarthGlobe;
