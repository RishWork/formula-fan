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