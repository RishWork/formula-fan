"use client";

import { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  TooltipProps,
} from "recharts";
import { LapDriver, LapRow } from "@/lib/jolpica";
import { getTeamColor } from "@/lib/teamColors";

type Props = {
  positionRows: LapRow[];
  timeRows: LapRow[];
  drivers: LapDriver[];
  fastestLapSeconds: number;
};

type Mode = "position" | "time";

export default function RaceLapChart({
  positionRows,
  timeRows,
  drivers,
  fastestLapSeconds,
}: Props) {
  const [mode, setMode] = useState<Mode>("position");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [hovered, setHovered] = useState<string | null>(null);

  const rows = mode === "position" ? positionRows : timeRows;
  const hasSelection = selected.size > 0;

  const toggle = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelected(next);
  };

  const isLit = (id: string) => {
    if (hovered) return hovered === id;
    if (hasSelection) return selected.has(id);
    return true;
  };

  const opacityFor = (id: string) => {
    if (hovered) return hovered === id ? 1 : 0.06;
    if (hasSelection) return selected.has(id) ? 1 : 0.06;
    return 0.85;
  };

  // Team-mates share a colour, so the second driver from a team gets a dashed line.
  const seenTeams = new Set<string>();
  const series = drivers.map((d) => {
    const isSecond = seenTeams.has(d.constructorId);
    seenTeams.add(d.constructorId);
    return { ...d, color: getTeamColor(d.constructorId), dashed: isSecond };
  });

  // Lap-time axis: anchor on the fastest lap and allow ~8% above it. Pit and
  // safety-car laps sit well outside that and get clipped, which is what makes
  // the racing pace legible.
  const timeMin = fastestLapSeconds - 0.4;
  const timeMax = fastestLapSeconds * 1.08;

  return (
    <div className="overflow-hidden rounded-lg border border-zinc-800 bg-[#14141a] shadow-2xl shadow-black/50">
      {/* Mode toggle */}
      <div className="flex items-center justify-between border-b border-zinc-800 px-5 py-3">
        <div className="flex gap-1">
          <ModeButton
            label="Position"
            isActive={mode === "position"}
            onClick={() => setMode("position")}
          />
          <ModeButton
            label="Lap Times"
            isActive={mode === "time"}
            onClick={() => setMode("time")}
          />
        </div>
        {hasSelection && (
          <button
            onClick={() => setSelected(new Set())}
            className="font-mono text-[10px] uppercase tracking-widest text-zinc-500 transition-colors hover:text-white"
          >
            Clear ({selected.size})
          </button>
        )}
      </div>

      {/* Driver chips */}
      <div className="flex flex-wrap gap-1.5 border-b border-zinc-800 px-5 py-4">
        {series.map((s) => {
          const lit = isLit(s.driverId);
          const picked = selected.has(s.driverId);
          return (
            <button
              key={s.driverId}
              onClick={() => toggle(s.driverId)}
              onMouseEnter={() => setHovered(s.driverId)}
              onMouseLeave={() => setHovered(null)}
              className={`rounded-sm px-2 py-1 font-mono text-[10px] font-bold tracking-[0.1em] transition-all ${
                lit ? "opacity-100" : "opacity-30"
              } ${picked ? "text-white" : "text-zinc-900"}`}
              style={{
                backgroundColor: picked ? "transparent" : s.color,
                border: `2px solid ${s.color}`,
              }}
              title={s.familyName}
            >
              {s.code || s.familyName.slice(0, 3).toUpperCase()}
            </button>
          );
        })}
      </div>

      {/* Chart */}
      <div className="h-[440px] w-full px-2 py-5">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={rows}
            margin={{ top: 8, right: 16, left: -12, bottom: 12 }}
          >
            <CartesianGrid
              stroke="#27272a"
              strokeDasharray="3 3"
              vertical={false}
            />
            <XAxis
              dataKey="lap"
              stroke="#52525b"
              tick={{
                fill: "#71717a",
                fontSize: 11,
                fontFamily: "ui-monospace",
              }}
              tickLine={false}
              axisLine={{ stroke: "#27272a" }}
              label={{
                value: "LAP",
                position: "insideBottom",
                offset: -8,
                fill: "#52525b",
                fontSize: 10,
                letterSpacing: "0.2em",
              }}
            />
            {mode === "position" ? (
              <YAxis
                reversed
                domain={[1, series.length]}
                ticks={[1, 5, 10, 15, 20].filter((t) => t <= series.length)}
                allowDecimals={false}
                stroke="#52525b"
                tick={{
                  fill: "#71717a",
                  fontSize: 11,
                  fontFamily: "ui-monospace",
                }}
                tickLine={false}
                axisLine={false}
                width={36}
              />
            ) : (
              <YAxis
                domain={[timeMin, timeMax]}
                allowDataOverflow
                stroke="#52525b"
                tick={{
                  fill: "#71717a",
                  fontSize: 11,
                  fontFamily: "ui-monospace",
                }}
                tickFormatter={(v: number) => formatSeconds(v)}
                tickLine={false}
                axisLine={false}
                width={56}
              />
            )}
            <Tooltip
              content={<LapTooltip mode={mode} series={series} lit={isLit} />}
              cursor={{
                stroke: "#e10600",
                strokeWidth: 1,
                strokeDasharray: "4 4",
              }}
            />
            {series.map((s) => (
              <Line
                key={s.driverId}
                type={mode === "position" ? "stepAfter" : "monotone"}
                dataKey={s.driverId}
                name={s.code || s.familyName}
                stroke={s.color}
                strokeWidth={isLit(s.driverId) && (hovered || hasSelection) ? 3 : 1.75}
                strokeOpacity={opacityFor(s.driverId)}
                strokeDasharray={s.dashed ? "5 4" : undefined}
                strokeLinecap="round"
                dot={false}
                activeDot={
                  isLit(s.driverId)
                    ? { r: 4, strokeWidth: 2, stroke: "#0a0a0f", fill: s.color }
                    : false
                }
                connectNulls={false}
                isAnimationActive={false}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="border-t border-zinc-800 bg-black/20 px-5 py-2.5 text-center font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-600">
        {mode === "position"
          ? "Click drivers to isolate · lines end where a driver retired"
          : "Pit and safety-car laps fall outside the axis range"}
      </div>
    </div>
  );
}

function ModeButton({
  label,
  isActive,
  onClick,
}: {
  label: string;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-sm px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.2em] transition-colors ${
        isActive
          ? "bg-white/5 text-white"
          : "text-zinc-500 hover:text-zinc-300"
      }`}
      style={isActive ? { borderBottom: "2px solid #e10600" } : undefined}
    >
      {label}
    </button>
  );
}

function formatSeconds(v: number): string {
  const mins = Math.floor(v / 60);
  const secs = v - mins * 60;
  return `${mins}:${secs.toFixed(1).padStart(4, "0")}`;
}

function LapTooltip({
  active,
  payload,
  label,
  mode,
  series,
  lit,
}: TooltipProps<number, string> & {
  mode: Mode;
  series?: Array<{ driverId: string; code: string; color: string }>;
  lit: (id: string) => boolean;
}) {
  if (!active || !payload || payload.length === 0) return null;

  const validIds = new Set(series?.map((s) => s.driverId) ?? []);
  const entries = payload
    .filter((p) => validIds.has(p.dataKey as string))
    .filter((p) => p.value !== null && p.value !== undefined)
    .filter((p) => lit(p.dataKey as string))
    .sort((a, b) => Number(a.value ?? 0) - Number(b.value ?? 0))
    .slice(0, 12);

  if (entries.length === 0) return null;

  return (
    <div className="rounded-sm border border-zinc-700 bg-[#0a0a0f]/95 px-3.5 py-3 shadow-2xl backdrop-blur-sm">
      <div className="mb-2 border-b border-zinc-800 pb-2 font-mono text-[10px] uppercase tracking-[0.25em] text-zinc-500">
        Lap {label}
      </div>
      <div className="space-y-1">
        {entries.map((entry) => (
          <div
            key={entry.dataKey as string}
            className="flex items-center justify-between gap-5 text-xs"
          >
            <span
              className="font-mono font-bold tracking-wide"
              style={{ color: entry.color }}
            >
              {entry.name}
            </span>
            <span className="font-mono tabular-nums text-white">
              {mode === "position"
                ? `P${entry.value}`
                : formatSeconds(Number(entry.value))}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}