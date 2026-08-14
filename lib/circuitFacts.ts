// Supplementary circuit facts. Jolpica returns name, location, and coordinates
// but not physical track data, so these are curated.
//
// VERIFY BEFORE TRUSTING: these figures are from general knowledge, not a
// sourced dataset. Track layouts change (Singapore 2023, Barcelona's chicane,
// Melbourne 2022), so lengths and turn counts drift. Wikipedia or the FIA
// circuit homologation list are good sources if you want to check them.
//
// This file is optional — the circuit pages render fine without an entry here,
// they just show less detail.

export type CircuitFacts = {
  lengthKm: number;
  turns: number;
  firstGrandPrix: number;
  direction?: "clockwise" | "anti-clockwise";
};

export const circuitFacts: Record<string, CircuitFacts> = {
  bahrain: { lengthKm: 5.412, turns: 15, firstGrandPrix: 2004, direction: "clockwise" },
  jeddah: { lengthKm: 6.174, turns: 27, firstGrandPrix: 2021, direction: "anti-clockwise" },
  albert_park: { lengthKm: 5.278, turns: 14, firstGrandPrix: 1996, direction: "clockwise" },
  suzuka: { lengthKm: 5.807, turns: 18, firstGrandPrix: 1987, direction: "clockwise" },
  shanghai: { lengthKm: 5.451, turns: 16, firstGrandPrix: 2004, direction: "clockwise" },
  miami: { lengthKm: 5.412, turns: 19, firstGrandPrix: 2022, direction: "clockwise" },
  imola: { lengthKm: 4.909, turns: 19, firstGrandPrix: 1980, direction: "anti-clockwise" },
  monaco: { lengthKm: 3.337, turns: 19, firstGrandPrix: 1950, direction: "clockwise" },
  villeneuve: { lengthKm: 4.361, turns: 14, firstGrandPrix: 1978, direction: "clockwise" },
  catalunya: { lengthKm: 4.657, turns: 14, firstGrandPrix: 1991, direction: "clockwise" },
  red_bull_ring: { lengthKm: 4.318, turns: 10, firstGrandPrix: 1970, direction: "clockwise" },
  silverstone: { lengthKm: 5.891, turns: 18, firstGrandPrix: 1950, direction: "clockwise" },
  spa: { lengthKm: 7.004, turns: 19, firstGrandPrix: 1950, direction: "clockwise" },
  hungaroring: { lengthKm: 4.381, turns: 14, firstGrandPrix: 1986, direction: "clockwise" },
  zandvoort: { lengthKm: 4.259, turns: 14, firstGrandPrix: 1952, direction: "clockwise" },
  monza: { lengthKm: 5.793, turns: 11, firstGrandPrix: 1950, direction: "clockwise" },
  baku: { lengthKm: 6.003, turns: 20, firstGrandPrix: 2016, direction: "anti-clockwise" },
  marina_bay: { lengthKm: 4.940, turns: 19, firstGrandPrix: 2008, direction: "anti-clockwise" },
  americas: { lengthKm: 5.513, turns: 20, firstGrandPrix: 2012, direction: "anti-clockwise" },
  rodriguez: { lengthKm: 4.304, turns: 17, firstGrandPrix: 1963, direction: "clockwise" },
  interlagos: { lengthKm: 4.309, turns: 15, firstGrandPrix: 1973, direction: "anti-clockwise" },
  vegas: { lengthKm: 6.201, turns: 17, firstGrandPrix: 2023, direction: "anti-clockwise" },
  losail: { lengthKm: 5.419, turns: 16, firstGrandPrix: 2021, direction: "clockwise" },
  yas_marina: { lengthKm: 5.281, turns: 16, firstGrandPrix: 2009, direction: "anti-clockwise" },
};