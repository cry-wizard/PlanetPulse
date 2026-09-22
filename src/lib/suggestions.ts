/**
 * Carbon Reduction Suggestions Engine
 * Generates personalized suggestions based on user's activity history
 */

export interface Suggestion {
  id: string;
  title: string;
  description: string;
  impact: "low" | "medium" | "high" | "very-high";
  category: "transport" | "energy" | "diet" | "lifestyle" | "offset";
  icon: string;
  savings?: number; // estimated kg CO₂ saved per week
  badge?: string;
}

// Static suggestion database
const SUGGESTIONS: Suggestion[] = [
  // Transport suggestions
  {
    id: "s1",
    title: "Try the bus for short commutes",
    description: "Switching from car to bus for a 5 km daily commute saves ~5 kg CO₂ per week. Buses are 2.5x more efficient per passenger.",
    impact: "high",
    category: "transport",
    icon: "bus",
    savings: 5,
    badge: "Quick Win",
  },
  {
    id: "s2",
    title: "Combine errands into one trip",
    description: "Planning your trips to combine multiple stops reduces cold starts and total distance, cutting emissions by up to 20%.",
    impact: "medium",
    category: "transport",
    icon: "navigate",
    savings: 3,
    badge: "Smart Planning",
  },
  {
    id: "s3",
    title: "Walk or cycle for trips under 2 km",
    description: "Short trips under 2 km are often the most polluting per km (cold engine). Walking or cycling eliminates these entirely.",
    impact: "very-high",
    category: "transport",
    icon: "walk",
    savings: 4,
    badge: "Health Bonus",
  },
  {
    id: "s4",
    title: "Carpool or rideshare once a week",
    description: "Sharing a ride with just one other person cuts per-person emissions in half for that trip.",
    impact: "medium",
    category: "transport",
    icon: "users",
    savings: 2.5,
    badge: "Social Win",
  },
  {
    id: "s5",
    title: "Consider a train for medium-distance travel",
    description: "For trips under 500 km, rail travel produces 80% less CO₂ than flying. High-speed rail is competitive on time for distances under 300 km.",
    impact: "high",
    category: "transport",
    icon: "train",
    savings: 30,
    badge: "Big Impact",
  },

  // Energy suggestions
  {
    id: "s6",
    title: "Switch to renewable electricity provider",
    description: "Many regions offer green energy tariffs. Switching to 100% renewable electricity can cut your electricity carbon footprint to near zero.",
    impact: "very-high",
    category: "energy",
    icon: "zap",
    savings: 25,
    badge: "Huge Impact",
  },
  {
    id: "s7",
    title: "Reduce standby power consumption",
    description: "Unplug devices when not in use or use smart power strips. Standby power accounts for 5-10% of household electricity use.",
    impact: "medium",
    category: "energy",
    icon: "power",
    savings: 3,
    badge: "Easy Win",
  },
  {
    id: "s8",
    title: "Optimize heating/cooling by 1°C",
    description: "Adjusting your thermostat by just 1°C can reduce heating/cooling energy use by ~5-8%, saving ~2 kg CO₂ per week.",
    impact: "medium",
    category: "energy",
    icon: "thermometer",
    savings: 2,
    badge: "Comfortable",
  },
  {
    id: "s9",
    title: "Switch to LED bulbs throughout your home",
    description: "LED bulbs use 75% less energy than incandescent bulbs and last 25x longer. Replace all bulbs for an easy win.",
    impact: "medium",
    category: "energy",
    icon: "lightbulb",
    savings: 1.5,
    badge: "Long-term Save",
  },

  // Diet suggestions
  {
    id: "s10",
    title: "Try Meatless Mondays",
    description: "Skipping meat one day a week reduces your food carbon footprint by ~15%. Start small — every plant-based meal counts.",
    impact: "high",
    category: "diet",
    icon: "leaf",
    savings: 3,
    badge: "Weekly Habit",
  },
  {
    id: "s11",
    title: "Choose local and seasonal produce",
    description: "Food transported long distances adds significant carbon from transport. Local seasonal produce cuts food miles and often tastes better.",
    impact: "medium",
    category: "diet",
    icon: "utensils",
    savings: 1.5,
    badge: "Fresh Choice",
  },
  {
    id: "s12",
    title: "Reduce food waste",
    description: "Wasted food accounts for ~8% of global greenhouse gas emissions. Planning meals and storing food properly can cut household food waste by 30%.",
    impact: "high",
    category: "diet",
    icon: "refresh-cw",
    savings: 4,
    badge: "Save Money Too",
  },

  // Lifestyle suggestions
  {
    id: "s13",
    title: "Buy fewer, better things",
    description: "Every product has a carbon footprint from manufacturing and shipping. Choosing quality items that last longer reduces per-use emissions.",
    impact: "medium",
    category: "lifestyle",
    icon: "package",
    savings: 2,
    badge: "Mindful Consumption",
  },
  {
    id: "s14",
    title: "Switch to a reusable water bottle",
    description: "A single reusable bottle eliminates hundreds of single-use plastic bottles per year, reducing both plastic waste and production emissions.",
    impact: "low",
    category: "lifestyle",
    icon: "water",
    savings: 0.5,
    badge: "Simple Switch",
  },
  {
    id: "s15",
    title: "Reduce, reuse, then recycle",
    description: "Recycling is good, but reducing consumption and reusing items has a much bigger carbon impact. Follow the 'waste hierarchy'.",
    impact: "medium",
    category: "lifestyle",
    icon: "archive",
    savings: 2,
    badge: "Foundational",
  },

  // Offset suggestions
  {
    id: "s16",
    title: "Offset unavoidable emissions with verified projects",
    description: "For emissions you can't avoid (like flights), invest in certified carbon offset projects — reforestation, renewable energy, or methane capture.",
    impact: "high",
    category: "offset",
    icon: "tree",
    savings: 10,
    badge: "Take Responsibility",
  },
  {
    id: "s17",
    title: "Plant native trees or support reforestation",
    description: "A mature tree absorbs ~20 kg CO₂ per year. Supporting native reforestation projects in your region combines carbon removal with biodiversity benefits.",
    impact: "medium",
    category: "offset",
    icon: "tree-deciduous",
    savings: 5,
    badge: "Nature Based",
  },
];

