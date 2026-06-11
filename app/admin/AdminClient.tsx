"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Flag } from "@/components/Flag";

interface Match {
  id: string;
  homeTeam: string;
  awayTeam: string;
  group: string;
  matchday: number;
  date: string;
  homeScore: number | null;
  awayScore: number | null;
}

export function AdminClient({ matches }: { matches: Match[] }) {
  const router = useRouter();
  const [scores, setScores] = useState<Record<string, { home: string; away: string }>>(
    Object.fromEntries(
      matches.map((m) => [
        m.id,
        {
          home: m.homeScore !== null ? String(m.homeScore) : "",
          away: m.awayScore !== null ? String(m.awayScore) : "",
        },
      ])
    )
  );
  const [saving, setSaving] = useState<Record<string, boolean>>({});
  const [saved, setSaved] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [filter, setFilter] = useState<"all" | "pending" | "done">("all");

  function handleChange(matchId: string, field: "home" | "away", value: string) {
    const numeric = value.replace(/[^0-9]/g, "").slice(0, 2);
    setScores((prev) => ({
      ...prev,
      [matchId]: { ...prev[matchId], [field]: numeric },
    }));
    setSaved((prev) => ({ ...prev, [matchId]: false }));
  }

  async function saveResult(matchId: string) {
    const sc = scores[matchId];
    if (sc.home === "" || sc.away === "") {
      setErrors((prev) => ({ ...prev, [matchId]: "Completá ambos scores" }));
      return;
    }
    setSaving((prev) => ({ ...prev, [matchId]: true }));
    setErrors((prev) => ({ ...prev, [matchId]: "" }));

    const res = await fetch("/api/admin/results", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ matchId, homeScore: Number(sc.home), awayScore: Number(sc.away) }),
    });

    setSaving((prev) => ({ ...prev, [matchId]: false }));

    if (res.ok) {
      setSaved((prev) => ({ ...prev, [matchId]: true }));
      router.refresh();
    } else {
      const data = await res.json();
      setErrors((prev) => ({ ...prev, [matchId]: data.error || "Error" }));
    }
  }

  async function clearResult(matchId: string) {
    setSaving((prev) => ({ ...prev, [matchId]: true }));
    const res = await fetch("/api/admin/results", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ matchId }),
    });
    setSaving((prev) => ({ ...prev, [matchId]: false }));
    if (res.ok) {
      setScores((prev) => ({ ...prev, [matchId]: { home: "", away: "" } }));
      setSaved((prev) => ({ ...prev, [matchId]: false }));
      router.refresh();
    }
  }

  const filtered = matches.filter((m) => {
    if (filter === "pending") return m.homeScore === null;
    if (filter === "done") return m.homeScore !== null;
    return true;
  });

  // Group by group
  const byGroup: Record<string, Match[]> = {};
  for (const m of filtered) {
    if (!byGroup[m.group]) byGroup[m.group] = [];
    byGroup[m.group].push(m);
  }

  const groups = Object.keys(byGroup).sort();
  const pendingCount = matches.filter((m) => m.homeScore === null).length;
  const doneCount = matches.filter((m) => m.homeScore !== null).length;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white">Panel Admin</h1>
        <p className="text-slate-400 mt-1">Cargar resultados de la Fase de Grupos</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-[#0d1f38] border border-slate-700 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-white">{matches.length}</div>
          <div className="text-slate-400 text-sm">Total partidos</div>
        </div>
        <div className="bg-[#0d1f38] border border-slate-700 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-green-400">{doneCount}</div>
          <div className="text-slate-400 text-sm">Con resultado</div>
        </div>
        <div className="bg-[#0d1f38] border border-slate-700 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-yellow-400">{pendingCount}</div>
          <div className="text-slate-400 text-sm">Pendientes</div>
        </div>
      </div>

      {/* Filter */}
      <div className="flex gap-2 mb-6">
        {(["all", "pending", "done"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === f
                ? "bg-green-600 text-white"
                : "bg-slate-800 text-slate-300 hover:bg-slate-700"
            }`}
          >
            {f === "all" ? "Todos" : f === "pending" ? "Pendientes" : "Cargados"}
          </button>
        ))}
      </div>

      {/* Matches */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {groups.map((group) => (
          <div key={group} className="bg-[#0d1f38] border border-slate-700 rounded-xl overflow-hidden">
            <div className="bg-green-700/80 px-4 py-2">
              <h2 className="font-bold text-white">Grupo {group}</h2>
            </div>
            <div className="divide-y divide-slate-700/50">
              {byGroup[group].map((match) => {
                const sc = scores[match.id] || { home: "", away: "" };
                const isSaving = saving[match.id];
                const isSaved = saved[match.id];
                const err = errors[match.id];
                const hasResult = match.homeScore !== null;

                return (
                  <div key={match.id} className="p-3">
                    <div className="text-xs text-slate-500 mb-2">Fecha {match.matchday}</div>
                    <div className="flex items-center gap-2">
                      {/* Home */}
                      <div className="flex-1 flex items-center gap-1 justify-end">
                        <span className="text-slate-200 text-xs text-right">{match.homeTeam}</span>
                        <Flag team={match.homeTeam} size={24} />
                      </div>

                      {/* Score inputs */}
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          min={0}
                          max={99}
                          value={sc.home}
                          onChange={(e) => handleChange(match.id, "home", e.target.value)}
                          className="w-10 text-center font-bold bg-slate-800 border border-slate-600 rounded py-1.5 text-white focus:outline-none focus:border-green-500 text-sm"
                          placeholder="0"
                        />
                        <span className="text-slate-500">-</span>
                        <input
                          type="number"
                          min={0}
                          max={99}
                          value={sc.away}
                          onChange={(e) => handleChange(match.id, "away", e.target.value)}
                          className="w-10 text-center font-bold bg-slate-800 border border-slate-600 rounded py-1.5 text-white focus:outline-none focus:border-green-500 text-sm"
                          placeholder="0"
                        />
                      </div>

                      {/* Away */}
                      <div className="flex-1 flex items-center gap-1">
                        <Flag team={match.awayTeam} size={24} />
                        <span className="text-slate-200 text-xs">{match.awayTeam}</span>
                      </div>

                      {/* Buttons */}
                      <div className="flex gap-1">
                        <button
                          onClick={() => saveResult(match.id)}
                          disabled={isSaving}
                          className={`px-2 py-1.5 rounded text-xs font-medium transition-colors ${
                            isSaved
                              ? "bg-green-700 text-green-100"
                              : "bg-blue-700 hover:bg-blue-600 text-white"
                          }`}
                        >
                          {isSaving ? "..." : isSaved ? "✓" : hasResult ? "Actualizar" : "Guardar"}
                        </button>
                        {hasResult && (
                          <button
                            onClick={() => clearResult(match.id)}
                            disabled={isSaving}
                            className="px-2 py-1.5 rounded text-xs font-medium bg-red-800 hover:bg-red-700 text-white transition-colors"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    </div>

                    {err && <p className="text-red-400 text-xs mt-1 text-center">{err}</p>}
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
