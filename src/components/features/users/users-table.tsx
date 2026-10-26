"use client";

import { useState } from "react";

export interface UserItem {
  id: number;
  name: string;
  email: string;
  role: "ADMIN" | "USER";
  photo: string | null;
  createdAt: string;
}

interface UsersTableProps {
  users: UserItem[];
  loading: boolean;
  currentUserId: number;
  onEdit: (user: UserItem) => void;
}

const dateFormatter = new Intl.DateTimeFormat("es-CO", {
  timeZone: "America/Bogota",
  year: "numeric",
  month: "short",
  day: "numeric",
});

export function UsersTable({ users, loading, currentUserId, onEdit }: UsersTableProps) {
  const [search, setSearch] = useState("");

  const term = search.trim().toLowerCase();
  const filtered = users.filter(
    (u) => u.name.toLowerCase().includes(term) || u.email.toLowerCase().includes(term)
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="relative w-full max-w-sm">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre o correo..."
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

        <div className="text-xs text-stone-400 font-medium whitespace-nowrap">
          Total: <span className="text-orange-400 font-bold">{filtered.length}</span> usuarios
        </div>
      </div>

      <div className="rounded-2xl bg-stone-900 border border-stone-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-stone-300">
            <thead className="bg-stone-950/70 border-b border-stone-800 text-stone-400 uppercase text-[10px] tracking-wider font-bold">
              <tr>
                <th className="py-3.5 px-4 sm:px-6">ID</th>
                <th className="py-3.5 px-4 sm:px-6">Usuario</th>
                <th className="py-3.5 px-4 sm:px-6">Correo</th>
                <th className="py-3.5 px-4 sm:px-6">Rol</th>
                <th className="py-3.5 px-4 sm:px-6">Fecha de creación</th>
                <th className="py-3.5 px-4 sm:px-6 text-right">Acciones</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-stone-800/60 font-medium">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-stone-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <svg className="animate-spin w-5 h-5 text-orange-500" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                      </svg>
                      <span>Cargando usuarios...</span>
                    </div>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-stone-500">
                    No se encontraron usuarios.
                  </td>
                </tr>
              ) : (
                filtered.map((user) => (
                  <tr key={user.id} className="hover:bg-stone-800/40 transition-colors">
                    <td className="py-3.5 px-4 sm:px-6 font-mono text-stone-400">#{user.id}</td>
                    <td className="py-3.5 px-4 sm:px-6">
                      <div className="flex items-center gap-2.5">
                        {user.photo ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={user.photo} alt={user.name} className="w-7 h-7 rounded-full object-cover" />
                        ) : (
                          <div className="w-7 h-7 rounded-full bg-orange-600/20 text-orange-400 flex items-center justify-center text-[11px] font-bold">
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <span className="font-bold text-white whitespace-nowrap">
                          {user.name}
                          {user.id === currentUserId && (
                            <span className="ml-1.5 text-[10px] font-semibold text-stone-500">(tú)</span>
                          )}
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 sm:px-6 text-stone-300">{user.email}</td>
                    <td className="py-3.5 px-4 sm:px-6">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-bold ${
                          user.role === "ADMIN"
                            ? "bg-orange-500/10 text-orange-400"
                            : "bg-stone-800 text-stone-300 border border-stone-700/60"
                        }`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 sm:px-6 text-stone-400 font-mono text-[11px] whitespace-nowrap">
                      {dateFormatter.format(new Date(user.createdAt))}
                    </td>
                    <td className="py-3.5 px-4 sm:px-6 text-right">
                      <button
                        type="button"
                        onClick={() => onEdit(user)}
                        className="px-3 py-1.5 rounded-lg text-[11px] font-semibold text-stone-200 bg-stone-800 hover:bg-stone-700 transition whitespace-nowrap"
                      >
                        Editar usuario
                      </button>
                    </td>
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
