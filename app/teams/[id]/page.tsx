import { notFound } from "next/navigation";
import Link from "next/link";
import { getConstructorSeason, FullRaceResult } from "@/lib/jolpica";
import { getTeamColor } from "@/lib/teamColors";

export default async function TeamPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await getConstructorSeason(id);

  if (!data) {
    notFound();
  }

  const { standing, races } = data;
  const constructor = standing.Constructor;
  const teamColor = getTeamColor(constructor.constructorId);

  // Extract unique drivers from all race results.
  const driversMap = new Map<string, FullRaceResult["Driver"]>();
  for (const race of races) {
    for (const result of race.Results) {
      if (!driversMap.has(result.Driver.driverId)) {
        driversMap.set(result.Driver.driverId, result.Driver);
      }
    }
  }
  const drivers = Array.from(driversMap.values());

  return (
    <main className="min-h-screen px-6 py-12">
      <div className="mx-auto max-w-5xl">
        {/* Breadcrumb */}
        <div className="mb-6 font-mono text-xs uppercase tracking-[0.2em] text-zinc-500">
          <Link
            href="/standings"
            className="transition-colors hover:text-zinc-300"
          >
            ← Back to standings
          </Link>
        </div>

        {/* Hero */}
        <div
          className="mb-10 overflow-hidden rounded-lg border border-zinc-800 bg-[#14141a] shadow-2xl shadow-black/50"
          style={{ borderLeft: `4px solid ${teamColor}` }}
        >
          <div className="grid grid-cols-1 gap-6 p-8 md:grid-cols-[auto_1fr] md:items-center">
            <div
              className="flex h-32 w-32 items-center justify-center rounded-lg shadow-lg"
              style={{ backgroundColor: teamColor }}
            >
              <span className="text-5xl font-black text-white/90">
                {constructor.name.charAt(0)}
              </span>
            </div>
            <div>
              <div className="mb-2 font-mono text-xs uppercase tracking-[0.3em] text-zinc-500">
                2026 · Constructor · {constructor.nationality}
              </div>
              <h1 className="text-5xl font-bold tracking-tight text-white">
                {constructor.name}
              </h1>
            </div>
          </div>

          {/* Stats bar */}
          <div className="grid grid-cols-4 gap-px border-t border-zinc-800 bg-zinc-800">
            <StatBlock label="Position" value={standing.position} />
            <StatBlock label="Points" value={standing.points} />
            <StatBlock label="Wins" value={standing.wins} />
            <StatBlock label="Drivers" value={String(drivers.length)} />
          </div>
        </div>

        {/* Drivers */}
        <section className="mb-10">
          <h2 className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
            Drivers
          </h2>
          <div className="grid gap-3 md:grid-cols-2">
            {drivers.map((driver) => (
              <Link
                key={driver.driverId}
                href={`/drivers/${driver.driverId}`}
                className="group flex items-center gap-4 rounded-lg border border-zinc-800 bg-[#14141a] p-5 transition-colors hover:bg-zinc-900/60"
                style={{ borderLeft: `3px solid ${teamColor}` }}
              >
                <div
                  className="flex h-12 w-14 items-center justify-center rounded text-lg font-bold italic tabular-nums text-white shadow-sm"
                  style={{ backgroundColor: teamColor }}
                >
                  {driver.permanentNumber}
                </div>
                <div className="text-white">
                  <div className="text-sm font-light">{driver.givenName}</div>
                  <div className="text-xl font-bold uppercase tracking-wide">
                    {driver.familyName}
                  </div>
                  <div className="mt-1 text-xs text-zinc-500">
                    {driver.code} · {driver.nationality}
                  </div>
                </div>
                <div className="ml-auto text-zinc-600 opacity-0 transition-opacity group-hover:opacity-100">
                  →
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Season Results */}
        <section>
          <h2 className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
            Season Results
          </h2>
          <div className="overflow-hidden rounded-lg border border-zinc-800 bg-[#14141a] shadow-2xl shadow-black/50">
            <div className="grid grid-cols-[48px_1fr_1fr_1fr_80px] gap-4 border-b border-zinc-800 px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.15em] text-zinc-500">
              <div>Rd</div>
              <div>Grand Prix</div>
              <div>Driver 1</div>
              <div>Driver 2</div>
              <div className="text-right">Team Pts</div>
            </div>

            {races.map((race) => {
              const [r1, r2] = race.Results;
              const totalPts =
                parseFloat(r1?.points ?? "0") +
                parseFloat(r2?.points ?? "0");
              return (
                <div
                  key={race.round}
                  className="grid grid-cols-[48px_1fr_1fr_1fr_80px] items-center gap-4 border-b border-zinc-800/60 px-5 py-4 last:border-b-0"
                >
                  <div className="font-mono text-sm tabular-nums text-zinc-500">
                    {race.round}
                  </div>
                  <div>
                    <div className="text-sm text-white">{race.raceName}</div>
                    <div className="text-xs text-zinc-500">
                      {race.Circuit.Location.country}
                    </div>
                  </div>
                  <DriverResultCell result={r1} />
                  <DriverResultCell result={r2} />
                  <div className="text-right font-mono text-sm font-bold tabular-nums text-white">
                    {totalPts}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </main>
  );
}

function StatBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-[#14141a] p-6 text-center">
      <div className="text-3xl font-bold tabular-nums text-white">{value}</div>
      <div className="mt-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-500">
        {label}
      </div>
    </div>
  );
}

function DriverResultCell({ result }: { result: FullRaceResult | undefined }) {
  if (!result) return <div className="text-xs text-zinc-600">—</div>;
  const isFinishedNumerically = /^\d+$/.test(result.position);
  const posLabel = isFinishedNumerically ? `P${result.position}` : "DNF";
  return (
    <div className="text-sm">
      <span className="font-bold uppercase text-white">
        {result.Driver.code}
      </span>{" "}
      <span className="text-zinc-500">{posLabel}</span>{" "}
      <span className="font-mono tabular-nums text-zinc-400">
        {result.points}pt
      </span>
    </div>
  );
}