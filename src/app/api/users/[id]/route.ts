import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { UserError, isAdmin, updateUserRole } from "@/services/users.service";

const ROLES = ["ADMIN", "USER"] as const;

// PATCH /api/users/:id - Actualizar el rol de un usuario (solo ADMIN)
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const actingUserId = Number(session.user.id);
    if (!(await isAdmin(actingUserId))) {
      return NextResponse.json(
        { error: "Acceso denegado. Solo administradores pueden editar usuarios." },
        { status: 403 }
      );
    }

    const { id } = await params;
    const userId = Number(id);
    if (!Number.isInteger(userId) || userId <= 0) {
      return NextResponse.json({ error: "Identificador de usuario inválido" }, { status: 400 });
    }

    const body = await req.json().catch(() => null);
    const role = body?.role;
    if (!ROLES.includes(role)) {
      return NextResponse.json({ error: "El rol seleccionado no es válido" }, { status: 400 });
    }

    const user = await updateUserRole(userId, role, actingUserId);
    return NextResponse.json(user);
  } catch (error) {
    if (error instanceof UserError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    console.error("Error updating user:", error);
    return NextResponse.json({ error: "Error interno al actualizar el usuario" }, { status: 500 });
  }
}
