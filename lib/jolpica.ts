// Shape of one row in the driver standings response.
// Jolpica returns a lot of fields; we only type the ones we use.
export type DriverStanding = {
  position: string;
  points: string;
  wins: string;
  Driver: {
    driverId: string;
    permanentNumber: string;
    givenName: string;
    familyName: string;
    nationality: string;
    code: string;
  };
  Constructors: Array<{
    constructorId: string;
    name: string;
  }>;
};

const BASE_URL = "https://api.jolpi.ca/ergast/f1";

export async function getDriverStandings(): Promise<DriverStanding[]> {
  const res = await fetch(`${BASE_URL}/current/driverstandings.json`, {
    // Cache the response for 1 hour. Standings only change after a race.
    next: { revalidate: 3600 },
  });

  if (!res.ok) {
    throw new Error(`Jolpica returned ${res.status}`);
  }

  const data = await res.json();
  return data.MRData.StandingsTable.StandingsLists[0]?.DriverStandings ?? [];
}

export type Session = {
  date: string;
  time: string;
};

export type Race = {
  season: string;
  round: string;
  url: string;
  raceName: string;
  Circuit: {
    circuitId: string;
    circuitName: string;
    Location: {
      lat: string;
      long: string;
      locality: string;
      country: string;
    };
  };
  date: string;
  time: string;
  FirstPractice?: Session;
  SecondPractice?: Session;
  ThirdPractice?: Session;
  Qualifying?: Session;
  Sprint?: Session;
  SprintQualifying?: Session;
};

export async function getNextRace(): Promise<Race | null> {
  const res = await fetch(`${BASE_URL}/current/next.json`, {
    // 30-minute cache. Session times don't change often, and if a race
    // just finished, we want the "next" endpoint to roll over promptly.
    next: { revalidate: 1800 },
  });

  if (!res.ok) {
    throw new Error(`Jolpica returned ${res.status}`);
  }

  const data = await res.json();
  return data.MRData.RaceTable.Races[0] ?? null;
}

export type ConstructorStanding = {
  position: string;
  points: string;
  wins: string;
  Constructor: {
    constructorId: string;
    name: string;
    nationality: string;
  };
};

export async function getConstructorStandings(): Promise<ConstructorStanding[]>
{
  const res = await fetch(`${BASE_URL}/current/constructorstandings.json`, {
    next: { revalidate: 3600 },
  });
  if (!res.ok) {
    throw new Error(`Jolpica returned ${res.status}`);
  }
  const data = await res.json();
  return (
    data.MRData.StandingsTable.StandingsLists[0]?.ConstructorStandings ?? []
  );
}

export type RaceResult = {
  number: string;
  position: string;
  positionText: string;
  points: string;
  grid: string;
  laps: string;
  status: string;
  Time?: { time: string };
};

export type RaceWithResults = {
  season: string;
  round: string;
  raceName: string;
  date: string;
  Circuit: {
    circuitId: string;
    circuitName: string;
    Location: {
      locality: string;
      country: string;
    };
  };
  Results: RaceResult[];
};

export async function getDriverSeason(driverId: string): Promise<{
  standing: DriverStanding;
  races: RaceWithResults[];
} | null> {
  const [standingRes, resultsRes] = await Promise.all([
    fetch(`${BASE_URL}/current/drivers/${driverId}/driverstandings.json`, {
      next: { revalidate: 3600 },
    }),
    fetch(`${BASE_URL}/current/drivers/${driverId}/results.json`, {
      next: { revalidate: 3600 },
    }),
  ]);

  if (!standingRes.ok || !resultsRes.ok) {
    return null;
  }

  const standingData = await standingRes.json();
  const resultsData = await resultsRes.json();

  const standing =
    standingData.MRData.StandingsTable.StandingsLists[0]?.DriverStandings?.[0];
  const races = resultsData.MRData.RaceTable.Races ?? [];

  if (!standing) return null;

  return { standing, races };
}

export async function getSeasonSchedule(): Promise<Race[]> {
  const res = await fetch(`${BASE_URL}/current.json`, {
    next: { revalidate: 3600 },
  });
  if (!res.ok) {
    throw new Error(`Jolpica returned ${res.status}`);
  }
  const data = await res.json();
  return data.MRData.RaceTable.Races ?? [];
}

