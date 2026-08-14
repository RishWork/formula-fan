"use client";

import { useState, useEffect } from "react";
import {
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  TooltipProps,
} from "recharts";
import { ChampionshipDriver, ProgressionRow } from "@/lib/jolpica";
import { getTeamColor } from "@/lib/teamColors";

type Props = {
  rows: ProgressionRow[];
  drivers: ChampionshipDriver[];
};

export default function ChampionshipChart({ rows, drivers }: Props) {
  const [focused, setFocused] = useState<string | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  const [hasAnimated, setHasAnimated] = useState(false);

  // Let the draw-in animation run once, then disable it so hover/focus state
  // changes don't re-trigger it on every interaction.
  useEffect(() => {
    const timer = setTimeout(() => setHasAnimated(true), 1600);
    return () => clearTimeout(timer);
  }, []);

  // Hover is a temporary preview; focus is a locked selection.
  const active = hovered ?? focused;

  // Team-mates share a colour, so the second driver from a team gets a dashed
  // line to stay distinguishable.
  const seenTeams = new Set<string>();
  const series = drivers.map((d) => {
    const isSecond = seenTeams.has(d.constructorId);
    seenTeams.add(d.constructorId);
    return {
      ...d,
      color: getTeamColor(d.constructorId),
      dashed: isSecond,
    };
  });

  const activeSeries = series.find((s) => s.driverId === active);

  const opacityFor = (id: string) => {
    if (active === null) return 1;
    return active === id ? 1 : 0.1;
  };

  return (
    <div className="overflow-hidden rounded-lg border border-zinc-800 bg-[#14141a] shadow-2xl shadow-black/50">
      {/* Interactive legend */}
      <div className="flex flex-wrap items-center gap-2 border-b border-zinc-800 px-5 py-4">
        {series.map((s) => {
          const isActive = active === s.driverId;
          const isFocused = focused === s.driverId;
          const isDimmed = active !== null && !isActive;

          return (
            <button
              key={s.driverId}
              onClick={() =>
                setFocused(focused === s.driverId ? null : s.driverId)
              }
              onMouseEnter={() => setHovered(s.driverId)}
              onMouseLeave={() => setHovered(null)}
              className={`flex items-center gap-2 rounded-sm border px-2.5 py-1.5 transition-all ${
                isFocused
                  ? "border-zinc-600 bg-white/5"
                  : "border-transparent hover:border-zinc-700"
              } ${isDimmed ? "opacity-35" : "opacity-100"}`}
              style={
                isFocused
                  ? { borderLeftColor: s.color, borderLeftWidth: 3 }
                  : undefined
              }
            >
              <svg width="18" height="4" aria-hidden="true">
                <line
                  x1="0"
                  y1="2"
                  x2="18"
                  y2="2"
                  stroke={s.color}
                  strokeWidth="3.5"
                  strokeDasharray={s.dashed ? "4 3" : undefined}
                  strokeLinecap="round"
                />
              </svg>
              <span className="font-mono text-[11px] font-bold uppercase tracking-widest text-zinc-200">
                {s.familyName}
              </span>
              <span className="font-mono text-[11px] tabular-nums text-zinc-500">
                {s.totalPoints}
              </span>
            </button>
          );
        })}

        {focused && (
          <button
            onClick={() => setFocused(null)}
            className="ml-1 rounded-sm px-2 py-1.5 font-mono text-[10px] uppercase tracking-widest text-zinc-600 transition-colors hover:text-zinc-300"
          >
            Reset
          </button>
        )}
      </div>

      {/* Chart */}
      <div className="h-[400px] w-full px-2 py-5">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={rows}
            margin={{ top: 8, right: 16, left: -14, bottom: 12 }}
          >
            <defs>
              <linearGradient id="focusFill" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="0%"
                  stopColor={activeSeries?.color ?? "#ffffff"}
                  stopOpacity={0.28}
                />
                <stop
                  offset="100%"
                  stopColor={activeSeries?.color ?? "#ffffff"}
                  stopOpacity={0}
                />
              </linearGradient>
            </defs>

            <CartesianGrid
              stroke="#27272a"
              strokeDasharray="3 3"
              vertical={false}
            />

            <XAxis
              dataKey="round"
              stroke="#52525b"
              tick={{
                fill: "#71717a",
                fontSize: 11,
                fontFamily: "ui-monospace",
              }}
              tickLine={false}
              axisLine={{ stroke: "#27272a" }}
              label={{
                value: "ROUND",
                position: "insideBottom",
                offset: -8,
                fill: "#52525b",
                fontSize: 10,
                letterSpacing: "0.2em",
              }}
            />

            <YAxis
              stroke="#52525b"
              tick={{
                fill: "#71717a",
                fontSize: 11,
                fontFamily: "ui-monospace",
              }}
              tickLine={false}
              axisLine={false}
            />

            <Tooltip
              content={<DarkTooltip series={series} active_id={active} />}
              cursor={{
                stroke: "#e10600",
                strokeWidth: 1,
                strokeDasharray: "4 4",
              }}
            />

            {/* Gradient area under the active line — rendered first so it sits behind */}
            {activeSeries && (
              <Area
                type="monotone"
                dataKey={activeSeries.driverId}
                stroke="none"
                fill="url(#focusFill)"
                isAnimationActive={false}
                activeDot={false}
              />
            )}

            {/* Glow bloom: a fat, translucent stroke beneath the crisp line */}
            {activeSeries && (
              <Line
                type="monotone"
                dataKey={activeSeries.driverId}
                stroke={activeSeries.color}
                strokeWidth={10}
                strokeOpacity={0.18}
                strokeLinecap="round"
                dot={false}
                activeDot={false}
                isAnimationActive={false}
                legendType="none"
              />
            )}

            {/* The actual driver lines */}
            {series.map((s) => (
              <Line
                key={s.driverId}
                type="monotone"
                dataKey={s.driverId}
                name={s.familyName}
                stroke={s.color}
                strokeWidth={active === s.driverId ? 3.5 : 2.5}
                strokeOpacity={opacityFor(s.driverId)}
                strokeDasharray={s.dashed ? "5 4" : undefined}
                strokeLinecap="round"
                dot={false}
                activeDot={{
                  r: active === s.driverId ? 6 : 4,
                  strokeWidth: 2,
                  stroke: "#0a0a0f",
                  fill: s.color,
                }}
                isAnimationActive={!hasAnimated}
                animationDuration={1400}
                animationEasing="ease-out"
              />
            ))}
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Hint */}
      <div className="border-t border-zinc-800 bg-black/20 px-5 py-2.5 text-center font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-600">
        Click a driver to isolate their line
      </div>
    </div>
  );
}

