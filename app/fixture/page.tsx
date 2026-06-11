import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { FixtureClient } from "./FixtureClient";

export const revalidate = 0;

export default async function FixturePage() {
  const session = await getServerSession(authOptions);

  const matches = await prisma.match.findMany({
    where: { stage: "GROUP" },
    orderBy: [{ group: "asc" }, { matchday: "asc" }],
  });

  let predictionsMap: Record<string, { homeScore: number; awayScore: number; points: number | null }> = {};
  if (session) {
    const predictions = await prisma.prediction.findMany({
      where: { userId: session.user.id },
    });
    predictionsMap = Object.fromEntries(
      predictions.map((p) => [p.matchId, { homeScore: p.homeScore, awayScore: p.awayScore, points: p.points }])
    );
  }

  const serializedMatches = matches.map((m) => ({
    ...m,
    date: m.date.toISOString(),
    homeScore: m.homeScore,
    awayScore: m.awayScore,
  }));

  return <FixtureClient matches={serializedMatches} predictionsMap={predictionsMap} />;
}
