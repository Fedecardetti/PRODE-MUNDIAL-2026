import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function calculatePoints(
  predHome: number,
  predAway: number,
  realHome: number,
  realAway: number
): number {
  if (predHome === realHome && predAway === realAway) return 3;

  const predOutcome =
    predHome > predAway ? "H" : predHome < predAway ? "A" : "D";
  const realOutcome =
    realHome > realAway ? "H" : realHome < realAway ? "A" : "D";

  if (predOutcome === realOutcome) return 1;
  return 0;
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { matchId, homeScore, awayScore } = await req.json();

  if (!matchId || homeScore === undefined || awayScore === undefined) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const realHome = Number(homeScore);
  const realAway = Number(awayScore);

  // Update the match result
  await prisma.match.update({
    where: { id: matchId },
    data: { homeScore: realHome, awayScore: realAway },
  });

  // Calculate points for all predictions of this match
  const predictions = await prisma.prediction.findMany({
    where: { matchId },
  });

  for (const pred of predictions) {
    const points = calculatePoints(pred.homeScore, pred.awayScore, realHome, realAway);
    await prisma.prediction.update({
      where: { id: pred.id },
      data: { points },
    });
  }

  return NextResponse.json({ updated: predictions.length });
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { matchId } = await req.json();

  // Clear result
  await prisma.match.update({
    where: { id: matchId },
    data: { homeScore: null, awayScore: null },
  });

  // Reset points
  await prisma.prediction.updateMany({
    where: { matchId },
    data: { points: null },
  });

  return NextResponse.json({ ok: true });
}
