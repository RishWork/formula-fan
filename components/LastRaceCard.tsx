import Link from "next/link";
import { FullRaceResults } from "@/lib/jolpica";
import { getTeamColor } from "@/lib/teamColors";
import PodiumMedal from "./PodiumMedal";
import TeamBadge from "./TeamBadge";

type Props = {
  race: FullRaceResults;
};

export default function LastRaceCard({ race }: Props) {
  const podium = race.Results.slice(0, 3);
  const fastestLap = race.Results.find((r) => r.FastestLap?.rank === "1");

  return (
    <section className="mb-12 overflow-hidden rounded-lg border border-zinc-800 bg-[#14141a] shadow-2xl shadow-black/50">
      {/* Top bar */}
      <div className="flex items-center justify-between border-b border-zinc-800 px-6 py-3">
        <div className="flex items-center gap-3">
          <div className="rounded-sm bg-zinc-700 px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-white">
            Last Race
          </div>
          <div className="font-mono text-xs uppercase tracking-[0.2em] text-zinc-500">
            Round {race.round} · {race.Circuit.Location.country}
          </div>
        </div>
        <Link
          href={`/races/${race.round}`}
          className="font-mono text-xs uppercase tracking-[0.2em] text-zinc-400 transition-colors hover:text-white"
        >
          Full results →
        </Link>
      </div>

      {/* Race name */}
      <div className="border-b border-zinc-800 px-6 py-5">
        <h2 className="text-2xl font-bold tracking-tight text-white">
          {race.raceName}
        </h2>
        <p className="mt-1 text-sm text-zinc-500">{race.Circuit.circuitName}</p>
      </div>

      {/* Podium */}
      <div>
        {podium.map((result) => {
          const teamColor = getTeamColor(result.Constructor.constructorId);
          return (
            <Link
              key={result.Driver.driverId}
              href={`/drivers/${result.Driver.driverId}`}
              className="grid grid-cols-[44px_1fr_140px] items-center gap-4 border-b border-zinc-800/60 px-6 py-4 transition-colors hover:bg-zinc-900/40 last:border-b-0"
              style={{ borderLeft: `3px solid ${teamColor}` }}
            >
              <PodiumMedal position={parseInt(result.position)} />

              <div className="flex items-center gap-3">
                <div
                  className="flex h-9 w-11 items-center justify-center rounded text-sm font-bold italic tabular-nums text-white shadow-sm"
                  style={{ backgroundColor: teamColor }}
                >
                  {result.Driver.permanentNumber}
                </div>
                <div className="min-w-0 text-white">
                  <div className="truncate">
                    <span className="font-light">{result.Driver.givenName}</span>{" "}
                    <span className="font-bold uppercase tracking-wide">
                      {result.Driver.familyName}
                    </span>
                  </div>
                  <div className="mt-1 flex items-center gap-2">
                    <TeamBadge
                      constructorId={result.Constructor.constructorId}
                      name={result.Constructor.name}
                      size="sm"
                    />
                    <span className="truncate text-xs text-zinc-500">
                      {result.Constructor.name}
                    </span>
                  </div>
                </div>
              </div>

              <div className="text-right font-mono text-sm tabular-nums text-zinc-300">
                {result.Time?.time ?? "—"}
              </div>
            </Link>
          );
        })}
      </div>

      {/* Fastest lap */}
      {fastestLap && (
        <div className="border-t border-zinc-800 bg-purple-500/5 px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-purple-400">
                Fastest Lap
              </span>
              <span className="text-sm text-white">
                <span className="font-light">{fastestLap.Driver.givenName}</span>{" "}
                <span className="font-bold uppercase">
                  {fastestLap.Driver.familyName}
                </span>
              </span>
              <TeamBadge
                constructorId={fastestLap.Constructor.constructorId}
                name={fastestLap.Constructor.name}
                size="sm"
              />
            </div>
            <span className="font-mono text-sm tabular-nums text-zinc-300">
              {fastestLap.FastestLap?.Time.time}
            </span>
          </div>
        </div>
      )}
    </section>
  );
}