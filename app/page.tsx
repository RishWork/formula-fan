import Link from "next/link";
import { getDriverStandings, getNextRace, getLastRace } from "@/lib/jolpica";
import { getTeamColor } from "@/lib/teamColors";
import NextRaceCard from "@/components/NextRaceCard";
import LastRaceCard from "@/components/LastRaceCard";

export default async function Home() {
  const [standings, nextRace, lastRace] = await Promise.all([
  getDriverStandings(),
  getNextRace(),
  getLastRace(),
]);

  const top3 = standings.slice(0, 3);

  return (
    <main className="min-h-screen px-6 py-12">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <header className="mb-12">
          <div className="mb-3 font-mono text-xs uppercase tracking-[0.3em] text-zinc-500">
            2026 Season
          </div>

          <h1 className="text-6xl font-bold tracking-tight text-white">
            Formula Fan
          </h1>

          <div className="mt-4 flex items-center gap-4">
            <div className="h-1 w-12 bg-[#e10600]" />
            <div className="flex gap-1.5">
              {[0, 1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="gantry-light h-3 w-6 rounded-sm bg-[#e10600]"
                />
              ))}
            </div>
          </div>

          <p className="mt-5 text-lg text-zinc-400">Your F1 companion.</p>
        </header>

        {/* Next race */}
        {nextRace && <NextRaceCard race={nextRace} />}

        {/* Last race */}
        {lastRace && <LastRaceCard race={lastRace} />}

        {/* Championship leaders (top 3) */}
        <section>
          <div className="mb-6 flex items-baseline justify-between">
            <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
              Championship Leaders
            </h2>
            <Link
              href="/standings"
              className="font-mono text-xs uppercase tracking-[0.2em] text-zinc-400 transition-colors hover:text-white"
            >
              Full standings →
            </Link>
          </div>

          <div className="overflow-hidden rounded-lg border border-zinc-800 bg-[#14141a] shadow-2xl shadow-black/50">
            {top3.map((s) => {
              const teamColor = getTeamColor(
                s.Constructors[0]?.constructorId ?? ""
              );
              return (
                <div
                  key={s.Driver.driverId}
                  className="grid grid-cols-[56px_1fr_120px] items-center gap-4 border-b border-zinc-800/60 px-5 py-4 last:border-b-0"
                  style={{ borderLeft: `3px solid ${teamColor}` }}
                >
                  <div className="text-3xl font-bold tabular-nums text-white">
                    {s.position}
                  </div>
                  <Link
  href={`/drivers/${s.Driver.driverId}`}
  className="group flex items-center gap-3"
>
  <div
    className="flex h-9 w-11 items-center justify-center rounded text-sm font-bold italic tabular-nums text-white shadow-sm"
    style={{ backgroundColor: teamColor }}
  >
    {s.Driver.permanentNumber}
  </div>
  <div className="text-white">
    <span className="font-light">{s.Driver.givenName}</span>{" "}
    <span className="font-bold uppercase tracking-wide">
      {s.Driver.familyName}
    </span>
    <span className="ml-2 inline-block text-zinc-600 opacity-0 transition-opacity group-hover:opacity-100">
      →
    </span>
  </div>
</Link>
                  <div className="text-right">
                    <div className="text-2xl font-bold tabular-nums text-white">
                      {s.points}
                    </div>
                    <div className="text-[10px] uppercase tracking-widest text-zinc-500">
                      Points
                    </div>
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