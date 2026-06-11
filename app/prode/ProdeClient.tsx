"use client";

import { useState, useCallback } from "react";
import { getFlag } from "@/lib/flags";

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("es-AR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

interface Match {
  id: string;
  homeTeam: string;
  awayTeam: string;
  group: string;
  matchday: number;
  date: string;
}

interface Props {
  matches: Match[];
  initialPredictions: Record<string, { homeScore: number; awayScore: number }>;
}

export function ProdeClient({ matches, initialPredictions }: Props) {
  const [predictions, setPredictions] = useState<
    Record<string, { home: string; away: string }>
  >(
    Object.fromEntries(
      Object.entries(initialPredictions).map(([id, p]) => [
        id,
        { home: String(p.homeScore), away: String(p.awayScore) },
      ])
    )
  );
  const [saved, setSaved] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = useCallback(
    (matchId: string, field: "home" | "away", value: string) => {
      const numeric = value.replace(/[^0-9]/g, "").slice(0, 2);
      setPredictions((prev) => ({
        ...prev,
        [matchId]: { ...prev[matchId], [field]: numeric },
      }));
      setSaved((prev) => ({ ...prev, [matchId]: false }));
    },
    []
  );

  async function savePrediction(matchId: string) {
    const pred = predictions[matchId];
    if (!pred || pred.home === "" || pred.away === "") {
      setErrors((prev) => ({ ...prev, [matchId]: "Completá ambos scores" }));
      return;
    }

    setSaving((prev) => ({ ...prev, [matchId]: true }));
    setErrors((prev) => ({ ...prev, [matchId]: "" }));

    const res = await fetch("/api/predictions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        matchId,
        homeScore: Number(pred.home),
        awayScore: Number(pred.away),
      }),
    });

    setSaving((prev) => ({ ...prev, [matchId]: false }));

    if (res.ok) {
      setSaved((prev) => ({ ...prev, [matchId]: true }));
    } else {
      const data = await res.json();
      setErrors((prev) => ({ ...prev, [matchId]: data.error || "Error al guardar" }));
    }
  }

  // Group by date
  const byDate: Record<string, Match[]> = {};
  for (const m of matches) {
    const dateKey = m.date.split("T")[0];
    if (!byDate[dateKey]) byDate[dateKey] = [];
    byDate[dateKey].push(m);
  }

  const sortedDates = Object.keys(byDate).sort();

  if (matches.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <div className="text-5xl mb-4">✅</div>
        <h1 className="text-2xl font-bold text-white mb-2">No hay partidos pendientes</h1>
        <p className="text-slate-400">Todos los partidos ya tienen resultado cargado.</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Mi Prode</h1>
        <p className="text-slate-400 mt-1">
          Ingresá tus predicciones para los partidos pendientes
        </p>
      </div>

      <div className="space-y-6">
        {sortedDates.map((dateKey) => (
          <div key={dateKey}>
            <h2 className="text-green-400 font-semibold text-sm uppercase tracking-wider mb-3 px-1">
              {formatDate(dateKey + "T12:00:00")}
            </h2>

            <div className="space-y-3">
              {byDate[dateKey].map((match) => {
                const pred = predictions[match.id] || { home: "", away: "" };
                const isSaved = saved[match.id];
                const isSaving = saving[match.id];
                const err = errors[match.id];

                return (
                  <div
                    key={match.id}
                    className={`bg-[#0d1f38] border rounded-xl p-4 transition-all ${
                      isSaved ? "border-green-600" : "border-slate-700"
                    }`}
                  >
                    <div className="flex items-center gap-1 text-xs text-slate-500 mb-3">
                      <span>Grupo {match.group}</span>
                      <span>&mdash;</span>
                      <span>Fecha {match.matchday}</span>
                    </div>

                    <div className="flex items-center gap-3">
                      {/* Home */}
                      <div className="flex-1 flex items-center gap-2 justify-end">
                        <span className="text-slate-200 text-sm font-medium text-right leading-tight">
                          {match.homeTeam}
                        </span>
                        <span className="text-2xl">{getFlag(match.homeTeam)}</span>
                      </div>

                      {/* Score inputs */}
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min={0}
                          max={99}
                          value={pred.home}
                          onChange={(e) => handleChange(match.id, "home", e.target.value)}
                          className="w-12 text-center text-xl font-bold bg-slate-800 border border-slate-600 rounded-lg py-2 text-white focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
                          placeholder="0"
                        />
                        <span className="text-slate-500 font-bold text-lg">-</span>
                        <input
                          type="number"
                          min={0}
                          max={99}
                          value={pred.away}
                          onChange={(e) => handleChange(match.id, "away", e.target.value)}
                          className="w-12 text-center text-xl font-bold bg-slate-800 border border-slate-600 rounded-lg py-2 text-white focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
                          placeholder="0"
                        />
                      </div>

                      {/* Away */}
                      <div className="flex-1 flex items-center gap-2">
                        <span className="text-2xl">{getFlag(match.awayTeam)}</span>
                        <span className="text-slate-200 text-sm font-medium leading-tight">
                          {match.awayTeam}
                        </span>
                      </div>

                      {/* Save button */}
                      <button
                        onClick={() => savePrediction(match.id)}
                        disabled={isSaving}
                        className={`ml-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                          isSaved
                            ? "bg-green-700 text-green-100"
                            : "bg-slate-700 hover:bg-slate-600 text-white"
                        }`}
                      >
                        {isSaving ? "..." : isSaved ? "✓ Guardado" : "Guardar"}
                      </button>
                    </div>

                    {err && (
                      <p className="text-red-400 text-xs mt-2 text-center">{err}</p>
                    )}
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
