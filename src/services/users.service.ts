import { prisma } from "@/lib/prisma";
import type { Role } from "@/generated/prisma/enums";

export class UserError extends Error {
  constructor(message: string, public status: number) {
    super(message);
  }
}

const userSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  photo: true,
  createdAt: true,
} as const;

// Se consulta el rol en la base de datos porque el del token puede estar desactualizado
export async function isAdmin(userId: number): Promise<boolean> {
  if (!Number.isInteger(userId)) return false;
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { role: true } });
  return user?.role === "ADMIN";
}

export function listUsers() {
  return prisma.user.findMany({
    orderBy: { id: "asc" },
    select: userSelect,
  });
}

export async function updateUserRole(userId: number, role: Role, actingUserId: number) {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { id: true, role: true } });

  if (!user) {
    throw new UserError("El usuario no existe", 404);
  }

  if (userId === actingUserId && role !== "ADMIN") {
    throw new UserError("No puedes quitarte el rol de administrador a ti mismo", 400);
  }

  return prisma.user.update({
    where: { id: userId },
    data: { role },
    select: userSelect,
  });
}
