import { prisma } from "@/lib/prisma";
import type { Unit, IngredientStatus } from "@/generated/prisma/enums";

export class InventoryError extends Error {
  constructor(message: string, public status: number) {
    super(message);
  }
}

const ingredientSelect = {
  id: true,
  name: true,
  unit: true,
  stock: true,
  status: true,
  createdAt: true,
  createdBy: {
    select: {
      id: true,
      name: true,
      email: true,
    },
  },
} as const;

export async function listIngredients() {
  const ingredients = await prisma.ingredient.findMany({
    orderBy: { id: "asc" },
    include: {
      createdBy: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  return ingredients.map((item) => ({
    ...item,
    stock: Number(item.stock),
  }));
}

export async function getIngredientById(id: number) {
  const item = await prisma.ingredient.findUnique({
    where: { id },
    include: {
      createdBy: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  if (!item) return null;

  return {
    ...item,
    stock: Number(item.stock),
  };
}

interface CreateIngredientInput {
  name: string;
  unit: Unit;
  initialStock: number;
  userId: number;
}

export async function createIngredient(input: CreateIngredientInput) {
  const trimmedName = input.name.trim();

  const existing = await prisma.ingredient.findUnique({
    where: { name: trimmedName },
  });

  if (existing) {
    throw new InventoryError("Ya existe un maestro registrado con ese nombre", 409);
  }

  const created = await prisma.$transaction(async (tx) => {
    const ingredient = await tx.ingredient.create({
      data: {
        name: trimmedName,
        unit: input.unit,
        stock: input.initialStock,
        createdById: input.userId,
      },
    });

    await tx.inventoryTransaction.create({
      data: {
        ingredientId: ingredient.id,
        quantity: input.initialStock,
        balanceAfter: input.initialStock,
        type: "IN",
        reason: "Stock inicial",
        createdById: input.userId,
      },
    });

    return tx.ingredient.findUnique({
      where: { id: ingredient.id },
      select: ingredientSelect,
    });
  });

  return {
    ...created!,
    stock: Number(created!.stock),
  };
}

export async function toggleIngredientStatus(id: number, newStatus: IngredientStatus) {
  const existing = await prisma.ingredient.findUnique({
    where: { id },
  });

  if (!existing) {
    throw new InventoryError("El maestro no existe", 404);
  }

  const updated = await prisma.ingredient.update({
    where: { id },
    data: { status: newStatus },
    select: ingredientSelect,
  });

  return {
    ...updated,
    stock: Number(updated.stock),
  };
}
