import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor, cleanup } from "@testing-library/react";
import { buildDailyBalances } from "@/lib/daily-balances";
import { TransactionsTable } from "@/components/features/transactions/transactions-table";
import { CreateMovementDialog } from "@/components/features/transactions/create-movement-dialog";
import type { TransactionItem } from "@/types/inventory";

vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

const admin = { id: 1, name: "Admin", email: "admin@codechef.com" };

const mockTransactions: TransactionItem[] = [
  {
    id: 12,
    createdAt: "2026-10-22T15:00:00Z",
    type: "OUT",
    quantity: 4,
    balanceAfter: 46,
    reason: "Consumo del día",
    createdBy: { id: 2, name: "Laura Gómez", email: "laura@codechef.com" },
  },
  {
    id: 11,
    createdAt: "2026-10-20T15:00:00Z",
    type: "IN",
    quantity: 50,
    balanceAfter: 50,
    reason: "Stock inicial",
    createdBy: admin,
  },
];

const ingredient = { id: 1, name: "Pan brioche", unit: "UNITS", stock: 10, status: "ACTIVE" };

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe("Transacciones", () => {
  describe("buildDailyBalances", () => {
    it("toma el último saldo de cada día y rellena los días sin movimientos", () => {
      const points = buildDailyBalances(
        [
          { id: 1, createdAt: "2026-10-20T14:00:00Z", balanceAfter: 50 },
          { id: 2, createdAt: "2026-10-20T20:00:00Z", balanceAfter: 42 },
          { id: 3, createdAt: "2026-10-23T15:00:00Z", balanceAfter: 30 },
        ],
        new Date("2026-10-24T15:00:00Z")
      );

      expect(points).toEqual([
        { date: "2026-10-20", balance: 42 },
        { date: "2026-10-21", balance: 42 },
        { date: "2026-10-22", balance: 42 },
        { date: "2026-10-23", balance: 30 },
        { date: "2026-10-24", balance: 30 },
      ]);
    });

    it("agrupa por día en hora de Colombia", () => {
      // 02:00 UTC del 21 equivale a las 21:00 del 20 en Bogotá
      const points = buildDailyBalances(
        [{ createdAt: "2026-10-21T02:00:00Z", balanceAfter: 5 }],
        new Date("2026-10-21T02:00:00Z")
      );
      expect(points).toEqual([{ date: "2026-10-20", balance: 5 }]);
    });

    it("devuelve una lista vacía si no hay movimientos", () => {
      expect(buildDailyBalances([])).toEqual([]);
    });
  });

  describe("TransactionsTable", () => {
    it("muestra id, tipo, cantidad y responsable de cada movimiento", () => {
      render(<TransactionsTable transactions={mockTransactions} unit="UNITS" loading={false} />);

      expect(screen.getByText("#12")).toBeDefined();
      expect(screen.getByText("#11")).toBeDefined();
      expect(screen.getByText("Laura Gómez")).toBeDefined();
      expect(screen.getByText("Admin")).toBeDefined();
      expect(screen.getAllByText("Salida").length).toBeGreaterThan(0);
    });

    it("filtra por tipo de movimiento", () => {
      render(<TransactionsTable transactions={mockTransactions} unit="UNITS" loading={false} />);

      fireEvent.click(screen.getByRole("button", { name: "Entradas" }));
      expect(screen.queryByText("#12")).toBeNull();
      expect(screen.getByText("#11")).toBeDefined();
    });
  });

  describe("CreateMovementDialog", () => {
    it("muestra el maestro seleccionado en el título", () => {
      render(
        <CreateMovementDialog isOpen ingredient={ingredient} onClose={vi.fn()} onSuccess={vi.fn()} />
      );

      expect(screen.getByRole("heading", { name: "Pan brioche" })).toBeDefined();
      expect(screen.getByRole("button", { name: "Cancelar" })).toBeDefined();
      expect(screen.getByRole("button", { name: "Crear movimiento" })).toBeDefined();
    });

    it("no permite una salida mayor al saldo disponible", () => {
      const fetchMock = vi.fn();
      vi.stubGlobal("fetch", fetchMock);

      render(
        <CreateMovementDialog isOpen ingredient={ingredient} onClose={vi.fn()} onSuccess={vi.fn()} />
      );

      fireEvent.click(screen.getByRole("button", { name: "Salida" }));
      fireEvent.change(screen.getByLabelText(/Cantidad/), { target: { value: "15" } });
      fireEvent.click(screen.getByRole("button", { name: "Crear movimiento" }));

      expect(screen.getByRole("alert").textContent).toContain("No hay saldo suficiente");
      expect(fetchMock).not.toHaveBeenCalled();
    });

    it("envía el movimiento, cierra el diálogo y refresca", async () => {
      const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ id: 99 }) });
      vi.stubGlobal("fetch", fetchMock);
      const onClose = vi.fn();
      const onSuccess = vi.fn();

      render(
        <CreateMovementDialog isOpen ingredient={ingredient} onClose={onClose} onSuccess={onSuccess} />
      );

      fireEvent.change(screen.getByLabelText(/Cantidad/), { target: { value: "5" } });
      fireEvent.click(screen.getByRole("button", { name: "Crear movimiento" }));

      await waitFor(() => expect(onSuccess).toHaveBeenCalled());
      expect(onClose).toHaveBeenCalled();
      expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toEqual({
        ingredientId: 1,
        type: "IN",
        quantity: 5,
        reason: null,
      });
    });
  });
});
