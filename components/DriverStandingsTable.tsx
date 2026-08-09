import { DriverStanding } from "@/lib/jolpica";
import { getTeamColor } from "@/lib/teamColors";
import Link from "next/link";

type Props = {
  standings: DriverStanding[];
};

export default function DriverStandingsTable({ standings }: Props) {
  return (
    <div className="overflow-hidden rounded-lg border border-zinc-800 bg-[#14141a] shadow-2xl shadow-black/50">
      <div className="grid grid-cols-[56px_1fr_180px_100px_72px] gap-4 border-b border-zinc-800 px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.15em] text-zinc-500">
        <div>Pos</div>
        <div>Driver</div>
        <div>Team</div>
        <div className="text-right">Points</div>
        <div className="text-right">Wins</div>
      </div>

      {standings.map((s) => {
        const teamColor = getTeamColor(s.Constructors[0]?.constructorId ?? "");
        return (
          <div
            key={s.Driver.driverId}
            className="grid grid-cols-[56px_1fr_180px_100px_72px] items-center gap-4 border-b border-zinc-800/60 px-5 py-4 transition-colors hover:bg-zinc-900/60 last:border-b-0"
            style={{ borderLeft: `3px solid ${teamColor}` }}
          >
            <div className="text-2xl font-bold tabular-nums text-white">
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

            <div className="text-sm text-zinc-400">
              {s.Constructors[0]?.name}
            </div>
            <div className="text-right text-lg font-bold tabular-nums text-white">
              {s.points}
            </div>
            <div className="text-right text-lg tabular-nums text-zinc-500">
              {s.wins}
            </div>
          </div>
        );
      })}
    </div>
  );
}