function DarkTooltip({
  active,
  payload,
  label,
  series,
  active_id,
}: TooltipProps<number, string> & {
  series?: Array<{ driverId: string; familyName: string; color: string }>;
  active_id?: string | null;
}) {
  if (!active || !payload || payload.length === 0) return null;

  const raceName = payload[0]?.payload?.raceName as string | undefined;

  // Only show real driver series, and honour the isolate selection.
  const validIds = new Set(series?.map((s) => s.driverId) ?? []);
  const entries = payload
    .filter((p) => validIds.has(p.dataKey as string))
    .filter((p) => (active_id ? p.dataKey === active_id : true))
    .sort((a, b) => Number(b.value ?? 0) - Number(a.value ?? 0));

  if (entries.length === 0) return null;

  const leader = Number(entries[0]?.value ?? 0);

  return (
    <div className="rounded-sm border border-zinc-700 bg-[#0a0a0f]/95 px-3.5 py-3 shadow-2xl backdrop-blur-sm">
      <div className="mb-1 font-mono text-[10px] uppercase tracking-[0.25em] text-zinc-500">
        Round {label}
      </div>
      {raceName && (
        <div className="mb-2.5 border-b border-zinc-800 pb-2 text-xs font-bold uppercase tracking-wide text-white">
          {raceName}
        </div>
      )}
      <div className="space-y-1">
        {entries.map((entry, idx) => {
          const value = Number(entry.value ?? 0);
          const gap = leader - value;
          return (
            <div
              key={entry.dataKey as string}
              className="flex items-center justify-between gap-5 text-xs"
            >
              <span
                className="font-mono font-bold uppercase tracking-wide"
                style={{ color: entry.color }}
              >
                {entry.name}
              </span>
              <span className="flex items-baseline gap-2">
                <span className="font-mono tabular-nums text-white">
                  {value}
                </span>
                {idx > 0 && gap > 0 && (
                  <span className="font-mono text-[10px] tabular-nums text-zinc-600">
                    −{gap}
                  </span>
                )}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}