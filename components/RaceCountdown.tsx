"use client";

import { useEffect, useState } from "react";

type Props = {
  targetIso: string;
};

type Delta = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isLive: boolean;
};

function calculateDelta(target: Date): Delta {
  const diff = target.getTime() - Date.now();
  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isLive: true };
  }
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
    isLive: false,
  };
}

export default function RaceCountdown({ targetIso }: Props) {
  // Start as null so server render and first client render match.
  // Once mounted, we start calculating for real.
  const [delta, setDelta] = useState<Delta | null>(null);

  useEffect(() => {
    const target = new Date(targetIso);
    setDelta(calculateDelta(target));
    const interval = setInterval(() => {
      setDelta(calculateDelta(target));
    }, 1000);
    return () => clearInterval(interval);
  }, [targetIso]);

  if (!delta) {
    return (
      <div className="flex gap-4">
        <TimeBlock value="--" label="Days" />
        <TimeBlock value="--" label="Hrs" />
        <TimeBlock value="--" label="Min" />
        <TimeBlock value="--" label="Sec" />
      </div>
    );
  }

  if (delta.isLive) {
    return (
      <div className="flex items-center gap-2">
        <div className="h-2.5 w-2.5 animate-pulse rounded-full bg-red-500" />
        <span className="font-bold uppercase tracking-widest text-red-500">
          Race in progress
        </span>
      </div>
    );
  }

  return (
    <div className="flex gap-4">
      <TimeBlock value={String(delta.days).padStart(2, "0")} label="Days" />
      <TimeBlock value={String(delta.hours).padStart(2, "0")} label="Hrs" />
      <TimeBlock value={String(delta.minutes).padStart(2, "0")} label="Min" />
      <TimeBlock value={String(delta.seconds).padStart(2, "0")} label="Sec" />
    </div>
  );
}

function TimeBlock({ value, label }: { value: string; label: string }) {
  return (
    <div className="text-center">
      <div className="text-4xl font-bold tabular-nums text-white">{value}</div>
      <div className="mt-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-500">
        {label}
      </div>
    </div>
  );
}