/**
 * Generate personalized suggestions based on user's activity history
 */
export function generateSuggestions(
  activities: Array<{ type: string; quantity: number }>,
  weeklyTarget: number,
): Suggestion[] {
  const suggestions: Suggestion[] = [];
  const usedIds = new Set<string>();

  // Count activities by type
  const typeCounts: Record<string, number> = {};
  let totalEmissions = 0;
  activities.forEach((a) => {
    typeCounts[a.type] = (typeCounts[a.type] || 0) + 1;
    totalEmissions += a.quantity;
  });

  // If user has lots of car trips, suggest transport alternatives
  if (typeCounts["car"] && typeCounts["car"] > 2) {
    const transportSuggestions = SUGGESTIONS.filter((s) => s.category === "transport");
    transportSuggestions.forEach((s) => {
      if (!usedIds.has(s.id) && suggestions.length < 6) {
        suggestions.push(s);
        usedIds.add(s.id);
      }
    });
  }

  // If user logs lots of electricity usage, suggest energy savings
  if (typeCounts["electricity"] && typeCounts["electricity"] > 1) {
    const energySuggestions = SUGGESTIONS.filter((s) => s.category === "energy");
    energySuggestions.forEach((s) => {
      if (!usedIds.has(s.id) && suggestions.length < 6) {
        suggestions.push(s);
        usedIds.add(s.id);
      }
    });
  }

  // If user logs meat meals, suggest diet changes
  if (typeCounts["non_veg_meal"] && typeCounts["non_veg_meal"] > 2) {
    const dietSuggestions = SUGGESTIONS.filter((s) => s.category === "diet");
    dietSuggestions.forEach((s) => {
      if (!usedIds.has(s.id) && suggestions.length < 6) {
        suggestions.push(s);
        usedIds.add(s.id);
      }
    });
  }

  // If weekly emissions are high relative to target, suggest offsets
  if (totalEmissions > weeklyTarget * 0.8) {
    const offsetSuggestions = SUGGESTIONS.filter((s) => s.category === "offset");
    offsetSuggestions.forEach((s) => {
      if (!usedIds.has(s.id) && suggestions.length < 6) {
        suggestions.push(s);
        usedIds.add(s.id);
      }
    });
  }

  // Always include at least 3 general suggestions
  const generalSuggestions = SUGGESTIONS.filter(
    (s) => s.category === "lifestyle" || s.category === "offset",
  );
  generalSuggestions.forEach((s) => {
    if (!usedIds.has(s.id) && suggestions.length < 8) {
      suggestions.push(s);
      usedIds.add(s.id);
    }
  });

  return suggestions.slice(0, 8);
}

/**
 * Get random suggestions for users with no activity history
 */
export function getWelcomeSuggestions(): Suggestion[] {
  return SUGGESTIONS.filter((s) => ["s1", "s3", "s6", "s10", "s13", "s16"].includes(s.id));
}

export default generateSuggestions;
