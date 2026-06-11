"use client";
import { getFlagUrl } from "@/lib/flags";

interface FlagProps {
  team: string;
  size?: number;
}

export function Flag({ team, size = 28 }: FlagProps) {
  const url = getFlagUrl(team);
  if (!url) return null;
  return (
    <img
      src={url}
      alt={team}
      width={size}
      height={Math.round(size * 0.67)}
      className="rounded-sm object-cover flex-shrink-0"
      style={{ width: size, height: Math.round(size * 0.67) }}
    />
  );
}
