import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const predictions = await prisma.prediction.findMany({
    where: { userId: session.user.id },
    include: { match: true },
  });

  return NextResponse.json(predictions);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { matchId, homeScore, awayScore } = await req.json();

  if (homeScore === undefined || awayScore === undefined || !matchId) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  // Check match hasn't started (no result yet)
  const match = await prisma.match.findUnique({ where: { id: matchId } });
  if (!match) return NextResponse.json({ error: "Match not found" }, { status: 404 });
  if (match.homeScore !== null) {
    return NextResponse.json({ error: "Match already has results, can't predict" }, { status: 400 });
  }

  const prediction = await prisma.prediction.upsert({
    where: { userId_matchId: { userId: session.user.id, matchId } },
    update: { homeScore: Number(homeScore), awayScore: Number(awayScore), points: null },
    create: {
      userId: session.user.id,
      matchId,
      homeScore: Number(homeScore),
      awayScore: Number(awayScore),
    },
  });

  return NextResponse.json(prediction);
}
