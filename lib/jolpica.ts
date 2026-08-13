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

export async function getConstructorStandings(): Promise<ConstructorStanding[]> {
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
    standingData.MRData.StandingsTable.StandingsLists[0]
      ?.DriverStandings?.[0];
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
    fetch(`${BASE_URL}/${year}.json?limit=100`, { next: { revalidate: 86400 } }),
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