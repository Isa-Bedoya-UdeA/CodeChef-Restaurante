import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MaestrosTable } from "@/components/features/ingredients/maestros-table";
import { MaestrosView } from "@/components/features/ingredients/maestros-view";
import { CreateMaestroDialog } from "@/components/features/ingredients/create-maestro-dialog";

const mockMaestros = [
  {
    id: 1,
    name: "Pan de hamburguesa",
    unit: "UNITS",
    stock: 50,
    status: "ACTIVE",
    createdAt: "2026-10-20T10:00:00Z",
    createdBy: { id: 1, name: "Admin CodeChef", email: "admin@codechef.com" },
  },
  {
    id: 2,
    name: "Carne de res",
    unit: "KG",
    stock: 15.5,
    status: "ACTIVE",
    createdAt: "2026-10-20T11:00:00Z",
    createdBy: { id: 2, name: "Laura Gomez", email: "laura@codechef.com" },
  },
];

describe("Maestros Feature Tests", () => {
  describe("MaestrosTable Component", () => {
    it("renders list of maestros with ID, name, stock, unit and creator", () => {
      render(<MaestrosTable maestros={mockMaestros} loading={false} />);

      expect(screen.getByText("Pan de hamburguesa")).toBeDefined();
      expect(screen.getByText("50.000")).toBeDefined();
      expect(screen.getByText("UNITS")).toBeDefined();
      expect(screen.getByText("Admin CodeChef")).toBeDefined();

      expect(screen.getByText("Carne de res")).toBeDefined();
      expect(screen.getByText("15.500")).toBeDefined();
      expect(screen.getByText("KG")).toBeDefined();
      expect(screen.getByText("Laura Gomez")).toBeDefined();
    });

    it("filters maestros by search term", () => {
      render(<MaestrosTable maestros={mockMaestros} loading={false} />);

      const searchInput = screen.getByPlaceholderText(/Buscar por nombre o autor/i);
      fireEvent.change(searchInput, { target: { value: "Carne" } });

      expect(screen.getByText("Carne de res")).toBeDefined();
      expect(screen.queryByText("Pan de hamburguesa")).toBeNull();
    });
  });

  describe("MaestrosView Component - Role Permissions", () => {
    it("renders 'Agregar Maestro' button ONLY when userRole is ADMIN", () => {
      const { rerender } = render(
        <MaestrosView userRole="ADMIN" initialData={mockMaestros} />
      );

      expect(screen.getByText("Agregar Maestro")).toBeDefined();

      // For normal USER role: button MUST be hidden according to project rules
      rerender(<MaestrosView userRole="USER" initialData={mockMaestros} />);
      expect(screen.queryByText("Agregar Maestro")).toBeNull();
    });
  });

  describe("CreateMaestroDialog Component", () => {
    it("renders modal dialog inputs when isOpen is true", () => {
      render(
        <CreateMaestroDialog
          isOpen={true}
          onClose={vi.fn()}
          onSuccess={vi.fn()}
        />
      );

      expect(screen.getByText("Agregar Maestro")).toBeDefined();
      expect(screen.getByLabelText("Nombre del Maestro")).toBeDefined();
      expect(screen.getByLabelText("Unidad de Medida")).toBeDefined();
      expect(screen.getByLabelText("Saldo Inicial del Maestro")).toBeDefined();
      expect(screen.getByRole("button", { name: "Cancelar" })).toBeDefined();
      expect(screen.getByRole("button", { name: "Crear Maestro" })).toBeDefined();
    });

    it("does not render when isOpen is false", () => {
      render(
        <CreateMaestroDialog
          isOpen={false}
          onClose={vi.fn()}
          onSuccess={vi.fn()}
        />
      );

      expect(screen.queryByText("Agregar Maestro")).toBeNull();
    });
  });
});
