"use client";

import { useState } from "react";
import { toast } from "sonner";
import type { UserItem } from "./users-table";

interface EditUserDialogProps {
  user: UserItem | null;
  currentUserId: number;
  onClose: () => void;
  onSuccess: () => void;
}

const ROLE_OPTIONS = [
  { value: "ADMIN", label: "ADMIN - Acceso completo" },
  { value: "USER", label: "USER - Transacciones y maestros" },
] as const;

// El componente se monta de nuevo con cada usuario (key en el padre), así el rol inicial siempre es el actual
export function EditUserDialog({ user, currentUserId, onClose, onSuccess }: EditUserDialogProps) {
  const [role, setRole] = useState<UserItem["role"]>(user?.role ?? "USER");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!user) return null;

  const isSelf = user.id === currentUserId;
  const unchanged = role === user.role;

  const handleClose = () => {
    if (!loading) onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch(`/api/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });

      const data = await res.json();

      if (!res.ok) {
        const msg = data.error || "Error al actualizar el usuario";
        setError(msg);
        toast.error(msg);
        setLoading(false);
        return;
      }

      toast.success(`Rol de ${user.email} actualizado a ${role}.`);
      setLoading(false);
      onClose();
      onSuccess();
    } catch (err) {
      console.error("Error updating user:", err);
      const msg = "Error de red al intentar actualizar el usuario.";
      setError(msg);
      toast.error(msg);
      setLoading(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="user-dialog-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div className="w-full max-w-md bg-stone-900 border border-stone-800 rounded-2xl shadow-2xl p-6 sm:p-8 text-stone-100">
        <div className="flex items-start justify-between pb-4 border-b border-stone-800 mb-6">
          <div>
            <h2 id="user-dialog-title" className="text-lg font-bold text-white leading-tight">
              Editar usuario
            </h2>
            <p className="text-xs text-stone-400 mt-0.5">{user.email}</p>
          </div>

          <button
            type="button"
            onClick={handleClose}
            disabled={loading}
            aria-label="Cerrar modal"
            className="text-stone-400 hover:text-white p-1 rounded-lg hover:bg-stone-800 transition"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {error && (
          <div
            role="alert"
            className="mb-5 p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs"
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-stone-300 mb-1.5" htmlFor="user-role">
              Rol
            </label>
            <select
              id="user-role"
              disabled={loading || isSelf}
              value={role}
              onChange={(e) => setRole(e.target.value as UserItem["role"])}
              className="w-full px-4 py-2.5 rounded-xl bg-stone-950/80 border border-stone-800 text-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition disabled:opacity-60"
            >
              {ROLE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <p className="text-[11px] text-stone-500 mt-1.5">
              {isSelf
                ? "No puedes cambiar tu propio rol."
                : "El usuario verá los cambios en el menú la próxima vez que inicie sesión."}
            </p>
          </div>

          <div className="pt-4 mt-6 border-t border-stone-800 flex items-center justify-end gap-3">
            <button
              type="button"
              disabled={loading}
              onClick={handleClose}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-stone-400 hover:text-white hover:bg-stone-800 transition"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={loading || unchanged}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 shadow-md shadow-orange-600/20 disabled:opacity-60 disabled:cursor-not-allowed transition"
            >
              {loading ? (
                <>
                  <svg className="animate-spin w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                  </svg>
                  <span>Guardando...</span>
                </>
              ) : (
                <span>Guardar cambios</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
