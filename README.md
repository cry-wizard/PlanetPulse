# PlanetPulse — Real-Time Carbon Footprint Tracker

> **Azisly.ai Code2Career Hackathon — September 2026**  
> **Track:** Track 2 — Web Development  
> **Hackathon ID:** `AZIS-AD2SV8`  
> **Team:** Haridwar Team 09 (Solo Participant)  
> **College:** Haridwar University  
> **Live Deployed App:** [https://planetpulse0.netlify.app/](https://planetpulse0.netlify.app/)  

---

## 📌 Submission Overview & Compliance Matrix

| Requirement | Status | Details |
| :--- | :---: | :--- |
| **Hackathon ID at Root** | ✅ **Passed** | `AZIS-AD2SV8` displayed prominently at the top of `README.md` and `DECISIONS.md`. |
| **Deployed Public App** | ✅ **Passed** | Live on Netlify at [https://planetpulse0.netlify.app/](https://planetpulse0.netlify.app/). |
| **No Authentication** | ✅ **Passed** | **Zero auth** (no login/signup). Graders can immediately test all features without accounts. |
| **All 5 Required Features** | ✅ **Passed** | Full implementation of activity logging, weekly dashboard, target budget, history, and live API. |
| **DECISIONS.md** | ✅ **Passed** | Comprehensive documentation of all 3 Decision Points with rationale. |
| **Standard API Declaration** | ✅ **Declared** | **Not implemented**. Features are graded via **Browser Agent driving the UI**. |
| **Demo Video Guide** | ✅ **Provided** | Structured 3–4 minute walkthrough script covering all 5 features and Decision Points. |

---

## 🚀 The 5 Required Core Features

### 1. Activity Logging with Real CO₂ Emission Factors
Log daily commute, energy, and diet with scientifically calibrated CO₂ factors ($kg\text{ CO}_2$ per unit):

| Activity Type | Emission Factor | Unit | Real-World Preset Examples |
| :--- | :---: | :---: | :--- |
| **Car Travel** | `0.20` | kg/km | Commute 10 km (2.0 kg), Road trip 50 km (10.0 kg) |
| **Bus Travel** | `0.08` | kg/km | City ride 5 km (0.4 kg), Transit pass 15 km (1.2 kg) |
| **Flight** | `0.25` | kg/km | Domestic flight 500 km (125 kg), Long haul 2,000 km (500 kg) |
| **Electricity** | `0.80` | kg/kWh | Laptop work 2 kWh (1.6 kg), AC / Heating 8 kWh (6.4 kg) |
| **Vegetarian Meal** | `0.50` | kg/meal | Standard plant-based lunch/dinner (0.5 kg) |
| **Non-Veg Meal** | `2.00` | kg/meal | High-protein meat meal (2.0 kg) |

- **Instant Calculations**: The CO₂ impact updates in real time as the user adjusts quantities or presets.
- **Accessible Inputs**: Fully keyboard operable with semantic radio groups and ARIA attributes.

### 2. Real-Time Weekly Dashboard
- Automatically computes total CO₂ for the **active week (Monday 00:00 to Sunday 23:59:59)**.
- **Donut Breakdown Chart**: Recharts-powered visualization showing emission proportions by category with center metric readout and interactive tooltips.
- **Pace & Budget Indicators**: Displays remaining budget, daily average pace, and countdown of days remaining in the week.
- **Automatic Rollover**: Zero manual reset required; historical data is safely retained while the new week begins fresh every Monday.

### 3. Weekly Carbon Budget & Target Configuration
- Default target set to **50 kg CO₂/week** (adjustable from 5 to 500 kg).
- **Interactive Preferences**: Four presets (Strict 30 kg, Default 50 kg, Moderate 80 kg, Relaxed 120 kg) plus custom slider and numeric input.
- **Status Progress Bar**: Smooth color transition with glowing status indicator (**On Track** $\le 80\%$, **Getting Close** $80\text{–}100\%$, **Over Target** $>100\%$).

### 4. Searchable & Filterable Activity History
- **Multi-dimensional Filtering**: Filter activities by date range (*This Week*, *Last Week*, *All Time*) and category (*Car*, *Bus*, *Flight*, *Electricity*, *Meals*).
- **CRUD Operations**: Delete individual activities with instant recalculation of weekly and all-time totals.
- **Reactive State Sync**: Custom browser events (`planetpulse:activity_updated`) keep all components and pages synchronized in real-time.

### 5. Live UK National Grid Carbon Intensity API
- Integrates with the official **UK National Grid ESO Carbon Intensity API** (`https://api.carbonintensity.org.uk/regional/england`).
- Dynamically fetches live regional grid carbon metrics (e.g. `0.19 kg CO₂/kWh` — *Moderate*).
- Provides real-world context for electricity usage while maintaining strict adherence to the brief's fixed $0.80\text{ kg/kWh}$ baseline calculation.

---

## 🌟 Premium Cinematic UI & Visual Architecture

PlanetPulse features a custom-engineered **deep obsidian glassmorphism design** inspired by Google Earth:

- **Google Earth Splash Screen**: Clean, centered branding with an authentic floating amber circular loading arc (`#f59e0b`) that smoothly dissolves into the dashboard.
- **3D Curved Earth Horizon**:
  - Positioned across the lower-right horizon with an expansive cosmic starry void above.
  - **Day/Night Terminator**: Features sunlit oceans on the day side, a warm golden-hour sunset line, and nighttime continents glowing with **NASA Black Marble city light electrical grids** (`#fbbf24`).
  - **Atmospheric Limb**: Multi-layered electric cyan and sapphire blue Rayleigh scattering with a razor-sharp white tangent line.
- **Shimmering Galaxy Starfield**:
  - Over 500 stars featuring realistic stellar spectral classes (diamond white, celestial cyan, Type G gold, and lavender).
  - Harmonic sine wave twinkling for a living, breathing deep-space feel.
  - **50-Second Rare Meteorite**: A delicate shooting star streaks across the upper cosmic void at random intervals within a 35s–50s window.
- **Watermark-Free World Map**: Seamless transition from 3D Earth to an interactive Leaflet World Map using **Esri World Dark Gray Canvas**, with geolocation lock-on and zero "API KEY REQUIRED" watermarks.

---

## ⚖️ Decision Points Summary (DECISIONS.md)

See [DECISIONS.md](file:///d:/PlanetPulse/project/DECISIONS.md) for full rationale:

1. **Decision Point 1 (The Nudge — Target Overshoot)**:
   - *Choice:* **Warn + Encourage, Never Block or Shame.**
   - *Behavior:* When the user exceeds their weekly target, the remaining budget turns red with an "Over Target" badge, and a supportive encouragement banner appears with actionable reduction tips. The user is never blocked from logging further entries.
2. **Decision Point 2 (Absurd Input Handling)**:
   - *Choice:* **Warn with contextual advisory, but Accept and Save.**
   - *Behavior:* When quantities exceed realistic single-event thresholds (e.g., car >500 km, electricity >500 kWh), an advisory warning note displays below the input without blocking or altering user data.
3. **Decision Point 3 (Week Rollover & Pace)**:
   - *Choice:* **Monday 00:00 to Sunday 23:59:59 in User's Local Time Zone.**
   - *Behavior:* Aligns with standard ISO 8601 calendar conventions. Shows days remaining and required daily run-rate. Automatically transitions into the new week.

---

## 🔍 Track 2 Grading Declaration

> **Standard API Implemented:** **NO**  
> **Grading Method:** **Browser Agent driving the UI**  

PlanetPulse is architected as a pure client-side web application with persistent browser `localStorage`. Because the hackathon brief strictly forbids authentication, building a multi-tenant backend without authentication would compromise privacy or require complex anonymous session tokens. All features, validation states, and Decision Point behaviors are accessible directly through semantic, accessible DOM elements designed for headless browser automated evaluation.

---

## 🛠️ Technology Stack

- **Framework:** Next.js 14+ (App Router, Server & Client Components)
- **Language:** TypeScript 5+ (Strict Type Checking)
- **Styling:** Tailwind CSS v4, Vanilla CSS Design Tokens (`globals.css`)
- **3D Graphics & Shaders:** Three.js (WebGL, Custom GLSL Atmospheric Limb & Day/Night Shaders)
- **Mapping:** Leaflet & React-Leaflet (Esri World Dark Gray Canvas Basemap)
- **Charts:** Recharts (SVG Donut Chart with Tooltips)
- **Icons:** Lucide React
- **External API:** UK National Grid Carbon Intensity API
- **Deployment:** Netlify ([planetpulse0.netlify.app](https://planetpulse0.netlify.app/))

---

## 💻 Running Locally

### Prerequisites
- Node.js 18.17 or higher
- npm 9 or higher

### Steps

```bash
# 1. Clone the repository
git clone https://github.com/cry-wizard/PlanetPulse.git
cd PlanetPulse

# 2. Install dependencies
npm install

# 3. Start the local development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) (or [http://localhost:3001](http://localhost:3001) if port 3000 is occupied) in your browser.

### Production Build Verification

```bash
# Build production bundle
npm run build

# Run production server
npm run start
```

---

## 🔑 Test Credentials

> **None required.**  
> In accordance with the hackathon rules, authentication (signup/login) is **not implemented**. Evaluators can access 100% of all features immediately upon visiting the application URL.

---

## 🎥 3–4 Minute Demo Video Walkthrough Script

| Timestamp | Feature / Topic | On-Screen Action & Demonstration |
| :---: | :--- | :--- |
| **0:00 – 0:35** | **Intro & Splash Screen** | Show Google Earth splash screen with centered title and amber spinner over the 3D rotating Earth with glowing city lights. Introduce Hackathon ID (`AZIS-AD2SV8`) and Track 2. |
| **0:35 – 1:15** | **Feature 1: Activity Logging** | Select Car Travel, choose preset "Commute 10 km", show instant calculation (2.0 kg CO₂). Select Electricity, enter 15 kWh, show live UK National Grid carbon intensity badge (`0.19 kg CO₂/kWh`). |
| **1:15 – 1:50** | **Decision Point 2: Absurd Input** | Enter 600 km for Car Travel. Demonstrate the contextual advisory warning ("*This is a very large value for car travel. Are you sure?*"). Click "Log Activity" to prove input is accepted and not blocked. |
| **1:50 – 2:25** | **Feature 2 & Decision Point 1** | Inspect the Weekly Dashboard. View the emissions donut breakdown chart. Log meals and electricity until target is exceeded. Demonstrate Decision Point 1: remaining budget turns red, badge displays "Over Target", and supportive encouragement tip appears without blocking. |
| **2:25 – 2:55** | **Feature 3 & Decision Point 3** | Navigate to `/settings`. Demonstrate weekly target presets (30, 50, 80, 120 kg) and the interactive slider. Explain Monday-Sunday week start, daily run-rate pace, and automatic rollover. |
| **2:55 – 3:30** | **Feature 4: Activity History** | Navigate to `/history`. Filter by "This week" and "All time". Filter by "Car travel". Delete an activity and watch the weekly total and breakdown update live. |
| **3:30 – 4:00** | **3D Earth & World Map Transition** | Return to Dashboard. Click "Launch World Map". Show the orbital high-speed spin animation, location beacon lock-on, and seamless opening of the Leaflet World Map (Esri Dark Gray canvas). |

---

## 📄 License

MIT License — Built for the Azisly.ai Code2Career Hackathon (September 2026).
