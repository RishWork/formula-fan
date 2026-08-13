type Props = {
  position: number;
};

const medals = [
  { fill: "#FDE68A", mid: "#F59E0B", edge: "#B45309", text: "#451A03" },
  { fill: "#F1F5F9", mid: "#CBD5E1", edge: "#94A3B8", text: "#1E293B" },
  { fill: "#FDBA8C", mid: "#C9885A", edge: "#92400E", text: "#431407" },
];

export default function PodiumMedal({ position }: Props) {
  const medal = medals[position - 1];

  // Positions outside the podium get a plain treatment.
  if (!medal) {
    return (
      <div className="flex h-11 w-11 items-center justify-center rounded-full border border-zinc-800 text-lg font-bold tabular-nums text-zinc-500">
        {position}
      </div>
    );
  }

  const gradientId = `medal-gradient-${position}`;

  return (
    <div className="relative h-11 w-11">
      <svg viewBox="0 0 44 44" className="h-full w-full">
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0.6" y2="1">
            <stop offset="0%" stopColor={medal.fill} />
            <stop offset="55%" stopColor={medal.mid} />
            <stop offset="100%" stopColor={medal.edge} />
          </linearGradient>
        </defs>
        <circle
          cx="22"
          cy="22"
          r="20"
          fill={`url(#${gradientId})`}
          stroke={medal.edge}
          strokeWidth="1.5"
        />
        <circle
          cx="22"
          cy="22"
          r="16"
          fill="none"
          stroke={medal.fill}
          strokeWidth="1"
          opacity="0.45"
        />
        <text
          x="22"
          y="23"
          textAnchor="middle"
          dominantBaseline="central"
          fontSize="18"
          fontWeight="800"
          fill={medal.text}
          fontFamily="ui-monospace, monospace"
        >
          {position}
        </text>
      </svg>
    </div>
  );
}