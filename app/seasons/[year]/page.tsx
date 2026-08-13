import { notFound } from "next/navigation";
import Link from "next/link";
import { getSeasonSummary } from "@/lib/jolpica";
import { getTeamColor } from "@/lib/teamColors";

export default async function SeasonPage({
  params,
}: {
  params: Promise<{ year: string }>;
}) {
  const { year } = await params;
  const data = await getSeasonSummary(year);

  if (!data) {
    notFound();
  }

  const { races, driverStandings, constructorStandings } = data;
  const champion = driverStandings[0];
  const constructorChampion = constructorStandings[0];
  const championColor = champion
    ? getTeamColor(champion.Constructors[0]?.constructorId ?? "")
    : "#3f3f46";

  return (
    <main className="min-h-screen px-6 py-12">
      <div className="mx-auto max-w-5xl">
        {/* Breadcrumb */}
        <div className="mb-6 font-mono text-xs uppercase tracking-[0.2em] text-zinc-500">
          <Link href="/seasons" className="transition-colors hover:text-zinc-300">
            ← Back to archive
          </Link>
        </div>

        {/* Header */}
        <header className="mb-10">
          <h1 className="text-6xl font-bold tracking-tight text-white">
            {year}
          </h1>
          <div className="mt-3 h-1 w-12 bg-[#e10600]" />
          <p className="mt-4 text-zinc-400">
            {races.length} {races.length === 1 ? "round" : "rounds"} ·{" "}
            {driverStandings.length} drivers
            {constructorStandings.length > 0 &&
              ` · ${constructorStandings.length} constructors`}
          </p>
        </header>

        {/* Champions */}
        {champion && (
          <section className="mb-10 grid gap-3 md:grid-cols-2">
            <div
              className="overflow-hidden rounded-lg border border-zinc-800 bg-[#14141a] p-6 shadow-2xl shadow-black/50"
              style={{ borderTop: `4px solid ${championColor}` }}
            >
              <div className="mb-3 font-mono text-[10px] uppercase tracking-[0.25em] text-amber-400">
                World Champion
              </div>
              <div className="text-white">
                <span className="text-lg font-light">
                  {champion.Driver.givenName}
                </span>
                <div className="text-3xl font-bold uppercase tracking-wide">
                  {champion.Driver.familyName}
                </div>
              </div>
              <div className="mt-3 text-sm text-zinc-400">
                {champion.Constructors.map((c) => c.name).join(" / ")}
              </div>
              <div className="mt-4 flex gap-6 font-mono text-sm tabular-nums text-zinc-300">
                <span>{champion.points} pts</span>
                <span>{champion.wins} wins</span>
              </div>
            </div>

            {constructorChampion ? (
              <div
                className="overflow-hidden rounded-lg border border-zinc-800 bg-[#14141a] p-6 shadow-2xl shadow-black/50"
                style={{
                  borderTop: `4px solid ${getTeamColor(
                    constructorChampion.Constructor.constructorId
                  )}`,
                }}
              >
                <div className="mb-3 font-mono text-[10px] uppercase tracking-[0.25em] text-amber-400">
                  Constructors' Champion
                </div>
                <div className="text-3xl font-bold uppercase tracking-wide text-white">
                  {constructorChampion.Constructor.name}
                </div>
                <div className="mt-3 text-sm text-zinc-400">
                  {constructorChampion.Constructor.nationality}
                </div>
                <div className="mt-4 flex gap-6 font-mono text-sm tabular-nums text-zinc-300">
                  <span>{constructorChampion.points} pts</span>
                  <span>{constructorChampion.wins} wins</span>
                </div>
              </div>
            ) : (
              <div className="flex items-center rounded-lg border border-dashed border-zinc-800 bg-zinc-900/20 p-6">
                <p className="text-sm text-zinc-500">
                  No Constructors' Championship in {year} — it was first awarded
                  in 1958.
                </p>
              </div>
            )}
          </section>
        )}

        {/* Calendar */}
        <section className="mb-10">
          <h2 className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
            Calendar
          </h2>
          <div className="overflow-hidden rounded-lg border border-zinc-800 bg-[#14141a] shadow-2xl shadow-black/50">
            <div className="grid grid-cols-[48px_1fr_1fr_100px] gap-4 border-b border-zinc-800 px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.15em] text-zinc-500">
              <div>Rd</div>
              <div>Grand Prix</div>
              <div>Circuit</div>
              <div className="text-right">Date</div>
            </div>
            {races.map((race) => (
              <div
                key={race.round}
                className="grid grid-cols-[48px_1fr_1fr_100px] items-center gap-4 border-b border-zinc-800/60 px-5 py-3 last:border-b-0"
              >
                <div className="font-mono text-sm tabular-nums text-zinc-500">
                  {race.round}
                </div>
                <div className="truncate text-sm text-white">
                  {race.raceName}
                </div>
                <div className="truncate text-sm text-zinc-400">
                  {race.Circuit.circuitName}
                </div>
                <div className="text-right font-mono text-xs tabular-nums text-zinc-500">
                  {new Date(race.date).toLocaleDateString(undefined, {
                    day: "numeric",
                    month: "short",
                  })}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Final driver standings */}
        <section className="mb-10">
          <h2 className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
            Final Driver Standings
          </h2>
          <div className="overflow-hidden rounded-lg border border-zinc-800 bg-[#14141a] shadow-2xl shadow-black/50">
            <div className="grid grid-cols-[48px_1fr_180px_80px_64px] gap-4 border-b border-zinc-800 px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.15em] text-zinc-500">
              <div>Pos</div>
              <div>Driver</div>
              <div>Team</div>
              <div className="text-right">Points</div>
              <div className="text-right">Wins</div>
            </div>
            {driverStandings.map((s) => {
              const teamColor = getTeamColor(
                s.Constructors[0]?.constructorId ?? ""
              );
              return (
                <div
                  key={s.Driver.driverId}
                  className="grid grid-cols-[48px_1fr_180px_80px_64px] items-center gap-4 border-b border-zinc-800/60 px-5 py-3 last:border-b-0"
                  style={{ borderLeft: `3px solid ${teamColor}` }}
                >
                  <div className="font-mono text-sm font-bold tabular-nums text-white">
                    {s.position}
                  </div>
                  <div className="truncate text-sm text-white">
                    <span className="font-light">{s.Driver.givenName}</span>{" "}
                    <span className="font-bold uppercase tracking-wide">
                      {s.Driver.familyName}
                    </span>
                  </div>
                  <div className="truncate text-xs text-zinc-400">
                    {s.Constructors.map((c) => c.name).join(" / ")}
                  </div>
                  <div className="text-right font-mono text-sm tabular-nums text-white">
                    {s.points}
                  </div>
                  <div className="text-right font-mono text-sm tabular-nums text-zinc-500">
                    {s.wins}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Final constructor standings */}
        {constructorStandings.length > 0 && (
          <section>
            <h2 className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
              Final Constructor Standings
            </h2>
            <div className="overflow-hidden rounded-lg border border-zinc-800 bg-[#14141a] shadow-2xl shadow-black/50">
              <div className="grid grid-cols-[48px_1fr_80px_64px] gap-4 border-b border-zinc-800 px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.15em] text-zinc-500">
                <div>Pos</div>
                <div>Team</div>
                <div className="text-right">Points</div>
                <div className="text-right">Wins</div>
              </div>
              {constructorStandings.map((c) => {
                const teamColor = getTeamColor(c.Constructor.constructorId);
                return (
                  <div
                    key={c.Constructor.constructorId}
                    className="grid grid-cols-[48px_1fr_80px_64px] items-center gap-4 border-b border-zinc-800/60 px-5 py-3 last:border-b-0"
                    style={{ borderLeft: `3px solid ${teamColor}` }}
                  >
                    <div className="font-mono text-sm font-bold tabular-nums text-white">
                      {c.position}
                    </div>
                    <div className="truncate text-sm font-bold uppercase tracking-wide text-white">
                      {c.Constructor.name}
                    </div>
                    <div className="text-right font-mono text-sm tabular-nums text-white">
                      {c.points}
                    </div>
                    <div className="text-right font-mono text-sm tabular-nums text-zinc-500">
                      {c.wins}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}