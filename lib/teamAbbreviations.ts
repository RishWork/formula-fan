// Three-letter constructor codes, as used in F1 broadcast graphics.
// Keyed by Jolpica constructorId.

export const teamAbbreviations: Record<string, string> = {
  // Current teams (2026)
  red_bull: "RBR",
  ferrari: "FER",
  mercedes: "MER",
  mclaren: "MCL",
  aston_martin: "AMR",
  alpine: "ALP",
  williams: "WIL",
  rb: "RB",
  haas: "HAA",
  sauber: "AUD",
  cadillac: "CAD",

  // Historical teams
  alfa: "ALF",
  maserati: "MAS",
  cooper: "COO",
  brm: "BRM",
  lotus: "LOT",
  brabham: "BRA",
  matra: "MAT",
  tyrrell: "TYR",
  benetton: "BEN",
  renault: "REN",
  brawn: "BRW",
};

export function getTeamAbbreviation(
  constructorId: string,
  fallbackName?: string
): string {
  const known = teamAbbreviations[constructorId];
  if (known) return known;
  // Derive a 3-letter code from the team name if we don't have one mapped.
  if (fallbackName) {
    return fallbackName.replace(/[^a-zA-Z]/g, "").slice(0, 3).toUpperCase();
  }
  return "???";
}