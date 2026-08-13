import Link from "next/link";
import { getSeasonsList } from "@/lib/jolpica";
import { champions } from "@/lib/champions";
import { getTeamColor } from "@/lib/teamColors";

export default async function SeasonsPage() {
  const seasons = await getSeasonsList();
  const currentSeason = seasons[seasons.length - 1];

  const byDecade = new Map<string, string[]>();
  for (const year of seasons) {
    const decade = `${year.slice(0, 3)}0s`;
    if (!byDecade.has(decade)) byDecade.set(decade, []);
    byDecade.get(decade)!.push(year);
  }
  const decades = Array.from(byDecade.entries()).reverse();

  return (
    <main className="min-h-screen px-6 py-12">
      <div className="mx-auto max-w-5xl">
        <header className="mb-10">
          <div className="mb-3 font-mono text-xs uppercase tracking-[0.3em] text-zinc-500">
            {seasons[0]} — {currentSeason}
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-white">
            Season Archive
          </h1>
          <div className="mt-3 h-1 w-12 bg-[#e10600]" />
          <p className="mt-4 text-zinc-400">
            {seasons.length} seasons of Formula 1, and every world champion.
          </p>
        </header>

        <div className="space-y-4">
          {decades.map(([decade, years]) => (
            <section
              key={decade}
              className="overflow-hidden rounded-lg border border-zinc-800 bg-[#14141a] shadow-2xl shadow-black/50"
            >
              {/* Decade header */}
              <div className="flex items-baseline justify-between border-b border-zinc-800 px-5 py-3">
                <h2 className="font-mono text-sm font-bold uppercase tracking-[0.25em] text-white">
                  {decade}
                </h2>
                <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-600">
                  {years.length} {years.length === 1 ? "season" : "seasons"}
                </span>
              </div>

              {/* Season tiles */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
                {years.map((year) => {
                  const champ = champions[year];
                  const isCurrent = year === currentSeason;
                  const color = champ
                    ? getTeamColor(champ.constructorId)
                    : "#3f3f46";

                  return (
                    <Link
                      key={year}
                      href={`/seasons/${year}`}
                      className="group relative border-b border-r border-zinc-800/60 px-4 py-4 transition-colors hover:bg-zinc-900/70"
                    >
                      {/* Team color accent bar */}
                      <div
                        className="absolute left-0 top-0 h-full w-[3px] opacity-70 transition-opacity group-hover:opacity-100"
                        style={{
                          backgroundColor: isCurrent ? "#e10600" : color,
                        }}
                      />

                      <div className="flex items-baseline justify-between">
                        <span className="font-mono text-xl font-bold tabular-nums text-white">
                          {year}
                        </span>
                        {isCurrent && (
                          <span className="rounded-sm bg-[#e10600] px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase tracking-widest text-white">
                            Live
                          </span>
                        )}
                      </div>

                      {champ ? (
                        <div className="mt-2">
                          <div className="truncate text-sm font-bold uppercase tracking-wide text-zinc-300 transition-colors group-hover:text-white">
                            {champ.familyName}
                          </div>
                          <div className="mt-0.5 truncate text-[11px] text-zinc-600">
                            {champ.constructorName}
                          </div>
                        </div>
                      ) : (
                        <div className="mt-2">
                          <div className="text-sm font-bold uppercase tracking-wide text-zinc-600">
                            In progress
                          </div>
                          <div className="mt-0.5 text-[11px] text-zinc-700">
                            —
                          </div>
                        </div>
                      )}
                    </Link>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}