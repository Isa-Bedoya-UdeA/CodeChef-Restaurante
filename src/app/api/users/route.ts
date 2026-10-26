import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { isAdmin, listUsers } from "@/services/users.service";

// GET /api/users - Listar usuarios del sistema (solo ADMIN)
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    if (!(await isAdmin(Number(session.user.id)))) {
      return NextResponse.json(
        { error: "Acceso denegado. Solo administradores pueden ver los usuarios." },
        { status: 403 }
      );
    }

    const users = await listUsers();
    return NextResponse.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json({ error: "Error al obtener los usuarios" }, { status: 500 });
  }
}
