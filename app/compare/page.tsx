import {
  getDriverStandings,
  getDriverSeason,
  DriverStanding,
  RaceWithResults,
} from "@/lib/jolpica";
import { getTeamColor } from "@/lib/teamColors";
import DriverSelector from "@/components/DriverSelector";

type DriverSeasonData = {
  standing: DriverStanding;
  races: RaceWithResults[];
};

type Stats = {
  position: number;
  points: number;
  wins: number;
  podiums: number;
  pointsFinishes: number;
  dnfs: number;
};

function calculateStats(data: DriverSeasonData): Stats {
  const { standing, races } = data;
  return {
    position: parseInt(standing.position),
    points: parseFloat(standing.points),
    wins: parseInt(standing.wins),
    podiums: races.filter((r) => {
      const pos = parseInt(r.Results[0]?.position ?? "0");
      return pos > 0 && pos <= 3;
    }).length,
    pointsFinishes: races.filter(
      (r) => parseFloat(r.Results[0]?.points ?? "0") > 0
    ).length,
    dnfs: races.filter((r) => !/^\d+$/.test(r.Results[0]?.position ?? ""))
      .length,
  };
}

export default async function ComparePage({
  searchParams,
}: {
  searchParams: Promise<{ driver1?: string; driver2?: string }>;
}) {
  const { driver1, driver2 } = await searchParams;

  // Always fetch the driver list for the selectors.
  // In parallel, fetch season data for any selected drivers.
  const [drivers, data1, data2] = await Promise.all([
    getDriverStandings(),
    driver1 ? getDriverSeason(driver1) : Promise.resolve(null),
    driver2 ? getDriverSeason(driver2) : Promise.resolve(null),
  ]);

  const bothSelected = data1 && data2;

  return (
    <main className="min-h-screen px-6 py-12">
      <div className="mx-auto max-w-5xl">
        <header className="mb-10">
          <div className="mb-3 font-mono text-xs uppercase tracking-[0.3em] text-zinc-500">
            2026 Season
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-white">
            Head-to-Head
          </h1>
          <div className="mt-3 h-1 w-12 bg-[#e10600]" />
          <p className="mt-4 text-zinc-400">
            Compare any two drivers' seasons side by side.
          </p>
        </header>

        {/* Selectors */}
        <section className="mb-10 grid gap-4 md:grid-cols-[1fr_auto_1fr] md:items-end">
          <DriverSelector drivers={drivers} position={1} label="Driver 1" />
          <div className="hidden pb-3 text-center font-mono text-sm font-bold uppercase tracking-widest text-zinc-500 md:block">
            vs
          </div>
          <DriverSelector drivers={drivers} position={2} label="Driver 2" />
        </section>

        {bothSelected ? (
          <Comparison data1={data1} data2={data2} />
        ) : (
          <div className="rounded-lg border border-dashed border-zinc-800 bg-zinc-900/40 px-8 py-16 text-center">
            <p className="text-zinc-500">
              Select two drivers above to see their head-to-head.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}

function Comparison({
  data1,
  data2,
}: {
  data1: DriverSeasonData;
  data2: DriverSeasonData;
}) {
  const stats1 = calculateStats(data1);
  const stats2 = calculateStats(data2);
  const d1 = data1.standing.Driver;
  const d2 = data2.standing.Driver;
  const t1 = data1.standing.Constructors[0];
  const t2 = data2.standing.Constructors[0];
  const c1 = getTeamColor(t1?.constructorId ?? "");
  const c2 = getTeamColor(t2?.constructorId ?? "");

  // Race-by-race head-to-head.
  const races1Map = new Map(data1.races.map((r) => [r.round, r]));
  const races2Map = new Map(data2.races.map((r) => [r.round, r]));
  const rounds = Array.from(
    new Set([...races1Map.keys(), ...races2Map.keys()])
  ).sort((a, b) => parseInt(a) - parseInt(b));

  let d1Wins = 0;
  let d2Wins = 0;
  for (const r of rounds) {
    const p1 = parseInt(races1Map.get(r)?.Results[0]?.position ?? "");
    const p2 = parseInt(races2Map.get(r)?.Results[0]?.position ?? "");
    if (isNaN(p1) && isNaN(p2)) continue;
    if (isNaN(p1)) d2Wins++;
    else if (isNaN(p2)) d1Wins++;
    else if (p1 < p2) d1Wins++;
    else if (p2 < p1) d2Wins++;
  }

  return (
    <>
      {/* Driver header cards */}
      <div className="mb-8 grid gap-3 md:grid-cols-2">
        <DriverHeader driver={d1} team={t1} color={c1} />
        <DriverHeader driver={d2} team={t2} color={c2} />
      </div>

      {/* Stat comparison */}
      <section className="mb-10 overflow-hidden rounded-lg border border-zinc-800 bg-[#14141a] shadow-2xl shadow-black/50">
        <StatRow label="Position" value1={stats1.position} value2={stats2.position} lowerIsBetter c1={c1} c2={c2} />
        <StatRow label="Points" value1={stats1.points} value2={stats2.points} c1={c1} c2={c2} />
        <StatRow label="Wins" value1={stats1.wins} value2={stats2.wins} c1={c1} c2={c2} />
        <StatRow label="Podiums" value1={stats1.podiums} value2={stats2.podiums} c1={c1} c2={c2} />
        <StatRow label="Points Finishes" value1={stats1.pointsFinishes} value2={stats2.pointsFinishes} c1={c1} c2={c2} />
        <StatRow label="DNFs" value1={stats1.dnfs} value2={stats2.dnfs} lowerIsBetter c1={c1} c2={c2} />
      </section>

      {/* Head-to-head big number */}
      <section className="mb-10 rounded-lg border border-zinc-800 bg-[#14141a] px-6 py-8 shadow-2xl shadow-black/50">
        <div className="mb-4 text-center font-mono text-xs uppercase tracking-[0.3em] text-zinc-500">
          Race-by-race Head-to-head
        </div>
        <div className="flex items-center justify-center gap-8 text-5xl font-bold tabular-nums">
          <span style={{ color: d1Wins >= d2Wins ? c1 : "#52525b" }}>{d1Wins}</span>
          <span className="text-3xl text-zinc-700">—</span>
          <span style={{ color: d2Wins >= d1Wins ? c2 : "#52525b" }}>{d2Wins}</span>
        </div>
        <div className="mt-3 text-center font-mono text-xs uppercase tracking-widest text-zinc-500">
          {d1Wins > d2Wins
            ? `${d1.familyName} leads`
            : d2Wins > d1Wins
              ? `${d2.familyName} leads`
              : "Dead heat"}
        </div>
      </section>

      {/* Race-by-race table */}
      <section>
        <h2 className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
          Race by Race
        </h2>
        <div className="overflow-hidden rounded-lg border border-zinc-800 bg-[#14141a] shadow-2xl shadow-black/50">
          <div className="grid grid-cols-[48px_1fr_80px_80px_100px] gap-4 border-b border-zinc-800 px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.15em] text-zinc-500">
            <div>Rd</div>
            <div>Grand Prix</div>
            <div className="text-right">{d1.code}</div>
            <div className="text-right">{d2.code}</div>
            <div className="text-right">Ahead</div>
          </div>

          {rounds.map((round) => {
            const r1 = races1Map.get(round);
            const r2 = races2Map.get(round);
            const race = r1 ?? r2;
            const p1 = parseInt(r1?.Results[0]?.position ?? "");
            const p2 = parseInt(r2?.Results[0]?.position ?? "");
            const p1Text = isNaN(p1) ? "DNF" : `P${p1}`;
            const p2Text = isNaN(p2) ? "DNF" : `P${p2}`;

            let ahead: "1" | "2" | "none" = "none";
            if (isNaN(p1) && isNaN(p2)) ahead = "none";
            else if (isNaN(p1)) ahead = "2";
            else if (isNaN(p2)) ahead = "1";
            else if (p1 < p2) ahead = "1";
            else if (p2 < p1) ahead = "2";

            return (
              <div
                key={round}
                className="grid grid-cols-[48px_1fr_80px_80px_100px] items-center gap-4 border-b border-zinc-800/60 px-5 py-3 last:border-b-0"
              >
                <div className="font-mono text-sm tabular-nums text-zinc-500">
                  {round}
                </div>
                <div className="truncate text-sm text-white">
                  {race?.raceName}
                </div>
                <div
                  className="text-right font-mono text-sm font-bold tabular-nums"
                  style={{ color: ahead === "1" ? c1 : "#a1a1aa" }}
                >
                  {p1Text}
                </div>
                <div
                  className="text-right font-mono text-sm font-bold tabular-nums"
                  style={{ color: ahead === "2" ? c2 : "#a1a1aa" }}
                >
                  {p2Text}
                </div>
                <div
                  className="text-right font-mono text-xs font-bold uppercase tracking-widest"
                  style={{
                    color: ahead === "1" ? c1 : ahead === "2" ? c2 : "#52525b",
                  }}
                >
                  {ahead === "1" ? d1.code : ahead === "2" ? d2.code : "—"}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </>
  );
}

function DriverHeader({
  driver,
  team,
  color,
}: {
  driver: DriverStanding["Driver"];
  team?: { name: string; constructorId: string };
  color: string;
}) {
  return (
    <div
      className="overflow-hidden rounded-lg border border-zinc-800 bg-[#14141a] p-6 shadow-2xl shadow-black/50"
      style={{ borderTop: `4px solid ${color}` }}
    >
      <div className="flex items-center gap-4">
        <div
          className="flex h-16 w-20 items-center justify-center rounded-lg text-2xl font-bold italic tabular-nums text-white shadow-sm"
          style={{ backgroundColor: color }}
        >
          {driver.permanentNumber}
        </div>
        <div>
          <div className="mb-1 font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">
            {driver.code} · {driver.nationality}
          </div>
          <div className="text-2xl font-bold uppercase tracking-wide text-white">
            {driver.familyName}
          </div>
          <div className="text-sm font-light text-zinc-400">
            {driver.givenName}
          </div>
          <div className="mt-2 text-xs text-zinc-500">{team?.name}</div>
        </div>
      </div>
    </div>
  );
}

function StatRow({
  label,
  value1,
  value2,
  c1,
  c2,
  lowerIsBetter = false,
}: {
  label: string;
  value1: number;
  value2: number;
  c1: string;
  c2: string;
  lowerIsBetter?: boolean;
}) {
  const oneWins = lowerIsBetter ? value1 < value2 : value1 > value2;
  const twoWins = lowerIsBetter ? value2 < value1 : value2 > value1;

  return (
    <div className="grid grid-cols-3 items-center border-b border-zinc-800/60 px-6 py-4 last:border-b-0">
      <div
        className="text-2xl font-bold tabular-nums"
        style={{ color: oneWins ? c1 : "#52525b" }}
      >
        {value1}
      </div>
      <div className="text-center font-mono text-xs uppercase tracking-[0.2em] text-zinc-500">
        {label}
      </div>
      <div
        className="text-right text-2xl font-bold tabular-nums"
        style={{ color: twoWins ? c2 : "#52525b" }}
      >
        {value2}
      </div>
    </div>
  );
}