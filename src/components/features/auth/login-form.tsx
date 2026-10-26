"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await signIn("credentials", {
        email: email.trim().toLowerCase(),
        password,
        redirect: false,
      });

      if (res?.error) {
        setError("Credenciales inválidas. Por favor verifica tu correo y contraseña.");
        toast.error("Error al iniciar sesión. Revisa tus credenciales.");
        setLoading(false);
      } else {
        toast.success("¡Bienvenido! Accediendo al sistema...");
        router.push("/dashboard/transactions");
        router.refresh();
      }
    } catch (err) {
      console.error("Login submit error:", err);
      setError("Ocurrió un error inesperado al intentar iniciar sesión.");
      toast.error("Error de conexión al servidor.");
      setLoading(false);
    }
  };

  const setCredentials = (userEmail: string, userPass: string) => {
    setEmail(userEmail);
    setPassword(userPass);
    setError(null);
  };

  return (
    <div className="w-full max-w-md bg-stone-900/90 border border-stone-800 rounded-2xl shadow-2xl p-6 sm:p-8 backdrop-blur-md">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-tr from-orange-600 to-amber-500 flex items-center justify-center font-black text-white text-2xl shadow-lg shadow-orange-600/30 mb-4">
          🔥
        </div>
        <h1 className="text-2xl font-black tracking-tight text-white">Iniciar Sesión</h1>
        <p className="text-sm text-stone-400 mt-1">
          Ingresa al panel administrativo de CodeChef
        </p>
      </div>

      {/* Error Alert */}
      {error && (
        <div
          role="alert"
          className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-start gap-3"
        >
          <svg className="w-4 h-4 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-stone-300 mb-1.5" htmlFor="email">
            Correo Electrónico
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@codechef.com"
            className="w-full px-4 py-2.5 rounded-xl bg-stone-950/70 border border-stone-800 text-white placeholder-stone-500 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-stone-300 mb-1.5" htmlFor="password">
            Contraseña
          </label>
          <input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full px-4 py-2.5 rounded-xl bg-stone-950/70 border border-stone-800 text-white placeholder-stone-500 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full mt-2 py-3 px-4 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50 shadow-lg shadow-orange-600/20 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200 active:scale-98 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <svg className="animate-spin w-4 h-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
              </svg>
              <span>Validando credenciales...</span>
            </>
          ) : (
            <span>Entrar al sistema</span>
          )}
        </button>
      </form>

      {/* Quick Credentials Helpers */}
      <div className="mt-8 pt-6 border-t border-stone-800">
        <p className="text-[11px] font-semibold text-stone-400 mb-3 text-center uppercase tracking-wider">
          Cuentas de prueba del sistema
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={() => setCredentials("admin@codechef.com", "admin123")}
            className="p-3 rounded-xl bg-stone-800/60 hover:bg-stone-800 border border-stone-700/60 text-left transition-colors flex flex-col gap-1 focus:outline-none focus:ring-1 focus:ring-orange-500"
          >
            <span className="text-xs font-bold text-orange-400 w-fit px-2 py-0.5 rounded-md bg-orange-500/10 border border-orange-500/20">
              ADMIN
            </span>
            <p className="text-[11px] text-stone-400 font-mono">
              Contraseña: <span className="text-stone-200 font-semibold">admin123</span>
            </p>
            <p className="text-xs text-stone-300 break-all">
              admin@codechef.com
            </p>
          </button>

          <button
            type="button"
            onClick={() => setCredentials("laura@codechef.com", "cliente123")}
            className="p-3 rounded-xl bg-stone-800/60 hover:bg-stone-800 border border-stone-700/60 text-left transition-colors flex flex-col gap-1 focus:outline-none focus:ring-1 focus:ring-amber-500"
          >
            <span className="text-xs font-bold text-amber-400 w-fit px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/20">
              USER
            </span>
            <p className="text-[11px] text-stone-400 font-mono">
              Contraseña: <span className="text-stone-200 font-semibold">cliente123</span>
            </p>
            <p className="text-xs text-stone-300 break-all">
              laura@codechef.com
            </p>
          </button>
        </div>
      </div>
    </div>
  );
}
