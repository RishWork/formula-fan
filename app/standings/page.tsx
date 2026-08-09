import { getDriverStandings, getConstructorStandings } from "@/lib/jolpica";
import DriverStandingsTable from "@/components/DriverStandingsTable";
import ConstructorStandingsTable from "@/components/ConstructorStandingsTable";

export default async function StandingsPage() {
  const [drivers, constructors] = await Promise.all([
    getDriverStandings(),
    getConstructorStandings(),
  ]);

  return (
    <main className="min-h-screen px-6 py-12">
      <div className="mx-auto max-w-5xl">
        <header className="mb-10">
          <div className="mb-3 font-mono text-xs uppercase tracking-[0.3em] text-zinc-500">
            2026 Season
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-white">
            Championship Standings
          </h1>
          <div className="mt-3 h-1 w-12 bg-[#e10600]" />
        </header>

        <section className="mb-12">
          <h2 className="mb-6 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
            Driver Championship
          </h2>
          <DriverStandingsTable standings={drivers} />
        </section>

        <section>
          <h2 className="mb-6 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
            Constructor Championship
          </h2>
          <ConstructorStandingsTable constructors={constructors} />
        </section>
      </div>
    </main>
  );
}