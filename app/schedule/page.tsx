import { getSeasonSchedule } from "@/lib/jolpica";

export default async function SchedulePage() {
  const races = await getSeasonSchedule();
  const now = new Date();

  // Find the index of the next upcoming race in the array.
  // -1 means the season is over (all races in the past).
  const nextRaceIndex = races.findIndex((r) => {
    const raceDate = new Date(`${r.date}T${r.time || "00:00:00Z"}`);
    return raceDate >= now;
  });

  return (
    <main className="min-h-screen px-6 py-12">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <header className="mb-10">
          <div className="mb-3 font-mono text-xs uppercase tracking-[0.3em] text-zinc-500">
            2026 Season
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-white">
            Race Calendar
          </h1>
          <div className="mt-3 h-1 w-12 bg-[#e10600]" />
          <p className="mt-4 text-zinc-400">
            All {races.length} rounds of the 2026 Formula 1 season.
          </p>
        </header>

        {/* Schedule table */}
        <div className="overflow-hidden rounded-lg border border-zinc-800 bg-[#14141a] shadow-2xl shadow-black/50">
          {/* Column headers */}
          <div className="grid grid-cols-[56px_1fr_200px_100px_100px] gap-4 border-b border-zinc-800 px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.15em] text-zinc-500">
            <div>Rd</div>
            <div>Grand Prix</div>
            <div>Circuit</div>
            <div>Date</div>
            <div className="text-right">Status</div>
          </div>

          {/* Rows */}
          {races.map((race, index) => {
            const isPast =
              nextRaceIndex === -1 || index < nextRaceIndex;
            const isNext = index === nextRaceIndex;
            const isSprint = !!race.Sprint;
            const raceDate = new Date(
              `${race.date}T${race.time || "00:00:00Z"}`
            );
            const dateFormatted = raceDate.toLocaleDateString(undefined, {
              month: "short",
              day: "numeric",
            });

            return (
              <div
                key={race.round}
                className={`grid grid-cols-[56px_1fr_200px_100px_100px] items-center gap-4 border-b border-zinc-800/60 px-5 py-4 transition-colors last:border-b-0 ${
                  isPast ? "opacity-40" : ""
                } ${isNext ? "bg-red-500/5" : ""}`}
                style={
                  isNext ? { borderLeft: `3px solid #e10600` } : undefined
                }
              >
                <div className="text-xl font-bold tabular-nums text-white">
                  {race.round}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold uppercase tracking-wide text-white">
                      {race.raceName}
                    </span>
                    {isSprint && (
                      <span className="rounded-sm border border-zinc-700 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-widest text-zinc-400">
                        Sprint
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-zinc-500">
                    {race.Circuit.Location.country}
                  </div>
                </div>

                <div className="truncate text-sm text-zinc-400">
                  {race.Circuit.circuitName}
                </div>

                <div className="font-mono text-sm tabular-nums text-zinc-300">
                  {dateFormatted}
                </div>

                <div className="text-right">
                  {isPast && (
                    <span className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">
                      ✓ Done
                    </span>
                  )}
                  {isNext && (
                    <span className="rounded-sm bg-[#e10600] px-2 py-1 font-mono text-[10px] font-bold uppercase tracking-widest text-white">
                      Next Up
                    </span>
                  )}
                  {!isPast && !isNext && (
                    <span className="font-mono text-[10px] uppercase tracking-widest text-zinc-600">
                      Upcoming
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}