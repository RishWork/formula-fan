"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { DriverStanding } from "@/lib/jolpica";
import { getTeamColor } from "@/lib/teamColors";

type Props = {
  drivers: DriverStanding[];
  position: 1 | 2;
  label: string;
};

export default function DriverSelector({ drivers, position, label }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const paramName = `driver${position}`;
  const current = searchParams.get(paramName) ?? "";
  const otherParamName = position === 1 ? "driver2" : "driver1";
  const otherSelection = searchParams.get(otherParamName);

  const selected = drivers.find((d) => d.Driver.driverId === current);
  const teamColor = selected
    ? getTeamColor(selected.Constructors[0]?.constructorId ?? "")
    : "#3f3f46";

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const newValue = e.target.value;
    const params = new URLSearchParams(searchParams.toString());
    if (newValue) {
      params.set(paramName, newValue);
    } else {
      params.delete(paramName);
    }
    router.push(`/compare?${params.toString()}`);
  }

  return (
    <div>
      <label className="mb-2 block font-mono text-xs uppercase tracking-[0.2em] text-zinc-500">
        {label}
      </label>

      {/* Custom-styled native select */}
      <div className="relative">
        <select
          value={current}
          onChange={handleChange}
          className="w-full appearance-none rounded-sm border border-zinc-800 bg-[#14141a] px-4 py-3 pr-10 font-mono text-sm uppercase tracking-widest text-white shadow-lg transition-all hover:border-zinc-600 focus:border-[#e10600] focus:outline-none focus:ring-2 focus:ring-[#e10600]/20"
          style={{ borderLeft: `3px solid ${teamColor}` }}
        >
          <option value="">Select a driver…</option>
          {drivers.map((d) => (
            <option
              key={d.Driver.driverId}
              value={d.Driver.driverId}
              disabled={d.Driver.driverId === otherSelection}
            >
              {d.Driver.givenName} {d.Driver.familyName} · {d.Constructors[0]?.name}
            </option>
          ))}
        </select>

        {/* Custom chevron */}
        <svg
          className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      {/* Driver preview card — appears only when selected */}
      {selected ? (
        <div
          className="mt-3 flex items-center gap-3 rounded-sm border border-zinc-800 bg-zinc-900/50 p-3"
          style={{ borderLeft: `3px solid ${teamColor}` }}
        >
          <div
            className="flex h-11 w-14 items-center justify-center rounded-sm text-lg font-bold italic tabular-nums text-white shadow-sm"
            style={{ backgroundColor: teamColor }}
          >
            {selected.Driver.permanentNumber}
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-white">
              <span className="font-light">{selected.Driver.givenName}</span>{" "}
              <span className="font-bold uppercase tracking-wide">
                {selected.Driver.familyName}
              </span>
            </div>
            <div className="truncate text-xs text-zinc-500">
              {selected.Constructors[0]?.name} · P{selected.position} · {selected.points} pts
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-3 flex items-center rounded-sm border border-dashed border-zinc-800/60 bg-zinc-900/20 p-3">
          <div className="flex h-11 w-14 items-center justify-center rounded-sm border border-dashed border-zinc-800 text-xs uppercase tracking-widest text-zinc-700">
            —
          </div>
          <div className="ml-3 text-xs uppercase tracking-widest text-zinc-600">
            No driver selected
          </div>
        </div>
      )}
    </div>
  );
}