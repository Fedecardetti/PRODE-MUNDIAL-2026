import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function TablaPage() {
  const session = await getServerSession(authOptions);

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
      wrong: u.predictions.filter((p) => p.points === 0).length,
    }))
    .sort((a, b) => {
      if (b.totalPoints !== a.totalPoints) return b.totalPoints - a.totalPoints;
      if (b.exactScores !== a.exactScores) return b.exactScores - a.exactScores;
      return a.name.localeCompare(b.name);
    });

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Tabla de Posiciones</h1>
        <p className="text-slate-400 mt-1">Ranking de todos los participantes</p>
      </div>

      <div className="bg-[#0d1f38] border border-slate-700 rounded-xl overflow-hidden">
        {/* Header */}
        <div className="grid grid-cols-[3rem_1fr_4rem_4rem_4rem_4rem] gap-2 px-4 py-3 bg-slate-800/50 text-xs text-slate-400 font-medium uppercase tracking-wider">
          <div className="text-center">#</div>
          <div>Jugador</div>
          <div className="text-center">Pts</div>
          <div className="text-center hidden sm:block">Exactos</div>
          <div className="text-center hidden sm:block">Outcome</div>
          <div className="text-center hidden sm:block">Prodes</div>
        </div>

        {leaderboard.length === 0 && (
          <div className="px-4 py-12 text-center text-slate-500">
            Nadie ha hecho predicciones todavía.
          </div>
        )}

        {leaderboard.map((user, idx) => {
          const isMe = session?.user?.id === user.id;
          const medal = idx === 0 ? "🥇" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : null;

          return (
            <div
              key={user.id}
              className={`grid grid-cols-[3rem_1fr_4rem_4rem_4rem_4rem] gap-2 px-4 py-4 border-t border-slate-700/50 items-center transition-colors ${
                isMe ? "bg-green-900/20 border-l-2 border-l-green-500" : "hover:bg-slate-800/30"
              }`}
            >
              {/* Rank */}
              <div className="text-center">
                {medal ? (
                  <span className="text-xl">{medal}</span>
                ) : (
                  <span className="text-slate-400 font-bold">{idx + 1}</span>
                )}
              </div>

              {/* Name */}
              <div>
                <div className="font-semibold text-white flex items-center gap-2">
                  {user.name}
                  {isMe && (
                    <span className="text-xs bg-green-700 text-green-100 px-2 py-0.5 rounded-full">
                      Yo
                    </span>
                  )}
                </div>
                <div className="text-xs text-slate-500">{user.email}</div>
              </div>

              {/* Total points */}
              <div className="text-center">
                <span className={`text-xl font-bold ${
                  idx === 0 ? "text-yellow-400" :
                  idx === 1 ? "text-slate-300" :
                  idx === 2 ? "text-amber-600" :
                  "text-white"
                }`}>
                  {user.totalPoints}
                </span>
              </div>

              {/* Exact scores */}
              <div className="text-center hidden sm:block">
                <span className="text-yellow-500 font-medium">{user.exactScores}</span>
              </div>

              {/* Correct outcomes */}
              <div className="text-center hidden sm:block">
                <span className="text-blue-400 font-medium">{user.correctOutcomes}</span>
              </div>

              {/* Total predictions */}
              <div className="text-center hidden sm:block">
                <span className="text-slate-400">{user.predictionsCount}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-4 flex gap-6 text-xs text-slate-500 px-1">
        <span><span className="text-yellow-500 font-medium">Exactos</span> = 3 pts</span>
        <span><span className="text-blue-400 font-medium">Outcome</span> = 1 pt</span>
        <span><span className="text-slate-400">Prodes</span> = predicciones totales</span>
      </div>
    </div>
  );
}
