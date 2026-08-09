import { ConstructorStanding } from "@/lib/jolpica";
import { getTeamColor } from "@/lib/teamColors";

type Props = {
  constructors: ConstructorStanding[];
};

export default function ConstructorStandingsTable({ constructors }: Props) {
  return (
    <div className="overflow-hidden rounded-lg border border-zinc-800 bg-[#14141a] shadow-2xl shadow-black/50">
      <div className="grid grid-cols-[56px_1fr_100px_72px] gap-4 border-b border-zinc-800 px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.15em] text-zinc-500">
        <div>Pos</div>
        <div>Team</div>
        <div className="text-right">Points</div>
        <div className="text-right">Wins</div>
      </div>

      {constructors.map((c) => {
        const teamColor = getTeamColor(c.Constructor.constructorId);
        return (
          <div
            key={c.Constructor.constructorId}
            className="grid grid-cols-[56px_1fr_100px_72px] items-center gap-4 border-b border-zinc-800/60 px-5 py-4 transition-colors hover:bg-zinc-900/60 last:border-b-0"
            style={{ borderLeft: `3px solid ${teamColor}` }}
          >
            <div className="text-2xl font-bold tabular-nums text-white">
              {c.position}
            </div>
            <div className="flex items-center gap-3">
              <div
                className="h-9 w-1.5 rounded-sm"
                style={{ backgroundColor: teamColor }}
              />
              <div className="font-bold uppercase tracking-wide text-white">
                {c.Constructor.name}
              </div>
            </div>
            <div className="text-right text-lg font-bold tabular-nums text-white">
              {c.points}
            </div>
            <div className="text-right text-lg tabular-nums text-zinc-500">
              {c.wins}
            </div>
          </div>
        );
      })}
    </div>
  );
}