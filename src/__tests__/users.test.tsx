import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor, cleanup } from "@testing-library/react";
import { UsersTable, type UserItem } from "@/components/features/users/users-table";
import { EditUserDialog } from "@/components/features/users/edit-user-dialog";

vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

const mockUsers: UserItem[] = [
  {
    id: 1,
    name: "Admin",
    email: "admin@codechef.com",
    role: "ADMIN",
    photo: null,
    createdAt: "2026-10-20T15:00:00Z",
  },
  {
    id: 2,
    name: "Laura Gómez",
    email: "laura@codechef.com",
    role: "USER",
    photo: null,
    createdAt: "2026-10-21T15:00:00Z",
  },
];

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe("Usuarios", () => {
  describe("UsersTable", () => {
    it("muestra id, correo y rol de cada usuario", () => {
      render(<UsersTable users={mockUsers} loading={false} currentUserId={1} onEdit={vi.fn()} />);

      expect(screen.getByText("#1")).toBeDefined();
      expect(screen.getByText("laura@codechef.com")).toBeDefined();
      expect(screen.getByText("ADMIN")).toBeDefined();
      expect(screen.getByText("USER")).toBeDefined();
    });

    it("filtra por nombre o correo", () => {
      render(<UsersTable users={mockUsers} loading={false} currentUserId={1} onEdit={vi.fn()} />);

      fireEvent.change(screen.getByPlaceholderText(/Buscar por nombre o correo/i), {
        target: { value: "laura" },
      });
      expect(screen.queryByText("admin@codechef.com")).toBeNull();
      expect(screen.getByText("laura@codechef.com")).toBeDefined();
    });

    it("abre la edición del usuario seleccionado", () => {
      const onEdit = vi.fn();
      render(<UsersTable users={mockUsers} loading={false} currentUserId={1} onEdit={onEdit} />);

      fireEvent.click(screen.getAllByRole("button", { name: "Editar usuario" })[1]);
      expect(onEdit).toHaveBeenCalledWith(mockUsers[1]);
    });
  });

  describe("EditUserDialog", () => {
    it("muestra el correo y el rol actual por defecto", () => {
      render(
        <EditUserDialog user={mockUsers[1]} currentUserId={1} onClose={vi.fn()} onSuccess={vi.fn()} />
      );

      expect(screen.getByText("laura@codechef.com")).toBeDefined();
      expect((screen.getByLabelText("Rol") as HTMLSelectElement).value).toBe("USER");
    });

    it("no deja cambiar el rol propio", () => {
      render(
        <EditUserDialog user={mockUsers[0]} currentUserId={1} onClose={vi.fn()} onSuccess={vi.fn()} />
      );

      expect((screen.getByLabelText("Rol") as HTMLSelectElement).disabled).toBe(true);
    });

    it("actualiza el rol, cierra el diálogo y refresca", async () => {
      const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({}) });
      vi.stubGlobal("fetch", fetchMock);
      const onClose = vi.fn();
      const onSuccess = vi.fn();

      render(
        <EditUserDialog user={mockUsers[1]} currentUserId={1} onClose={onClose} onSuccess={onSuccess} />
      );

      fireEvent.change(screen.getByLabelText("Rol"), { target: { value: "ADMIN" } });
      fireEvent.click(screen.getByRole("button", { name: "Guardar cambios" }));

      await waitFor(() => expect(onSuccess).toHaveBeenCalled());
      expect(onClose).toHaveBeenCalled();
      expect(fetchMock).toHaveBeenCalledWith(
        "/api/users/2",
        expect.objectContaining({ method: "PATCH", body: JSON.stringify({ role: "ADMIN" }) })
      );
    });
  });
});
