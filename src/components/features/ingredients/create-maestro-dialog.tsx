"use client";

import { useState } from "react";
import { toast } from "sonner";

interface CreateMaestroDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function CreateMaestroDialog({
  isOpen,
  onClose,
  onSuccess,
}: CreateMaestroDialogProps) {
  const [name, setName] = useState("");
  const [unit, setUnit] = useState<"KG" | "G" | "ML" | "L" | "UNITS">("UNITS");
  const [initialStock, setInitialStock] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleClose = () => {
    if (loading) return;
    setName("");
    setInitialStock("");
    setUnit("UNITS");
    setError(null);
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Por favor ingresa el nombre del maestro.");
      return;
    }

    const stockNum = parseFloat(initialStock);
    if (isNaN(stockNum) || stockNum < 0) {
      setError("El saldo inicial debe ser un número igual o superior a 0.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/ingredients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          unit,
          initialStock: stockNum,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        const msg = data.error || "Error al crear el maestro";
        setError(msg);
        toast.error(msg);
        setLoading(false);
        return;
      }

      toast.success(`Maestro "${name.trim()}" creado exitosamente.`);
      handleClose();
      onSuccess();
    } catch (err) {
      console.error("Error creating maestro:", err);
      const msg = "Error de red al intentar crear el maestro.";
      setError(msg);
      toast.error(msg);
      setLoading(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="dialog-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div className="w-full max-w-lg bg-stone-900 border border-stone-800 rounded-2xl shadow-2xl p-6 sm:p-8 text-stone-100">
        <div className="flex items-center justify-between pb-4 border-b border-stone-800 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500/10 text-orange-400 flex items-center justify-center text-xl">
              📦
            </div>
            <div>
              <h2 id="dialog-title" className="text-lg font-bold text-white leading-tight">
                Agregar Maestro
              </h2>
              <p className="text-xs text-stone-400">Registrar nuevo insumo o material de inventario</p>
            </div>
          </div>

          <button
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
            className="mb-5 p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-start gap-2.5"
          >
            <svg className="w-4 h-4 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-stone-300 mb-1.5" htmlFor="maestro-name">
              Nombre del Maestro
            </label>
            <input
              id="maestro-name"
              type="text"
              required
              disabled={loading}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej. Carne de hamburguesa, Pan brioche, Tomate..."
              className="w-full px-4 py-2.5 rounded-xl bg-stone-950/80 border border-stone-800 text-white placeholder-stone-500 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-1.5" htmlFor="maestro-unit">
                Unidad de Medida
              </label>
              <select
                id="maestro-unit"
                disabled={loading}
                value={unit}
                onChange={(e) => setUnit(e.target.value as "KG" | "G" | "ML" | "L" | "UNITS")}
                className="w-full px-4 py-2.5 rounded-xl bg-stone-950/80 border border-stone-800 text-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition"
              >
                <option value="UNITS">Unidades (UNITS)</option>
                <option value="KG">Kilogramos (KG)</option>
                <option value="G">Gramos (G)</option>
                <option value="L">Litros (L)</option>
                <option value="ML">Mililitros (ML)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-1.5" htmlFor="maestro-stock">
                Saldo Inicial del Maestro
              </label>
              <input
                id="maestro-stock"
                type="number"
                step="0.001"
                min="0"
                required
                disabled={loading}
                value={initialStock}
                onChange={(e) => setInitialStock(e.target.value)}
                placeholder="0.000"
                className="w-full px-4 py-2.5 rounded-xl bg-stone-950/80 border border-stone-800 text-white placeholder-stone-500 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition"
              />
            </div>
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
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 shadow-md shadow-orange-600/20 disabled:opacity-60 disabled:cursor-not-allowed transition"
            >
              {loading ? (
                <>
                  <svg className="animate-spin w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                  </svg>
                  <span>Creando movimiento...</span>
                </>
              ) : (
                <span>Crear Maestro</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
