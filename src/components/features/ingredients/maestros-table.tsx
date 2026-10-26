"use client";

import { useState } from "react";
import { formatIngredientName } from "@/lib/formatters/inventory";

export interface MaestroItem {
  id: number;
  name: string;
  unit: string;
  stock: string | number;
  status: string;
  createdAt: string;
  createdBy: {
    id: number;
    name: string;
    email: string;
  };
}

interface MaestrosTableProps {
  maestros: MaestroItem[];
  loading: boolean;
  isAdmin?: boolean;
  onToggleStatus?: (item: MaestroItem) => void;
}

export function MaestrosTable({
  maestros,
  loading,
  isAdmin = false,
  onToggleStatus,
}: MaestrosTableProps) {
  const [search, setSearch] = useState("");

  const filtered = maestros.filter(
    (m) =>
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.createdBy?.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="relative w-full sm:max-w-sm">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre o autor..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-stone-900 border border-stone-800 text-white placeholder-stone-500 text-xs focus:outline-none focus:ring-2 focus:ring-orange-500 transition"
          />
          <svg
            className="w-4 h-4 text-stone-500 absolute left-3.5 top-1/2 -translate-y-1/2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        <div className="text-xs text-stone-400 font-medium">
          Total: <span className="text-orange-400 font-bold">{filtered.length}</span> maestros
        </div>
      </div>

      {/* Table Card */}
      <div className="rounded-2xl bg-stone-900 border border-stone-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-stone-300">
            <thead className="bg-stone-950/70 border-b border-stone-800 text-stone-400 uppercase text-[10px] tracking-wider font-bold">
              <tr>
                <th className="py-3.5 px-4 sm:px-6">ID Material</th>
                <th className="py-3.5 px-4 sm:px-6">Nombre del Maestro</th>
                <th className="py-3.5 px-4 sm:px-6 text-right">Saldo del Maestro</th>
                <th className="py-3.5 px-4 sm:px-6">Unidad</th>
                <th className="py-3.5 px-4 sm:px-6">Estado</th>
                <th className="py-3.5 px-4 sm:px-6">Creado Por</th>
                <th className="py-3.5 px-4 sm:px-6 text-right">Fecha Creación</th>
                {isAdmin && <th className="py-3.5 px-4 sm:px-6 text-right">Acciones</th>}
              </tr>
            </thead>

            <tbody className="divide-y divide-stone-800/60 font-medium">
              {loading ? (
                <tr>
                  <td colSpan={isAdmin ? 8 : 7} className="py-12 text-center text-stone-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <svg className="animate-spin w-5 h-5 text-orange-500" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                      </svg>
                      <span>Cargando inventario de maestros...</span>
                    </div>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={isAdmin ? 8 : 7} className="py-12 text-center text-stone-500">
                    No se encontraron maestros registrados.
                  </td>
                </tr>
              ) : (
                filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-stone-800/40 transition-colors">
                    <td className="py-3.5 px-4 sm:px-6 font-mono text-stone-400">
                      #{item.id}
                    </td>

                    <td className="py-3.5 px-4 sm:px-6 font-bold text-white whitespace-nowrap">
                      {formatIngredientName(item.name)}
                    </td>

                    <td className="py-3.5 px-4 sm:px-6 text-right font-mono font-bold text-orange-400 whitespace-nowrap">
                      {typeof item.stock === "number"
                        ? item.stock.toFixed(3)
                        : Number(item.stock).toFixed(3)}
                    </td>

                    <td className="py-3.5 px-4 sm:px-6 whitespace-nowrap">
                      <span className="inline-block px-2 py-0.5 rounded-md bg-stone-800 text-[10px] font-bold text-stone-300">
                        {item.unit}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 sm:px-6 whitespace-nowrap">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-bold ${
                          item.status === "ACTIVE"
                            ? "bg-orange-500/15 text-orange-400 border border-orange-500/30"
                            : "bg-stone-800 text-stone-400 border border-stone-700/60"
                        }`}
                      >
                        {item.status === "ACTIVE" ? "Activo" : "Inactivo"}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 sm:px-6 text-stone-200 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-orange-600/20 text-orange-400 flex items-center justify-center text-[10px] font-bold">
                          {(item.createdBy?.name || "U").charAt(0).toUpperCase()}
                        </div>
                        <span className="truncate max-w-[140px]" title={item.createdBy?.name}>
                          {item.createdBy?.name || "Desconocido"}
                        </span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 sm:px-6 text-right text-stone-400 font-mono text-[11px] whitespace-nowrap">
                      {new Date(item.createdAt).toLocaleDateString("es-CO", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </td>

                    {isAdmin && (
                      <td className="py-3.5 px-4 sm:px-6 text-right whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => onToggleStatus?.(item)}
                          className="px-2.5 py-1 rounded-lg text-[11px] font-semibold text-stone-300 hover:text-white bg-stone-800 hover:bg-stone-700 transition"
                        >
                          {item.status === "ACTIVE" ? "Desactivar" : "Activar"}
                        </button>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
