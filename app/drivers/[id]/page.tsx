import { notFound } from "next/navigation";
import Link from "next/link";
import { getDriverSeason } from "@/lib/jolpica";
import { getTeamColor } from "@/lib/teamColors";

export default async function DriverPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await getDriverSeason(id);

  if (!data) {
    notFound();
  }

  const { standing, races } = data;
  const driver = standing.Driver;
  const team = standing.Constructors[0];
  const teamColor = getTeamColor(team?.constructorId ?? "");

  const podiums = races.filter((r) => {
    const pos = parseInt(r.Results[0]?.position ?? "0");
    return pos > 0 && pos <= 3;
  }).length;

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
              className="flex h-32 w-32 items-center justify-center rounded-lg text-6xl font-bold italic text-white shadow-lg"
              style={{ backgroundColor: teamColor }}
            >
              {driver.permanentNumber}
            </div>

            <div>
              <div className="mb-2 font-mono text-xs uppercase tracking-[0.3em] text-zinc-500">
                {driver.code} · {driver.nationality}
              </div>
              <h1 className="text-5xl font-bold tracking-tight text-white">
                <span className="font-light">{driver.givenName}</span>{" "}
                <span className="font-bold uppercase">{driver.familyName}</span>
              </h1>
              <p className="mt-3 text-lg text-zinc-400">{team?.name}</p>
            </div>
          </div>

          {/* Stats bar */}
          <div className="grid grid-cols-4 gap-px border-t border-zinc-800 bg-zinc-800">
            <StatBlock label="Position" value={standing.position} />
            <StatBlock label="Points" value={standing.points} />
            <StatBlock label="Wins" value={standing.wins} />
            <StatBlock label="Podiums" value={String(podiums)} />
          </div>
        </div>

        {/* Season results */}
        <section>
          <h2 className="mb-6 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
            Season Results
          </h2>

          <div className="overflow-hidden rounded-lg border border-zinc-800 bg-[#14141a] shadow-2xl shadow-black/50">
            <div className="grid grid-cols-[48px_1fr_60px_60px_72px_120px] gap-4 border-b border-zinc-800 px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.15em] text-zinc-500">
              <div>Rd</div>
              <div>Grand Prix</div>
              <div className="text-right">Grid</div>
              <div className="text-right">Pos</div>
              <div className="text-right">Points</div>
              <div className="text-right">Status</div>
            </div>

            {races.map((race) => {
              const result = race.Results[0];
              const isFinishedNumerically =
                result?.position && /^\d+$/.test(result.position);
              return (
                <div
                  key={race.round}
                  className="grid grid-cols-[48px_1fr_60px_60px_72px_120px] items-center gap-4 border-b border-zinc-800/60 px-5 py-4 last:border-b-0"
                >
                  <div className="font-mono text-sm tabular-nums text-zinc-500">
                    {race.round}
                  </div>
                  <div>
                    <div className="text-white">{race.raceName}</div>
                    <div className="text-xs text-zinc-500">
                      {race.Circuit.Location.country}
                    </div>
                  </div>
                  <div className="text-right font-mono text-sm tabular-nums text-zinc-400">
                    {result?.grid}
                  </div>
                  <div className="text-right font-mono text-lg font-bold tabular-nums text-white">
                    {isFinishedNumerically ? result.position : "—"}
                  </div>
                  <div className="text-right font-mono text-sm tabular-nums text-zinc-300">
                    {result?.points}
                  </div>
                  <div className="truncate text-right text-xs text-zinc-500">
                    {result?.status}
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