// A full race result row (includes driver, constructor, fastest lap).
// Distinct from RaceResult, which is the trimmed version used in driver detail.
export type FullRaceResult = {
  number: string;
  position: string;
  points: string;
  Driver: {
    driverId: string;
    permanentNumber: string;
    givenName: string;
    familyName: string;
    code: string;
    nationality: string;
  };
  Constructor: {
    constructorId: string;
    name: string;
  };
  grid: string;
  laps: string;
  status: string;
  Time?: { time: string };
  FastestLap?: {
    rank: string;
    lap: string;
    Time: { time: string };
    AverageSpeed?: { units: string; speed: string };
  };
};

export type FullRaceResults = {
  season: string;
  round: string;
  raceName: string;
  date: string;
  time?: string;
  url?: string;
  Circuit: {
    circuitId: string;
    url: string;
    circuitName: string;
    Location: {
      lat: string;
      long: string;
      locality: string;
      country: string;
    };
  };
  Results: FullRaceResult[];
};

export async function getLastRace(): Promise<FullRaceResults | null> {
  const res = await fetch(`${BASE_URL}/current/last/results.json`, {
    next: { revalidate: 1800 },
  });
  if (!res.ok) return null;
  const data = await res.json();
  return data.MRData.RaceTable.Races[0] ?? null;
}

export async function getRaceResults(
  round: string
): Promise<FullRaceResults | null> {
  const res = await fetch(`${BASE_URL}/current/${round}/results.json`, {
    next: { revalidate: 3600 },
  });
  if (!res.ok) return null;
  const data = await res.json();
  return data.MRData.RaceTable.Races[0] ?? null;
}

export async function getConstructorSeason(constructorId: string): Promise<{
  standing: ConstructorStanding;
  races: FullRaceResults[];
} | null> {
  const [standingRes, resultsRes] = await Promise.all([
    fetch(
      `${BASE_URL}/current/constructors/${constructorId}/constructorstandings.json`,
      { next: { revalidate: 3600 } }
    ),
    fetch(`${BASE_URL}/current/constructors/${constructorId}/results.json`, {
      next: { revalidate: 3600 },
    }),
  ]);
  if (!standingRes.ok || !resultsRes.ok) return null;

  const standingData = await standingRes.json();
  const resultsData = await resultsRes.json();

  const standing =
    standingData.MRData.StandingsTable.StandingsLists[0]
      ?.ConstructorStandings?.[0];
  const races = resultsData.MRData.RaceTable.Races ?? [];

  if (!standing) return null;
  return { standing, races };
}

export async function getSeasonsList(): Promise<string[]> {
  // limit=100 because the default page size is 30 and there are 75+ seasons.
  const res = await fetch(`${BASE_URL}/seasons.json?limit=100`, {
    next: { revalidate: 86400 }, // 24h — this list changes once a year
  });
  if (!res.ok) throw new Error(`Jolpica returned ${res.status}`);
  const data = await res.json();
  return (data.MRData.SeasonTable.Seasons ?? []).map(
    (s: { season: string }) => s.season
  );
}

export async function getSeasonSummary(year: string): Promise<{
  races: Race[];
  driverStandings: DriverStanding[];
  constructorStandings: ConstructorStanding[];
} | null> {
  const [racesRes, driversRes, constructorsRes] = await Promise.all([
    fetch(`${BASE_URL}/${year}.json?limit=100`, {
      next: { revalidate: 86400 },
    }),
    fetch(`${BASE_URL}/${year}/driverstandings.json?limit=100`, {
      next: { revalidate: 86400 },
    }),
    fetch(`${BASE_URL}/${year}/constructorstandings.json?limit=100`, {
      next: { revalidate: 86400 },
    }),
  ]);

  if (!racesRes.ok || !driversRes.ok) return null;

  const racesData = await racesRes.json();
  const driversData = await driversRes.json();

  const races = racesData.MRData.RaceTable.Races ?? [];
  const driverStandings =
    driversData.MRData.StandingsTable.StandingsLists[0]?.DriverStandings ?? [];

  // The Constructors' Championship only started in 1958 — earlier seasons
  // legitimately have no constructor standings. Don't treat that as an error.
  let constructorStandings: ConstructorStanding[] = [];
  if (constructorsRes.ok) {
    const constructorsData = await constructorsRes.json();
    constructorStandings =
      constructorsData.MRData.StandingsTable.StandingsLists[0]
        ?.ConstructorStandings ?? [];
  }

  if (races.length === 0 && driverStandings.length === 0) return null;

  return { races, driverStandings, constructorStandings };
}

