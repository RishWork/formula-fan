import { notFound } from "next/navigation";
import Link from "next/link";
import { getCircuitWinners } from "@/lib/jolpica";
import { circuitFacts } from "@/lib/circuitFacts";
import { getTeamColor } from "@/lib/teamColors";
import TeamBadge from "@/components/TeamBadge";

type WinTally = { id: string; name: string; count: number };

const EXTERNAL_LINK_CLASS =
  "font-mono text-xs uppercase tracking-[0.15em] transition-colors hover:text-white";

export default async function CircuitPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const races = await getCircuitWinners(id);

  if (!races || races.length === 0) {
    notFound();
  }

  const circuit = races[0].Circuit;
  const facts = circuitFacts[id];

  const ordered = [...races].sort(
    (a, b) => parseInt(b.season) - parseInt(a.season)
  );

  const firstYear = races[0].season;
  const lastYear = ordered[0].season;

  const driverWins: Record<string, WinTally> = {};
  const constructorWins: Record<string, WinTally> = {};

  for (const race of races) {
    const result = race.Results[0];
    if (!result) continue;

    const dId = result.Driver.driverId;
    driverWins[dId] = {
      id: dId,
      name: `${result.Driver.givenName} ${result.Driver.familyName}`,
      count: (driverWins[dId]?.count ?? 0) + 1,
    };

    const cId = result.Constructor.constructorId;
    constructorWins[cId] = {
      id: cId,
      name: result.Constructor.name,
      count: (constructorWins[cId]?.count ?? 0) + 1,
    };
  }

  const topDrivers = Object.values(driverWins)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
  const topConstructors = Object.values(constructorWins)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${circuit.Location.lat},${circuit.Location.long}`;

  return (
    <main className="min-h-screen px-6 py-12">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 font-mono text-xs uppercase tracking-[0.2em] text-zinc-500">
          <Link href="/circuits" className="transition-colors hover:text-zinc-300">
            ← All circuits
          </Link>
        </div>

        <header className="mb-8">
          <div className="mb-3 font-mono text-xs uppercase tracking-[0.3em] text-zinc-500">
            {circuit.Location.country}
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
            {circuit.circuitName}
          </h1>
          <div className="mt-3 h-1 w-12 bg-[#e10600]" />
          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-zinc-400">
            <span>{circuit.Location.locality}</span>
            <span className="text-zinc-700">·</span>
            <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className={EXTERNAL_LINK_CLASS}>View on map ↗</a>
            <span className="text-zinc-700">·</span>
            <a href={circuit.url} target="_blank" rel="noopener noreferrer" className={EXTERNAL_LINK_CLASS}>Wikipedia ↗</a>
          </div>
        </header>

        <div className="mb-10 overflow-hidden rounded-lg border border-zinc-800 bg-[#14141a] shadow-2xl shadow-black/50">
          <div className="grid grid-cols-2 gap-px bg-zinc-800 sm:grid-cols-4">
            <Stat label="Grands Prix" value={String(races.length)} />
            <Stat label="First Held" value={firstYear} />
            <Stat label="Most Recent" value={lastYear} />
            <Stat label="Length" value={facts ? `${facts.lengthKm} km` : "—"} />
          </div>
          {facts && (
            <div className="grid grid-cols-3 gap-px border-t border-zinc-800 bg-zinc-800">
              <Stat label="Turns" value={String(facts.turns)} />
              <Stat
                label="Direction"
                value={
                  facts.direction === "anti-clockwise" ? "Anti-CW" : "Clockwise"
                }
              />
              <Stat label="Circuit Debut" value={String(facts.firstGrandPrix)} />
            </div>
          )}
        </div>

        <section className="mb-10 grid gap-4 md:grid-cols-2">
          <div className="overflow-hidden rounded-lg border border-zinc-800 bg-[#14141a] shadow-2xl shadow-black/50">
            <div className="border-b border-zinc-800 px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-500">
              Most Wins — Drivers
            </div>
            {topDrivers.map((d) => (
              <Link
                key={d.id}
                href={`/drivers/${d.id}`}
                className="group flex items-center justify-between border-b border-zinc-800/60 px-5 py-3 transition-colors hover:bg-zinc-900/60 last:border-b-0"
              >
                <span className="truncate text-sm text-white">
                  {d.name}
                  <span className="ml-2 inline-block text-zinc-600 opacity-0 transition-opacity group-hover:opacity-100">
                    →
                  </span>
                </span>
                <span className="ml-3 font-mono text-lg font-bold tabular-nums text-white">
                  {d.count}
                </span>
              </Link>
            ))}
          </div>

          <div className="overflow-hidden rounded-lg border border-zinc-800 bg-[#14141a] shadow-2xl shadow-black/50">
            <div className="border-b border-zinc-800 px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-500">
              Most Wins — Constructors
            </div>
            {topConstructors.map((c) => (
              <div
                key={c.id}
                className="flex items-center justify-between border-b border-zinc-800/60 px-5 py-3 last:border-b-0"
                style={{ borderLeft: `3px solid ${getTeamColor(c.id)}` }}
              >
                <div className="flex min-w-0 items-center gap-2">
                  <TeamBadge constructorId={c.id} name={c.name} size="sm" />
                  <span className="truncate text-sm text-white">{c.name}</span>
                </div>
                <span className="ml-3 font-mono text-lg font-bold tabular-nums text-white">
                  {c.count}
                </span>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
            Every Winner
          </h2>
          <div className="overflow-hidden rounded-lg border border-zinc-800 bg-[#14141a] shadow-2xl shadow-black/50">
            <div className="grid grid-cols-[64px_1fr_100px] gap-4 border-b border-zinc-800 px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.15em] text-zinc-500">
              <div>Year</div>
              <div>Winner</div>
              <div>Team</div>
            </div>

            {ordered.map((race) => {
              const result = race.Results[0];
              if (!result) return null;
              const teamColor = getTeamColor(result.Constructor.constructorId);
              return (
                <Link
                  key={`${race.season}-${race.round}`}
                  href={`/drivers/${result.Driver.driverId}`}
                  className="group grid grid-cols-[64px_1fr_100px] items-center gap-4 border-b border-zinc-800/60 px-5 py-3 transition-colors hover:bg-zinc-900/50 last:border-b-0"
                  style={{ borderLeft: `3px solid ${teamColor}` }}
                >
                  <div className="font-mono text-sm font-bold tabular-nums text-white">
                    {race.season}
                  </div>
                  <div className="min-w-0 truncate text-sm text-white">
                    <span className="font-light">{result.Driver.givenName}</span>{" "}
                    <span className="font-bold uppercase tracking-wide">
                      {result.Driver.familyName}
                    </span>
                    <span className="ml-2 inline-block text-zinc-600 opacity-0 transition-opacity group-hover:opacity-100">
                      →
                    </span>
                  </div>
                  <div>
                    <TeamBadge
                      constructorId={result.Constructor.constructorId}
                      name={result.Constructor.name}
                      size="sm"
                    />
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      </div>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-[#14141a] px-5 py-5 text-center">
      <div className="font-mono text-2xl font-bold tabular-nums text-white">
        {value}
      </div>
      <div className="mt-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-500">
        {label}
      </div>
    </div>
  );
}