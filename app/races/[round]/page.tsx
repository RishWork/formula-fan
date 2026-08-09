import { notFound } from "next/navigation";
import Link from "next/link";
import { getRaceResults } from "@/lib/jolpica";
import { getTeamColor } from "@/lib/teamColors";

const medalColors = ["#fbbf24", "#cbd5e1", "#c9885a"];

export default async function RacePage({
  params,
}: {
  params: Promise<{ round: string }>;
}) {
  const { round } = await params;
  const race = await getRaceResults(round);

  if (!race) {
    notFound();
  }

  const podium = race.Results.slice(0, 3);
  const fastestLap = race.Results.find((r) => r.FastestLap?.rank === "1");
  const raceDate = new Date(`${race.date}T${race.time || "00:00:00Z"}`);
  const dateFormatted = raceDate.toLocaleDateString(undefined, {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <main className="min-h-screen px-6 py-12">
      <div className="mx-auto max-w-5xl">
        {/* Breadcrumb */}
        <div className="mb-6 font-mono text-xs uppercase tracking-[0.2em] text-zinc-500">
          <Link
            href="/schedule"
            className="transition-colors hover:text-zinc-300"
          >
            ← Back to schedule
          </Link>
        </div>

        {/* Race header */}
        <header className="mb-10">
          <div className="mb-3 font-mono text-xs uppercase tracking-[0.3em] text-zinc-500">
            Round {race.round} · {race.season}
          </div>
          <h1 className="text-5xl font-bold tracking-tight text-white">
            {race.raceName}
          </h1>
          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-zinc-400">
            <span>{race.Circuit.circuitName}</span>
            <span className="text-zinc-600">·</span>
            <span>
              {race.Circuit.Location.locality}, {race.Circuit.Location.country}
            </span>
            <span className="text-zinc-600">·</span>
            <span>{dateFormatted}</span>
          </div>
        </header>

        {/* Podium */}
        <section className="mb-10">
          <h2 className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
            Podium
          </h2>
          <div className="grid gap-3 md:grid-cols-3">
            {podium.map((result, idx) => {
              const teamColor = getTeamColor(result.Constructor.constructorId);
              return (
                <Link
                  key={result.Driver.driverId}
                  href={`/drivers/${result.Driver.driverId}`}
                  className="group overflow-hidden rounded-lg border border-zinc-800 bg-[#14141a] p-6 transition-colors hover:bg-zinc-900/60"
                  style={{ borderTop: `3px solid ${teamColor}` }}
                >
                  <div className="mb-4 flex items-center justify-between">
                    <span
                      className="text-3xl font-bold"
                      style={{ color: medalColors[idx] }}
                    >
                      {result.position}
                    </span>
                    <div
                      className="flex h-9 w-11 items-center justify-center rounded text-sm font-bold italic tabular-nums text-white shadow-sm"
                      style={{ backgroundColor: teamColor }}
                    >
                      {result.Driver.permanentNumber}
                    </div>
                  </div>
                  <div className="text-white">
                    <div className="font-light">{result.Driver.givenName}</div>
                    <div className="text-2xl font-bold uppercase tracking-wide">
                      {result.Driver.familyName}
                    </div>
                    <div className="mt-1 text-sm text-zinc-500">
                      {result.Constructor.name}
                    </div>
                  </div>
                  <div className="mt-4 font-mono text-sm tabular-nums text-zinc-300">
                    {result.Time?.time ?? "—"}
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Full results */}
        <section>
          <h2 className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
            Full Results
          </h2>

          <div className="overflow-hidden rounded-lg border border-zinc-800 bg-[#14141a] shadow-2xl shadow-black/50">
            <div className="grid grid-cols-[48px_1fr_140px_50px_120px_72px] gap-4 border-b border-zinc-800 px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.15em] text-zinc-500">
              <div>Pos</div>
              <div>Driver</div>
              <div>Team</div>
              <div className="text-right">Grid</div>
              <div className="text-right">Time / Gap</div>
              <div className="text-right">Pts</div>
            </div>

            {race.Results.map((result) => {
              const teamColor = getTeamColor(result.Constructor.constructorId);
              const isFinishedNumerically = /^\d+$/.test(result.position);
              return (
                <div
                  key={result.Driver.driverId}
                  className="grid grid-cols-[48px_1fr_140px_50px_120px_72px] items-center gap-4 border-b border-zinc-800/60 px-5 py-4 last:border-b-0"
                  style={{ borderLeft: `3px solid ${teamColor}` }}
                >
                  <div className="text-lg font-bold tabular-nums text-white">
                    {isFinishedNumerically ? result.position : "—"}
                  </div>
                  <Link
                    href={`/drivers/${result.Driver.driverId}`}
                    className="group flex items-center gap-3"
                  >
                    <div
                      className="flex h-8 w-10 items-center justify-center rounded text-xs font-bold italic tabular-nums text-white shadow-sm"
                      style={{ backgroundColor: teamColor }}
                    >
                      {result.Driver.permanentNumber}
                    </div>
                    <div className="text-white">
                      <span className="font-light">
                        {result.Driver.givenName}
                      </span>{" "}
                      <span className="font-bold uppercase tracking-wide">
                        {result.Driver.familyName}
                      </span>
                    </div>
                  </Link>
                  <div className="truncate text-sm text-zinc-400">
                    {result.Constructor.name}
                  </div>
                  <div className="text-right font-mono text-sm tabular-nums text-zinc-500">
                    {result.grid}
                  </div>
                  <div className="text-right font-mono text-sm tabular-nums text-zinc-300">
                    {result.Time?.time ?? result.status}
                  </div>
                  <div className="text-right font-mono text-sm font-bold tabular-nums text-white">
                    {result.points}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Fastest lap */}
        {fastestLap && (
          <section className="mt-6">
            <div className="rounded-lg border border-purple-500/30 bg-purple-500/5 px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-purple-400">
                    Fastest Lap
                  </span>
                  <Link
                    href={`/drivers/${fastestLap.Driver.driverId}`}
                    className="text-white transition-colors hover:text-purple-300"
                  >
                    <span className="font-light">
                      {fastestLap.Driver.givenName}
                    </span>{" "}
                    <span className="font-bold uppercase">
                      {fastestLap.Driver.familyName}
                    </span>
                  </Link>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-mono text-sm tabular-nums text-zinc-400">
                    Lap {fastestLap.FastestLap?.lap}
                  </span>
                  <span className="font-mono text-sm tabular-nums text-white">
                    {fastestLap.FastestLap?.Time.time}
                  </span>
                </div>
              </div>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}