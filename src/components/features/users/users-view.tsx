"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { UsersTable, type UserItem } from "./users-table";
import { EditUserDialog } from "./edit-user-dialog";

interface UsersViewProps {
  currentUserId: number;
  initialData?: UserItem[];
}

export function UsersView({ currentUserId, initialData = [] }: UsersViewProps) {
  const [users, setUsers] = useState<UserItem[]>(initialData);
  const [loading, setLoading] = useState(initialData.length === 0);
  const [reloadKey, setReloadKey] = useState(0);
  const [editing, setEditing] = useState<UserItem | null>(null);

  useEffect(() => {
    if (reloadKey === 0 && initialData.length > 0) return;
    let isCancelled = false;

    async function loadUsers() {
      try {
        const res = await fetch("/api/users");
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Error al cargar los usuarios");
        if (!isCancelled) setUsers(data);
      } catch (err) {
        if (!isCancelled) {
          console.error("Error loading users:", err);
          toast.error(err instanceof Error ? err.message : "Error al cargar los usuarios");
        }
      } finally {
        if (!isCancelled) setLoading(false);
      }
    }

    loadUsers();
    return () => {
      isCancelled = true;
    };
  }, [reloadKey, initialData.length]);

  const adminCount = users.filter((u) => u.role === "ADMIN").length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 pb-6 border-b border-stone-800">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-[11px] font-semibold mb-1">
            <span>Solo administradores</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white">Gestión de Usuarios</h1>
          <p className="text-xs text-stone-400 mt-1">
            Consulta las cuentas del sistema y asigna el rol de cada usuario.
          </p>
        </div>

        <div className="flex gap-2 text-[11px] font-semibold">
          <span className="px-3 py-1.5 rounded-lg bg-orange-500/10 text-orange-400">
            {adminCount} ADMIN
          </span>
          <span className="px-3 py-1.5 rounded-lg bg-stone-800 text-stone-300 border border-stone-700/60">
            {users.length - adminCount} USER
          </span>
        </div>
      </div>

      <UsersTable
        users={users}
        loading={loading}
        currentUserId={currentUserId}
        onEdit={setEditing}
      />

      <EditUserDialog
        key={editing?.id ?? "closed"}
        user={editing}
        currentUserId={currentUserId}
        onClose={() => setEditing(null)}
        onSuccess={() => setReloadKey((key) => key + 1)}
      />
    </div>
  );
}
