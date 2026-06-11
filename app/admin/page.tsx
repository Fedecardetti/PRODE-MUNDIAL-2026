import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AdminClient } from "./AdminClient";

export default async function AdminPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "ADMIN") {
    redirect("/");
  }

  const matches = await prisma.match.findMany({
    where: { stage: "GROUP" },
    orderBy: [{ date: "asc" }, { group: "asc" }],
  });

  return (
    <AdminClient
      matches={matches.map((m) => ({
        id: m.id,
        homeTeam: m.homeTeam,
        awayTeam: m.awayTeam,
        group: m.group,
        matchday: m.matchday,
        date: m.date.toISOString(),
        homeScore: m.homeScore,
        awayScore: m.awayScore,
      }))}
    />
  );
}