export type Circuit = {
  circuitId: string;
  url: string;
  circuitName: string;
  Location: {
    lat: string;
    long: string;
    locality: string;
    country: string;
  };
};

export async function getCircuitsList(): Promise<Circuit[]> {
  const res = await fetch(`${BASE_URL}/circuits.json?limit=100`, {
    next: { revalidate: 86400 },
  });
  if (!res.ok) {
    console.error(`[getCircuitsList] returned ${res.status}`);
    return [];
  }
  const data = await res.json();
  return data.MRData.CircuitTable.Circuits ?? [];
}

export async function getCircuitWinners(
  circuitId: string
): Promise<FullRaceResults[] | null> {
  const url = `${BASE_URL}/circuits/${circuitId}/results/1.json?limit=100`;
  const res = await fetch(url, { next: { revalidate: 86400 } });
  if (!res.ok) {
    console.error(`[getCircuitWinners] ${url} returned ${res.status}`);
    return null;
  }
  const data = await res.json();
  const races = data.MRData.RaceTable.Races ?? [];
  if (races.length === 0) return null;
  return races;
}

/* ------------------------------------------------------------------ */
/*  Championship progression — powers the chart on /standings          */
/* ------------------------------------------------------------------ */

export type ChampionshipDriver = {
  driverId: string;
  familyName: string;
  constructorId: string;
  totalPoints: number;
};

// One row per round. Always carries `round` and `raceName`; the remaining keys
// are driverIds mapped to that driver's cumulative points after the round.
export type ProgressionRow = Record<string, number | string>;

export async function getChampionshipProgression(topN = 5): Promise<{
  rows: ProgressionRow[];
  drivers: ChampionshipDriver[];
} | null> {
  const [raceRes, sprintRes] = await Promise.all([
    fetch(`${BASE_URL}/current/results.json?limit=1000`, {
      next: { revalidate: 3600 },
    }),
    fetch(`${BASE_URL}/current/sprint.json?limit=1000`, {
      next: { revalidate: 3600 },
    }),
  ]);

  if (!raceRes.ok) {
    console.error(`[getChampionshipProgression] results: ${raceRes.status}`);
    return null;
  }

  const raceData = await raceRes.json();
  const races = raceData.MRData.RaceTable.Races ?? [];
  if (races.length === 0) return null;

  // Sprint points count toward the championship. If that endpoint fails we
  // still render, but totals would drift from official standings — so warn.
  const sprintByRound: Record<string, Record<string, number>> = {};
  if (sprintRes.ok) {
    const sprintData = await sprintRes.json();
    for (const s of sprintData.MRData.RaceTable.Races ?? []) {
      const perDriver: Record<string, number> = {};
      for (const r of s.SprintResults ?? []) {
        perDriver[r.Driver.driverId] = parseFloat(r.points ?? "0");
      }
      sprintByRound[s.round] = perDriver;
    }
  } else {
    console.warn(
      `[getChampionshipProgression] sprint: ${sprintRes.status} — totals exclude sprint points`
    );
  }

  const running: Record<string, number> = {};
  const meta: Record<string, { familyName: string; constructorId: string }> = {};
  const rows: ProgressionRow[] = [];

  const ordered = [...races].sort(
    (a, b) => parseInt(a.round) - parseInt(b.round)
  );

  for (const race of ordered) {
    const sprintPts = sprintByRound[race.round] ?? {};

    for (const result of race.Results ?? []) {
      const id = result.Driver.driverId;
      const racePts = parseFloat(result.points ?? "0");
      running[id] = (running[id] ?? 0) + racePts + (sprintPts[id] ?? 0);
      meta[id] = {
        familyName: result.Driver.familyName,
        constructorId: result.Constructor.constructorId,
      };
    }

    const row: ProgressionRow = {
      round: parseInt(race.round),
      raceName: race.raceName,
    };
    for (const id of Object.keys(running)) {
      row[id] = running[id];
    }
    rows.push(row);
  }

  const drivers = Object.keys(meta)
    .map((driverId) => ({
      driverId,
      familyName: meta[driverId].familyName,
      constructorId: meta[driverId].constructorId,
      totalPoints: running[driverId] ?? 0,
    }))
    .sort((a, b) => b.totalPoints - a.totalPoints)
    .slice(0, topN);

  return { rows, drivers };
}

/* ------------------------------------------------------------------ */
/*  Lap-by-lap data — powers the race analysis chart                   */
/* ------------------------------------------------------------------ */

