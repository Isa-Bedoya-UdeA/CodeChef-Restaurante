import Link from "next/link";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function LandingPage() {
  const session = await auth();

  // Si ya tiene sesión iniciada, redirigir directamente al panel
  if (session?.user) {
    redirect("/dashboard/transactions");
  }

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col justify-between selection:bg-orange-500 selection:text-white">
      {/* Top Navbar */}
      <header className="border-b border-stone-850 px-6 sm:px-12 h-20 flex items-center justify-between backdrop-blur-md sticky top-0 z-20 bg-stone-950/80">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-orange-600 to-amber-500 flex items-center justify-center font-black text-white text-xl shadow-lg shadow-orange-600/30">
            🔥
          </div>
          <div>
            <span className="font-extrabold text-lg tracking-tight text-white block">CodeChef</span>
            <span className="text-[11px] text-stone-400 block -mt-1 font-medium">Restaurante & Inventario</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Link
            href="/login"
            className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-orange-600 hover:bg-orange-500 shadow-lg shadow-orange-600/25 transition-all duration-200 active:scale-95"
          >
            Iniciar sesión
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 max-w-6xl mx-auto px-6 sm:px-12 py-16 sm:py-24 flex flex-col items-center justify-center text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-semibold mb-8 animate-pulse">
          <span>Sistema Integral de Gestión de Restaurante</span>
          <span className="text-orange-500">✦</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white max-w-4xl leading-[1.15]">
          Control total de tus <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-300">Maestros, Inventario</span> y Pedidos
        </h1>

        <p className="mt-6 text-lg sm:text-xl text-stone-300 max-w-2xl font-normal leading-relaxed">
          Plataforma administrativa diseñada para sincronizar pedidos, recetas, transacciones de almacén y control de roles en tiempo real.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center gap-4">
          <Link
            href="/login"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl text-base font-bold text-white bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 shadow-xl shadow-orange-600/30 transition-all duration-200 active:scale-95"
          >
            <span>Acceder al Sistema</span>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </Link>
        </div>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-20 w-full text-left">
          <div className="p-6 rounded-2xl bg-stone-900/60 border border-stone-800/80 hover:border-orange-500/40 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-orange-500/10 text-orange-400 flex items-center justify-center text-2xl mb-4">
              📊
            </div>
            <h2 className="text-lg font-bold text-white mb-2">Transacciones en Vivo</h2>
            <p className="text-sm text-stone-400 leading-relaxed">
              Registro inmediato de entradas y salidas con saldo resultante automático y gráficos de saldos diarios.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-stone-900/60 border border-stone-800/80 hover:border-orange-500/40 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center text-2xl mb-4">
              📦
            </div>
            <h2 className="text-lg font-bold text-white mb-2">Gestión de Maestros</h2>
            <p className="text-sm text-stone-400 leading-relaxed">
              Control de insumos e ingredientes por unidad con trazabilidad de autor y stock disponible.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-stone-900/60 border border-stone-800/80 hover:border-orange-500/40 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-orange-500/10 text-orange-400 flex items-center justify-center text-2xl mb-4">
              🛡️
            </div>
            <h2 className="text-lg font-bold text-white mb-2">Roles Diferenciados</h2>
            <p className="text-sm text-stone-400 leading-relaxed">
              Permisos granulares para Administradores y Usuarios estándar según las políticas del negocio.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-stone-900 py-6 px-6 text-center text-xs text-stone-500">
        Proyecto Evaluativo Ingeniería Web — Grupo CodeChef © 2026
      </footer>
    </div>
  );
}
