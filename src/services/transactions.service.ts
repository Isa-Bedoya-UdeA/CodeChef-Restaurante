import { prisma } from "@/lib/prisma";
import { buildDailyBalances } from "@/lib/daily-balances";
import type { IngredientTransactions, MovementType, TransactionItem } from "@/types/inventory";

export class MovementError extends Error {
  constructor(message: string, public status: number) {
    super(message);
  }
}

const createdBySelect = { select: { id: true, name: true, email: true } } as const;

export async function getIngredientTransactions(
  ingredientId: number
): Promise<IngredientTransactions | null> {
  const ingredient = await prisma.ingredient.findUnique({
    where: { id: ingredientId },
    select: { id: true, name: true, unit: true, stock: true, status: true },
  });

  if (!ingredient) return null;

  const rows = await prisma.inventoryTransaction.findMany({
    where: { ingredientId },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    include: { createdBy: createdBySelect },
  });

  // Prisma devuelve los Decimal como objetos; se convierten a número para el JSON
  const transactions: TransactionItem[] = rows.map((row) => ({
    id: row.id,
    createdAt: row.createdAt.toISOString(),
    type: row.type,
    quantity: Number(row.quantity),
    balanceAfter: Number(row.balanceAfter),
    reason: row.reason,
    createdBy: row.createdBy,
  }));

  return {
    ingredient: { ...ingredient, stock: Number(ingredient.stock) },
    transactions,
    dailyBalances: buildDailyBalances(transactions),
  };
}

interface CreateMovementInput {
  ingredientId: number;
  type: MovementType;
  quantity: number;
  reason?: string | null;
  userId: number;
}

export async function createMovement(input: CreateMovementInput): Promise<TransactionItem> {
  const row = await prisma.$transaction(async (tx) => {
    const ingredient = await tx.ingredient.findUnique({
      where: { id: input.ingredientId },
    });

    if (!ingredient) {
      throw new MovementError("El maestro seleccionado no existe", 404);
    }

    if (ingredient.status !== "ACTIVE") {
      throw new MovementError("El maestro está inactivo y no admite movimientos", 409);
    }

    // El incremento lo hace la base de datos, así dos movimientos al mismo tiempo no se pisan el saldo
    const updated = await tx.ingredient.update({
      where: { id: input.ingredientId },
      data: {
        stock:
          input.type === "IN"
            ? { increment: input.quantity }
            : { decrement: input.quantity },
      },
    });

    if (Number(updated.stock) < 0) {
      throw new MovementError(
        `Saldo insuficiente. Disponible: ${Number(ingredient.stock)}`,
        409
      );
    }

    return tx.inventoryTransaction.create({
      data: {
        ingredientId: input.ingredientId,
        type: input.type,
        quantity: input.quantity,
        balanceAfter: updated.stock,
        reason: input.reason || null,
        createdById: input.userId,
      },
      include: { createdBy: createdBySelect },
    });
  });

  return {
    id: row.id,
    createdAt: row.createdAt.toISOString(),
    type: row.type,
    quantity: Number(row.quantity),
    balanceAfter: Number(row.balanceAfter),
    reason: row.reason,
    createdBy: row.createdBy,
  };
}
