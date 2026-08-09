// F1 team colors keyed by Jolpica's constructorId (Ergast convention).
// Sourced from 2026 team liveries — tweak the hex codes to taste.

export const teamColors: Record<string, string> = {
  red_bull: "#3671C6",       // Electric blue — 2026 throwback livery
  ferrari: "#E8002D",        // Ferrari red
  mercedes: "#27F4D2",       // Silver Arrows turquoise
  mclaren: "#FF8000",        // Papaya orange
  aston_martin: "#358C75",   // British Racing Green
  alpine: "#2293D1",         // Alpine blue
  williams: "#64C4FF",       // Williams gloss blue
  rb: "#6692FF",             // Racing Bulls (Ford accent)
  haas: "#E6002B",           // Haas / Toyota red
  sauber: "#00A950",         // Audi (Sauber → Audi transition)
  cadillac: "#C4C4C4",       // Cadillac silver
};

const DEFAULT_TEAM_COLOR = "#666666";

export function getTeamColor(constructorId: string): string {
  return teamColors[constructorId] ?? DEFAULT_TEAM_COLOR;
}