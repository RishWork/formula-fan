// F1 team colors keyed by Jolpica's constructorId (Ergast convention).
// Current teams sourced from 2026 liveries; historical teams added for the
// season archive.

export const teamColors: Record<string, string> = {
  // Current teams (2026)
  red_bull: "#3671C6",
  ferrari: "#E8002D",
  mercedes: "#27F4D2",
  mclaren: "#FF8000",
  aston_martin: "#358C75",
  alpine: "#2293D1",
  williams: "#64C4FF",
  rb: "#6692FF",
  haas: "#E6002B",
  sauber: "#00A950",
  cadillac: "#C4C4C4",

  // Historical teams (for the season archive)
  alfa: "#8B0000",
  maserati: "#0F52BA",
  cooper: "#1B5E20",
  brm: "#1B5E20",
  lotus: "#004225",
  brabham: "#1B5E20",
  matra: "#0055A4",
  tyrrell: "#1565C0",
  benetton: "#00A551",
  renault: "#FFD800",
  brawn: "#B8E62E",
};

const DEFAULT_TEAM_COLOR = "#666666";

export function getTeamColor(constructorId: string): string {
  return teamColors[constructorId] ?? DEFAULT_TEAM_COLOR;
}