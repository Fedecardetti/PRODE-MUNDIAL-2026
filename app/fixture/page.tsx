import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getFlag } from "@/lib/flags";

function formatDate(date: Date) {
  return new Date(date).toLocaleDateString("es-AR", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

export default async function FixturePage() {
  const session = await getServerSession(authOptions);

  const matches = await prisma.match.findMany({
    where: { stage: "GROUP" },
    orderBy: [{ group: "asc" }, { matchday: "asc" }],
  });

  // Get user predictions if logged in
  let predictionsMap: Record<string, { homeScore: number; awayScore: number; points: number | null }> = {};
  if (session) {
    const predictions = await prisma.prediction.findMany({
      where: { userId: session.user.id },
    });
    predictionsMap = Object.fromEntries(
      predictions.map((p) => [p.matchId, { homeScore: p.homeScore, awayScore: p.awayScore, points: p.points }])
    );
  }

  // Group matches by group
  const byGroup: Record<string, typeof matches> = {};
  for (const m of matches) {
    if (!byGroup[m.group]) byGroup[m.group] = [];
    byGroup[m.group].push(m);
  }

  const groups = Object.keys(byGroup).sort();

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Fixture Fase de Grupos</h1>
        <p className="text-slate-400 mt-1">FIFA World Cup 2026 &mdash; 12 de junio al 30 de junio</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {groups.map((group) => (
          <div key={group} className="bg-[#0d1f38] border border-slate-700 rounded-xl overflow-hidden">
            <div className="bg-green-700 px-4 py-3">
              <h2 className="font-bold text-white text-lg">Grupo {group}</h2>
            </div>

            <div className="divide-y divide-slate-700/50">
              {byGroup[group].map((match) => {
                const pred = predictionsMap[match.id];
                const hasResult = match.homeScore !== null;

                return (
                  <div key={match.id} className="px-4 py-3">
                    <div className="text-xs text-slate-500 mb-2">
                      Fecha {match.matchday} &mdash; {formatDate(match.date)}
                    </div>
                    <div className="flex items-center gap-2">
                      {/* Home team */}
                      <div className="flex-1 flex items-center gap-2 justify-end">
                        <span className="text-slate-200 text-sm font-medium text-right">{match.homeTeam}</span>
                        <span className="text-lg">{getFlag(match.homeTeam)}</span>
                      </div>

                      {/* Score / Result */}
                      <div className="flex items-center gap-1 min-w-[5rem] justify-center">
                        {hasResult ? (
                          <span className="bg-slate-700 text-white font-bold text-lg px-3 py-1 rounded">
                            {match.homeScore} - {match.awayScore}
                          </span>
                        ) : (
                          <span className="text-slate-600 text-sm">vs</span>
                        )}
                      </div>

                      {/* Away team */}
                      <div className="flex-1 flex items-center gap-2">
                        <span className="text-lg">{getFlag(match.awayTeam)}</span>
                        <span className="text-slate-200 text-sm font-medium">{match.awayTeam}</span>
                      </div>

                      {/* Prediction badge */}
                      {pred && (
                        <div className="ml-2 flex items-center gap-1">
                          <span className="text-xs bg-slate-800 text-slate-300 px-2 py-1 rounded border border-slate-600">
                            {pred.homeScore}-{pred.awayScore}
                          </span>
                          {pred.points !== null && (
                            <span className={`text-xs font-bold px-2 py-1 rounded ${
                              pred.points === 3 ? "bg-yellow-600 text-yellow-100" :
                              pred.points === 1 ? "bg-blue-700 text-blue-100" :
                              "bg-slate-700 text-slate-400"
                            }`}>
                              {pred.points}pts
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
