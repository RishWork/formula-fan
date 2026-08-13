import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-[80vh] items-center justify-center px-6 py-12">
      <div className="mx-auto max-w-lg text-center">
        {/* Gantry lights — reusing the animation from the home page header */}
        <div className="mb-8 flex justify-center gap-1.5">
          {[0, 1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="gantry-light h-3 w-6 rounded-sm bg-[#e10600]"
            />
          ))}
        </div>

        <div className="font-mono text-8xl font-bold tabular-nums tracking-tighter text-white">
          404
        </div>

        <div className="mx-auto mt-4 h-1 w-12 bg-[#e10600]" />

        <h1 className="mt-6 text-2xl font-bold uppercase tracking-wide text-white">
          Off the racing line
        </h1>

        <p className="mt-3 text-zinc-400">
          Looks like you took a wrong turn. Let&apos;s get
          you back on track.
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-2">
          <NavChip href="/" label="Home" />
          <NavChip href="/schedule" label="Schedule" />
          <NavChip href="/standings" label="Standings" />
          <NavChip href="/seasons" label="Seasons" />
        </div>
      </div>
    </main>
  );
}

function NavChip({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="rounded-sm border border-zinc-800 bg-[#14141a] px-4 py-2 font-mono text-xs uppercase tracking-[0.2em] text-zinc-400 transition-colors hover:border-zinc-600 hover:text-white"
    >
      {label}
    </Link>
  );
}