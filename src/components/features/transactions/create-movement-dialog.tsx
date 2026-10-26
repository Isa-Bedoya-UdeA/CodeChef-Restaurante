"use client";

import { useState } from "react";
import { toast } from "sonner";
import type { IngredientSummary, MovementType } from "@/types/inventory";
import { formatIngredientName, formatQuantity, unitLabel } from "@/lib/formatters/inventory";

interface CreateMovementDialogProps {
  isOpen: boolean;
  ingredient: IngredientSummary | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function CreateMovementDialog({
  isOpen,
  ingredient,
  onClose,
  onSuccess,
}: CreateMovementDialogProps) {
  const [type, setType] = useState<MovementType>("IN");
  const [quantity, setQuantity] = useState("");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !ingredient) return null;

  const quantityNum = parseFloat(quantity);
  const hasQuantity = !isNaN(quantityNum) && quantityNum > 0;
  const projectedBalance = hasQuantity
    ? ingredient.stock + (type === "IN" ? quantityNum : -quantityNum)
    : ingredient.stock;

  const resetAndClose = () => {
    setType("IN");
    setQuantity("");
    setReason("");
    setError(null);
    onClose();
  };

  const handleClose = () => {
    if (!loading) resetAndClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!hasQuantity) {
      setError("La cantidad debe ser un número mayor que 0.");
      return;
    }

    if (type === "OUT" && quantityNum > ingredient.stock) {
      setError(
        `No hay saldo suficiente. Disponible: ${formatQuantity(ingredient.stock)} ${unitLabel(ingredient.unit)}.`
      );
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ingredientId: ingredient.id,
          type,
          quantity: quantityNum,
          reason: reason.trim() || null,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        const msg = data.error || "Error al registrar el movimiento";
        setError(msg);
        toast.error(msg);
        setLoading(false);
        return;
      }

      toast.success(
        `${type === "IN" ? "Entrada" : "Salida"} de ${formatQuantity(quantityNum)} ${unitLabel(ingredient.unit)} registrada en "${formatIngredientName(ingredient.name)}".`
      );
      setLoading(false);
      resetAndClose();
      onSuccess();
    } catch (err) {
      console.error("Error creating movement:", err);
      const msg = "Error de red al intentar registrar el movimiento.";
      setError(msg);
      toast.error(msg);
      setLoading(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="movement-dialog-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div className="w-full max-w-lg bg-stone-900 border border-stone-800 rounded-2xl shadow-2xl p-6 sm:p-8 text-stone-100">
        <div className="flex items-start justify-between pb-4 border-b border-stone-800 mb-6">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-stone-500">
              Agregar movimiento
            </p>
            <h2 id="movement-dialog-title" className="text-lg font-bold text-white leading-tight">
              {formatIngredientName(ingredient.name)}
            </h2>
            <p className="text-xs text-stone-400 mt-0.5">
              Saldo actual: {formatQuantity(ingredient.stock)} {unitLabel(ingredient.unit)}
            </p>
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
          <fieldset>
            <legend className="block text-xs font-semibold text-stone-300 mb-1.5">
              Tipo de movimiento
            </legend>
            <div className="grid grid-cols-2 gap-2">
              {(["IN", "OUT"] as const).map((option) => {
                const selected = type === option;
                const isIn = option === "IN";
                return (
                  <button
                    key={option}
                    type="button"
                    disabled={loading}
                    aria-pressed={selected}
                    onClick={() => {
                      setType(option);
                      setError(null);
                    }}
                    className={`py-2.5 rounded-xl border text-sm font-semibold transition ${
                      selected
                        ? isIn
                          ? "bg-amber-500/10 border-amber-500/50 text-amber-300"
                          : "bg-red-500/10 border-red-500/50 text-red-400"
                        : "bg-stone-950/80 border-stone-800 text-stone-400 hover:text-white"
                    }`}
                  >
                    {isIn ? "Entrada" : "Salida"}
                  </button>
                );
              })}
            </div>
          </fieldset>

          <div>
            <label className="block text-xs font-semibold text-stone-300 mb-1.5" htmlFor="movement-quantity">
              Cantidad ({unitLabel(ingredient.unit)})
            </label>
            <input
              id="movement-quantity"
              type="number"
              step="0.001"
              min="0.001"
              required
              disabled={loading}
              value={quantity}
              onChange={(e) => {
                setQuantity(e.target.value);
                setError(null);
              }}
              placeholder="0"
              className="w-full px-4 py-2.5 rounded-xl bg-stone-950/80 border border-stone-800 text-white placeholder-stone-500 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-300 mb-1.5" htmlFor="movement-reason">
              Motivo (opcional)
            </label>
            <input
              id="movement-reason"
              type="text"
              maxLength={200}
              disabled={loading}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Ej. Compra a proveedor, consumo del día, merma..."
              className="w-full px-4 py-2.5 rounded-xl bg-stone-950/80 border border-stone-800 text-white placeholder-stone-500 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition"
            />
          </div>

          <div className="flex items-center justify-between rounded-xl bg-stone-950/60 border border-stone-800 px-4 py-3 text-xs">
            <span className="text-stone-400">Saldo después del movimiento</span>
            <span
              className={`font-mono font-bold ${
                projectedBalance < 0 ? "text-red-400" : "text-orange-400"
              }`}
            >
              {formatQuantity(projectedBalance)} {unitLabel(ingredient.unit)}
            </span>
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
                  <span>Guardando...</span>
                </>
              ) : (
                <span>Crear movimiento</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
