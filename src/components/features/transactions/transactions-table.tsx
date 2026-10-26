"use client";

import { useState } from "react";
import type { MovementType, TransactionItem } from "@/types/inventory";
import { formatDateTime, formatQuantity, formatReason, unitLabel } from "@/lib/formatters/inventory";

interface TransactionsTableProps {
  transactions: TransactionItem[];
  unit: string;
  loading: boolean;
}

const FILTERS: { label: string; value: MovementType | "ALL" }[] = [
  { label: "Todos", value: "ALL" },
  { label: "Entradas", value: "IN" },
  { label: "Salidas", value: "OUT" },
];

export function TransactionsTable({ transactions, unit, loading }: TransactionsTableProps) {
  const [filter, setFilter] = useState<MovementType | "ALL">("ALL");

  const filtered =
    filter === "ALL" ? transactions : transactions.filter((t) => t.type === filter);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="inline-flex rounded-lg bg-stone-900 border border-stone-800 p-0.5">
          {FILTERS.map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => setFilter(item.value)}
              className={`px-3 py-1.5 rounded-md text-[11px] font-semibold transition ${
                filter === item.value
                  ? "bg-stone-800 text-white"
                  : "text-stone-400 hover:text-white"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="text-xs text-stone-400 font-medium">
          Total: <span className="text-orange-400 font-bold">{filtered.length}</span> movimientos
        </div>
      </div>

      <div className="rounded-2xl bg-stone-900 border border-stone-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-stone-300">
            <thead className="bg-stone-950/70 border-b border-stone-800 text-stone-400 uppercase text-[10px] tracking-wider font-bold">
              <tr>
                <th className="py-3.5 px-4 sm:px-6">ID</th>
                <th className="py-3.5 px-4 sm:px-6">Fecha</th>
                <th className="py-3.5 px-4 sm:px-6">Tipo</th>
                <th className="py-3.5 px-4 sm:px-6 text-right">Cantidad</th>
                <th className="py-3.5 px-4 sm:px-6 text-right">Saldo</th>
                <th className="py-3.5 px-4 sm:px-6">Responsable</th>
                <th className="py-3.5 px-4 sm:px-6 hidden lg:table-cell">Motivo</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-stone-800/60 font-medium">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-stone-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <svg className="animate-spin w-5 h-5 text-orange-500" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                      </svg>
                      <span>Cargando movimientos...</span>
                    </div>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-stone-500">
                    No hay movimientos para mostrar.
                  </td>
                </tr>
              ) : (
                filtered.map((item) => {
                  const isIn = item.type === "IN";
                  return (
                    <tr key={item.id} className="hover:bg-stone-800/40 transition-colors">
                      <td className="py-3.5 px-4 sm:px-6 font-mono text-stone-400">#{item.id}</td>
                      <td className="py-3.5 px-4 sm:px-6 text-stone-300 whitespace-nowrap">
                        {formatDateTime(item.createdAt)}
                      </td>
                      <td className="py-3.5 px-4 sm:px-6">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-bold ${
                            isIn
                              ? "bg-amber-500/10 text-amber-300"
                              : "bg-red-500/10 text-red-400"
                          }`}
                        >
                          {isIn ? "Entrada" : "Salida"}
                        </span>
                      </td>
                      <td
                        className={`py-3.5 px-4 sm:px-6 text-right font-mono font-bold whitespace-nowrap ${
                          isIn ? "text-amber-300" : "text-red-400"
                        }`}
                      >
                        {isIn ? "+" : "−"}
                        {formatQuantity(item.quantity)} {unitLabel(unit)}
                      </td>
                      <td className="py-3.5 px-4 sm:px-6 text-right font-mono text-stone-200 whitespace-nowrap">
                        {formatQuantity(item.balanceAfter)}
                      </td>
                      <td className="py-3.5 px-4 sm:px-6 text-stone-200">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-orange-600/20 text-orange-400 flex items-center justify-center text-[10px] font-bold shrink-0">
                            {(item.createdBy?.name || "U").charAt(0).toUpperCase()}
                          </div>
                          <span className="truncate max-w-[140px]" title={item.createdBy?.email}>
                            {item.createdBy?.name || "Desconocido"}
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 sm:px-6 text-stone-400 hidden lg:table-cell">
                        {formatReason(item.reason)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
