import Link from "next/link";
import { getCircuitsList, getSeasonSchedule } from "@/lib/jolpica";
import { circuitFacts } from "@/lib/circuitFacts";

export default async function CircuitsPage() {
  const [circuits, schedule] = await Promise.all([
    getCircuitsList(),
    getSeasonSchedule(),
  ]);

  const currentIds = new Set(schedule.map((r) => r.Circuit.circuitId));
  const current = circuits.filter((c) => currentIds.has(c.circuitId));
  const historic = circuits
    .filter((c) => !currentIds.has(c.circuitId))
    .sort((a, b) => a.Location.country.localeCompare(b.Location.country));

  return (
    <main className="min-h-screen px-6 py-12">
      <div className="mx-auto max-w-5xl">
        <header className="mb-10">
          <div className="mb-3 font-mono text-xs uppercase tracking-[0.3em] text-zinc-500">
            {circuits.length} Circuits
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-white">
            Circuits
          </h1>
          <div className="mt-3 h-1 w-12 bg-[#e10600]" />
          <p className="mt-4 text-zinc-400">
            Every track that has hosted a World Championship Grand Prix.
          </p>
        </header>

        <CircuitSection
          title="2026 Calendar"
          circuits={current}
          highlight
        />

        <CircuitSection
          title="Historic Circuits"
          circuits={historic}
        />
      </div>
    </main>
  );
}

function CircuitSection({
  title,
  circuits,
  highlight = false,
}: {
  title: string;
  circuits: Array<{
    circuitId: string;
    circuitName: string;
    Location: { locality: string; country: string };
  }>;
  highlight?: boolean;
}) {
  if (circuits.length === 0) return null;

  return (
    <section className="mb-10">
      <div className="mb-4 flex items-baseline justify-between">
        <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
          {title}
        </h2>
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-600">
          {circuits.length}
        </span>
      </div>

      <div className="overflow-hidden rounded-lg border border-zinc-800 bg-[#14141a] shadow-2xl shadow-black/50">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {circuits.map((c) => {
            const facts = circuitFacts[c.circuitId];
            return (
              <Link
                key={c.circuitId}
                href={`/circuits/${c.circuitId}`}
                className="group relative border-b border-r border-zinc-800/60 px-5 py-4 transition-colors hover:bg-zinc-900/70"
              >
                <div
                  className="absolute left-0 top-0 h-full w-[3px] transition-opacity"
                  style={{
                    backgroundColor: highlight ? "#e10600" : "#3f3f46",
                    opacity: highlight ? 0.8 : 0.5,
                  }}
                />
                <div className="truncate text-sm font-bold uppercase tracking-wide text-white">
                  {c.circuitName}
                </div>
                <div className="mt-1 truncate text-xs text-zinc-500">
                  {c.Location.locality}, {c.Location.country}
                </div>
                {facts && (
                  <div className="mt-2 flex gap-3 font-mono text-[10px] uppercase tracking-widest text-zinc-600">
                    <span>{facts.lengthKm} km</span>
                    <span>{facts.turns} turns</span>
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}