export type LapDriver = {
  driverId: string;
  code: string;
  familyName: string;
  constructorId: string;
  finalPosition: number;
};

export type LapRow = Record<string, number | null>;

type LapTiming = { driverId: string; position: string; time: string };

type JolpicaLapPage = {
  MRData: {
    limit?: string;
    total?: string;
    RaceTable: {
      Races?: Array<{
        Laps?: Array<{ number: string; Timings: LapTiming[] }>;
      }>;
    };
  };
};

// Converts "1:25.272" to 85.272 seconds. Returns null for anything unparseable.
function lapTimeToSeconds(time: string): number | null {
  if (!time) return null;
  const parts = time.split(":");
  if (parts.length === 2) {
    return parseInt(parts[0]) * 60 + parseFloat(parts[1]);
  }
  const asNumber = parseFloat(time);
  return isNaN(asNumber) ? null : asNumber;
}

export async function getRaceLaps(
  season: string,
  round: string
): Promise<{
  positionRows: LapRow[];
  timeRows: LapRow[];
  drivers: LapDriver[];
  fastestLapSeconds: number;
} | null> {
  const buildUrl = (limit: number, offset: number) =>
    `${BASE_URL}/${season}/${round}/laps.json?limit=${limit}&offset=${offset}`;

  // The first page reports the server's real page size and total row count,
  // so we can paginate without hardcoding assumptions.
  const firstRes = await fetch(buildUrl(1000, 0), {
    next: { revalidate: 86400 },
  });
  if (!firstRes.ok) {
    console.error(`[getRaceLaps] first page returned ${firstRes.status}`);
    return null;
  }

  const firstData: JolpicaLapPage = await firstRes.json();
  const pageSize = parseInt(firstData.MRData.limit ?? "100");
  const total = parseInt(firstData.MRData.total ?? "0");
  if (total === 0) return null;

  // lapNumber -> array of { driverId, position, time }
  const lapBuckets: Record<number, LapTiming[]> = {};

  function absorb(data: JolpicaLapPage) {
    const laps = data?.MRData?.RaceTable?.Races?.[0]?.Laps ?? [];
    for (const lap of laps) {
      const n = parseInt(lap.number);
      if (!lapBuckets[n]) lapBuckets[n] = [];
      lapBuckets[n].push(...lap.Timings);
    }
  }

  absorb(firstData);

  const offsets: number[] = [];
  for (let o = pageSize; o < total; o += pageSize) offsets.push(o);

  // Small parallel batches rather than all at once — polite to a
  // community-run API.
  const BATCH = 4;
  for (let i = 0; i < offsets.length; i += BATCH) {
    const batch = offsets.slice(i, i + BATCH);
    const responses = await Promise.all(
      batch.map((o) =>
        fetch(buildUrl(pageSize, o), { next: { revalidate: 86400 } })
      )
    );
    for (const res of responses) {
      if (!res.ok) {
        console.warn(`[getRaceLaps] a page returned ${res.status}`);
        continue;
      }
      absorb(await res.json());
    }
  }

  // Lap timings only carry driverId, so pull names and teams from the results.
  const results = await getRaceResults(round);
  const meta: Record<string, LapDriver> = {};
  for (const r of results?.Results ?? []) {
    meta[r.Driver.driverId] = {
      driverId: r.Driver.driverId,
      code: r.Driver.code,
      familyName: r.Driver.familyName,
      constructorId: r.Constructor.constructorId,
      finalPosition: parseInt(r.position) || 99,
    };
  }

  const lapNumbers = Object.keys(lapBuckets)
    .map((k) => parseInt(k))
    .sort((a, b) => a - b);

  const positionRows: LapRow[] = [];
  const timeRows: LapRow[] = [];
  let fastest = Infinity;

  for (const n of lapNumbers) {
    const posRow: LapRow = { lap: n };
    const timeRow: LapRow = { lap: n };

    for (const t of lapBuckets[n]) {
      posRow[t.driverId] = parseInt(t.position);
      const secs = lapTimeToSeconds(t.time);
      timeRow[t.driverId] = secs;
      if (secs !== null && secs < fastest) fastest = secs;
    }

    positionRows.push(posRow);
    timeRows.push(timeRow);
  }

  const drivers = Object.values(meta).sort(
    (a, b) => a.finalPosition - b.finalPosition
  );

  return {
    positionRows,
    timeRows,
    drivers,
    fastestLapSeconds: fastest === Infinity ? 0 : fastest,
  };
}