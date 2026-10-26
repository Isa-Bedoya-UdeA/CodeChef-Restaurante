"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { MaestrosTable, type MaestroItem } from "./maestros-table";
import { CreateMaestroDialog } from "./create-maestro-dialog";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";

interface MaestrosViewProps {
  userRole?: string;
  initialData?: MaestroItem[];
}

export function MaestrosView({ userRole, initialData = [] }: MaestrosViewProps) {
  const [maestros, setMaestros] = useState<MaestroItem[]>(initialData);
  const [loading, setLoading] = useState(initialData.length === 0);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [statusTarget, setStatusTarget] = useState<MaestroItem | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const isAdmin = userRole === "ADMIN";

  const refreshData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/ingredients");
      if (res.ok) {
        const data = await res.json();
        setMaestros(data);
      }
    } catch (err) {
      console.error("Error refreshing maestros:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let isCancelled = false;

    async function loadInitial() {
      try {
        const res = await fetch("/api/ingredients");
        if (res.ok && !isCancelled) {
          const data = await res.json();
          setMaestros(data);
        }
      } catch (err) {
        if (!isCancelled) {
          console.error("Error loading maestros:", err);
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    }

    if (initialData.length === 0) {
      loadInitial();
    }

    return () => {
      isCancelled = true;
    };
  }, [initialData.length]);

  const handleConfirmToggleStatus = async () => {
    if (!statusTarget) return;
    const nextStatus = statusTarget.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    setIsUpdatingStatus(true);

    try {
      const res = await fetch(`/api/ingredients/${statusTarget.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });

      const body = await res.json();
      if (!res.ok) {
        throw new Error(body.error || "Error al actualizar el estado");
      }

      toast.success(
        nextStatus === "ACTIVE"
          ? `Maestro "${statusTarget.name}" activado correctamente`
          : `Maestro "${statusTarget.name}" desactivado correctamente`
      );
      setStatusTarget(null);
      await refreshData();
    } catch (err) {
      console.error("Error toggling status:", err);
      toast.error(err instanceof Error ? err.message : "Error al actualizar el estado");
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-stone-850">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-[11px] font-semibold mb-1">
            <span>Almacén de Materias Primas</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white">
            Gestión de Maestros
          </h1>
          <p className="text-xs text-stone-400 mt-1">
            Visualización y control de inventario de los materiales del restaurante.
          </p>
        </div>

        {/* Botón de Agregar Maestro: REGLA RÚBRICA -> Sólo visible para rol ADMIN */}
        {isAdmin && (
          <button
            type="button"
            onClick={() => setIsDialogOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 shadow-md shadow-orange-600/20 active:scale-95 transition"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>Agregar Maestro</span>
          </button>
        )}
      </div>

      {/* Table */}
      <MaestrosTable
        maestros={maestros}
        loading={loading}
        isAdmin={isAdmin}
        onToggleStatus={setStatusTarget}
      />

      {/* Modal Dialog for creating maestro */}
      {isAdmin && (
        <CreateMaestroDialog
          isOpen={isDialogOpen}
          onClose={() => setIsDialogOpen(false)}
          onSuccess={refreshData}
        />
      )}

      {/* Confirmation Dialog for Toggling Status */}
      <ConfirmDialog
        isOpen={statusTarget !== null}
        title={
          statusTarget?.status === "ACTIVE"
            ? `¿Desactivar maestro "${statusTarget?.name}"?`
            : `¿Activar maestro "${statusTarget?.name}"?`
        }
        description={
          statusTarget?.status === "ACTIVE"
            ? "Al desactivar este ingrediente maestro, no se podrán registrar nuevos movimientos de entrada o salida hasta que sea activado nuevamente."
            : "Al activar este ingrediente maestro, volverá a estar disponible para registrar movimientos de inventario."
        }
        confirmLabel={statusTarget?.status === "ACTIVE" ? "Sí, desactivar" : "Sí, activar"}
        variant={statusTarget?.status === "ACTIVE" ? "danger" : "primary"}
        isLoading={isUpdatingStatus}
        onConfirm={handleConfirmToggleStatus}
        onClose={() => setStatusTarget(null)}
      />
    </div>
  );
}
