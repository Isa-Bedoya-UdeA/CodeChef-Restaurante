"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import type { IngredientSummary, IngredientTransactions } from "@/types/inventory";
import { formatDateTime, formatIngredientName, formatQuantity, unitLabel } from "@/lib/formatters/inventory";
import { TransactionsTable } from "./transactions-table";
import { BalanceChart } from "./balance-chart";
import { CreateMovementDialog } from "./create-movement-dialog";

interface IngredientResponse {
  id: number;
  name: string;
  unit: string;
  stock: string | number;
  status: string;
}

export function TransactionsView() {
  const [ingredients, setIngredients] = useState<IngredientSummary[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [data, setData] = useState<IngredientTransactions | null>(null);
  const [loadingIngredients, setLoadingIngredients] = useState(true);
  const [loadingData, setLoadingData] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    let isCancelled = false;

    async function loadIngredients() {
      try {
        const res = await fetch("/api/ingredients");
        if (!res.ok) throw new Error("No se pudieron cargar los maestros");
        const list: IngredientResponse[] = await res.json();
        if (isCancelled) return;

        const mapped = list.map((item) => ({ ...item, stock: Number(item.stock) }));
        setIngredients(mapped);
        setSelectedId(mapped[0]?.id ?? null);
      } catch (err) {
        if (!isCancelled) {
          console.error("Error loading ingredients:", err);
          toast.error("No se pudieron cargar los maestros.");
        }
      } finally {
        if (!isCancelled) setLoadingIngredients(false);
      }
    }

    loadIngredients();
    return () => {
      isCancelled = true;
    };
  }, []);

  useEffect(() => {
    if (selectedId === null) return;
    const controller = new AbortController();

    async function loadTransactions() {
      setLoadingData(true);
      try {
        const res = await fetch(`/api/transactions?ingredientId=${selectedId}`, {
          signal: controller.signal,
        });
        const body = await res.json();
        if (!res.ok) throw new Error(body.error || "Error al cargar los movimientos");

        setData(body);
        // Mantiene el saldo del dropdown sincronizado con el último movimiento
        setIngredients((prev) =>
          prev.map((item) =>
            item.id === body.ingredient.id ? { ...item, stock: body.ingredient.stock } : item
          )
        );
      } catch (err) {
        if (controller.signal.aborted) return;
        console.error("Error loading transactions:", err);
        toast.error(err instanceof Error ? err.message : "Error al cargar los movimientos");
        setData(null);
      } finally {
        if (!controller.signal.aborted) setLoadingData(false);
      }
    }

    loadTransactions();
    return () => controller.abort();
  }, [selectedId, reloadKey]);

  const current = data && data.ingredient.id === selectedId ? data : null;
  const ingredient = current?.ingredient ?? ingredients.find((i) => i.id === selectedId) ?? null;

  const totals = useMemo(() => {
    const list = current?.transactions ?? [];
    return list.reduce(
      (acc, t) => {
        if (t.type === "IN") acc.in += t.quantity;
        else acc.out += t.quantity;
        return acc;
      },
      { in: 0, out: 0 }
    );
  }, [current]);

  const lastMovement = current?.transactions[0];
  const unit = ingredient?.unit ?? "";
  const canAddMovement = !!ingredient && ingredient.status === "ACTIVE";

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 pb-6 border-b border-stone-800">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-[11px] font-semibold mb-1">
            <span>Movimientos de Inventario</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white">Gestión de Transacciones</h1>
          <p className="text-xs text-stone-400 mt-1">
            Consulta las entradas y salidas de cada maestro y la evolución de su saldo.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 sm:items-end">
          <div className="min-w-[240px]">
            <label htmlFor="ingredient-select" className="block text-[11px] font-semibold text-stone-400 mb-1.5">
              Maestro
            </label>
            <select
              id="ingredient-select"
              disabled={loadingIngredients || ingredients.length === 0}
              value={selectedId ?? ""}
              onChange={(e) => setSelectedId(Number(e.target.value))}
              className="w-full px-4 py-2.5 rounded-xl bg-stone-900 border border-stone-800 text-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 transition disabled:opacity-60"
            >
              {loadingIngredients && <option value="">Cargando maestros...</option>}
              {!loadingIngredients && ingredients.length === 0 && (
                <option value="">No hay maestros registrados</option>
              )}
              {ingredients.map((item) => (
                <option key={item.id} value={item.id}>
                  {formatIngredientName(item.name)} ({unitLabel(item.unit)})
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            disabled={!canAddMovement}
            onClick={() => setIsDialogOpen(true)}
            title={ingredient && !canAddMovement ? "El maestro está inactivo" : undefined}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 shadow-md shadow-orange-600/20 active:scale-95 transition disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>Agregar movimiento</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <SummaryCard
          label="Saldo actual"
          value={ingredient ? `${formatQuantity(ingredient.stock)} ${unitLabel(unit)}` : "—"}
          accent="text-orange-400"
        />
        <SummaryCard
          label="Total entradas"
          value={current ? `+${formatQuantity(totals.in)}` : "—"}
          accent="text-amber-400"
        />
        <SummaryCard
          label="Total salidas"
          value={current ? `−${formatQuantity(totals.out)}` : "—"}
          accent="text-red-400"
        />
        <SummaryCard
          label="Último movimiento"
          value={lastMovement ? formatDateTime(lastMovement.createdAt) : "—"}
          accent="text-stone-200"
          small
        />
      </div>

      <BalanceChart points={current?.dailyBalances ?? []} unit={unit} />

      <TransactionsTable
        transactions={current?.transactions ?? []}
        unit={unit}
        loading={loadingIngredients || loadingData}
      />

      <CreateMovementDialog
        isOpen={isDialogOpen}
        ingredient={ingredient}
        onClose={() => setIsDialogOpen(false)}
        onSuccess={() => setReloadKey((key) => key + 1)}
      />
    </div>
  );
}

interface SummaryCardProps {
  label: string;
  value: string;
  accent: string;
  small?: boolean;
}

function SummaryCard({ label, value, accent, small }: SummaryCardProps) {
  return (
    <div className="rounded-2xl bg-stone-900 border border-stone-800 p-4">
      <p className="text-[10px] uppercase tracking-wider font-bold text-stone-500">{label}</p>
      <p className={`mt-1 font-mono font-bold ${accent} ${small ? "text-xs" : "text-lg"}`}>{value}</p>
    </div>
  );
}
