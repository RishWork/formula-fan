import { getTeamAbbreviation } from "@/lib/teamAbbreviations";
import { getTeamColor } from "@/lib/teamColors";

type Props = {
  constructorId: string;
  name?: string;
  size?: "sm" | "md";
};

export default function TeamBadge({
  constructorId,
  name,
  size = "md",
}: Props) {
  const color = getTeamColor(constructorId);
  const abbr = getTeamAbbreviation(constructorId, name);

  const sizeClasses =
    size === "sm"
      ? "h-6 px-1.5 text-[10px]"
      : "h-7 px-2 text-xs";

  return (
    <span
      className={`inline-flex items-center justify-center rounded-sm font-mono font-bold tracking-[0.1em] text-white ${sizeClasses}`}
      style={{ backgroundColor: color }}
      title={name}
    >
      {abbr}
    </span>
  );
}