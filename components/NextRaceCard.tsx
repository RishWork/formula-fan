import { Race } from "@/lib/jolpica";
import RaceCountdown from "./RaceCountdown";

type Props = {
  race: Race;
};

function formatSessionTime(session: { date: string; time: string }): string {
  const dt = new Date(`${session.date}T${session.time}`);
  return dt.toLocaleString(undefined, {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function NextRaceCard({ race }: Props) {
  const raceStartIso = `${race.date}T${race.time}`;
  const isSprintWeekend = !!race.Sprint;

  // Build the session list in weekend order.
  const sessions = [
    race.FirstPractice && { label: "Free Practice 1", session: race.FirstPractice },
    race.SprintQualifying && { label: "Sprint Qualifying", session: race.SprintQualifying },
    race.SecondPractice && { label: "Free Practice 2", session: race.SecondPractice },
    race.Sprint && { label: "Sprint", session: race.Sprint },
    race.ThirdPractice && { label: "Free Practice 3", session: race.ThirdPractice },
    race.Qualifying && { label: "Qualifying", session: race.Qualifying },
    { label: "Race", session: { date: race.date, time: race.time } },
  ].filter(Boolean) as { label: string; session: { date: string; time: string } }[];

  return (
    <section className="mb-12 overflow-hidden rounded-lg border border-zinc-800 bg-[#14141a] shadow-2xl shadow-black/50">
      {/* Top bar */}
      <div className="flex items-center justify-between border-b border-zinc-800 px-6 py-3">
        <div className="flex items-center gap-3">
          <div className="rounded-sm bg-[#e10600] px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-white">
            Next Up
          </div>
          <div className="font-mono text-xs uppercase tracking-[0.2em] text-zinc-500">
            Round {race.round} · {race.Circuit.Location.country}
          </div>
        </div>
        {isSprintWeekend && (
          <div className="rounded-sm border border-zinc-700 px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-zinc-300">
            Sprint Weekend
          </div>
        )}
      </div>

      {/* Main content */}
      <div className="px-6 py-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              {race.raceName}
            </h2>
            <p className="mt-2 text-zinc-400">{race.Circuit.circuitName}</p>
            <p className="mt-1 text-sm text-zinc-500">
              {race.Circuit.Location.locality}, {race.Circuit.Location.country}
            </p>
          </div>

          <div className="flex flex-col justify-center md:items-end">
            <div className="mb-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-500">
              Lights Out In
            </div>
            <RaceCountdown targetIso={raceStartIso} />
          </div>
        </div>
      </div>

      {/* Session schedule */}
<div className="border-t border-zinc-800 bg-black/20 px-6 py-4">
  <div className="mb-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-500">
    Session Schedule (Your Local Time)
  </div>
  <div className="grid gap-x-8 gap-y-2 sm:grid-cols-2">
    {sessions.map((s) => (
      <div
        key={s.label}
        className="grid grid-cols-[1fr_auto] items-center gap-4 text-sm"
      >
        <span className="text-zinc-400">{s.label}</span>
        <span className="font-mono tabular-nums text-zinc-300">
          {formatSessionTime(s.session)}
        </span>
      </div>
    ))}
  </div>
</div>
    </section>
  );
}