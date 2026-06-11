import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      predictions: {
        select: { points: true },
      },
    },
  });

  const leaderboard = users
    .map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      totalPoints: u.predictions.reduce((sum, p) => sum + (p.points ?? 0), 0),
      predictionsCount: u.predictions.length,
      exactScores: u.predictions.filter((p) => p.points === 3).length,
      correctOutcomes: u.predictions.filter((p) => p.points === 1).length,
    }))
    .sort((a, b) => b.totalPoints - a.totalPoints);

  return NextResponse.json(leaderboard);
}
