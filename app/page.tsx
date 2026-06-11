import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function Home() {
  const session = await getServerSession(authOptions);

  if (session) {
    redirect("/fixture");
  }

  return (
    <div className="min-h-[calc(100vh-8rem)] flex flex-col items-center justify-center px-4">
      {/* Hero */}
      <div className="text-center max-w-2xl mx-auto">
        <div className="text-7xl mb-6">⚽</div>
        <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
          Prode{" "}
          <span className="text-green-400">Mundial 2026</span>
        </h1>
        <p className="text-slate-400 text-lg mb-2">
          FIFA World Cup 2026 &mdash; USA · Canada · Mexico
        </p>
        <p className="text-slate-500 mb-10">
          Predecí los resultados, sumá puntos y competí contra tus amigos.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/register"
            className="px-8 py-4 bg-green-600 hover:bg-green-500 text-white font-bold rounded-xl text-lg transition-colors shadow-lg shadow-green-900/30"
          >
            Crear cuenta
          </Link>
          <Link
            href="/login"
            className="px-8 py-4 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-xl text-lg transition-colors"
          >
            Iniciar sesión
          </Link>
        </div>
      </div>

      {/* Points system */}
      <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl w-full">
        <div className="bg-[#0d1f38] border border-slate-700 rounded-xl p-5 text-center">
          <div className="text-3xl font-bold text-yellow-400 mb-1">3 pts</div>
          <div className="text-slate-300 font-medium">Resultado Exacto</div>
          <div className="text-slate-500 text-sm mt-1">Acertás el marcador</div>
        </div>
        <div className="bg-[#0d1f38] border border-slate-700 rounded-xl p-5 text-center">
          <div className="text-3xl font-bold text-blue-400 mb-1">1 pt</div>
          <div className="text-slate-300 font-medium">Resultado Correcto</div>
          <div className="text-slate-500 text-sm mt-1">Acertás quién gana o empata</div>
        </div>
        <div className="bg-[#0d1f38] border border-slate-700 rounded-xl p-5 text-center">
          <div className="text-3xl font-bold text-slate-500 mb-1">0 pts</div>
          <div className="text-slate-300 font-medium">Fallaste</div>
          <div className="text-slate-500 text-sm mt-1">A la próxima</div>
        </div>
      </div>
    </div>
  );
}
