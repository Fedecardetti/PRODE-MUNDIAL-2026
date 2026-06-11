import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ProdeClient } from "./ProdeClient";
import { prisma } from "@/lib/prisma";

export default async function ProdePage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  // Get upcoming matches (no result yet)
  const matches = await prisma.match.findMany({
    where: { stage: "GROUP", homeScore: null },
    orderBy: [{ date: "asc" }, { group: "asc" }],
  });

  // Get user's predictions
  const predictions = await prisma.prediction.findMany({
    where: { userId: session.user.id },
  });

  const predictionsMap: Record<string, { homeScore: number; awayScore: number }> = {};
  for (const p of predictions) {
    predictionsMap[p.matchId] = { homeScore: p.homeScore, awayScore: p.awayScore };
  }

  return (
    <ProdeClient
      matches={matches.map((m) => ({
        id: m.id,
        homeTeam: m.homeTeam,
        awayTeam: m.awayTeam,
        group: m.group,
        matchday: m.matchday,
        date: m.date.toISOString(),
      }))}
      initialPredictions={predictionsMap}
    />
  );
}
