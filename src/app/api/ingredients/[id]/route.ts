import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { IngredientStatus } from "@/generated/prisma/enums";
import {
  getIngredientById,
  toggleIngredientStatus,
  InventoryError,
} from "@/services/inventory.service";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/ingredients/[id]
export async function GET(_req: Request, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { id } = await params;
    const ingredientId = Number(id);

    if (isNaN(ingredientId)) {
      return NextResponse.json({ error: "ID de maestro inválido" }, { status: 400 });
    }

    const item = await getIngredientById(ingredientId);
    if (!item) {
      return NextResponse.json({ error: "Maestro no encontrado" }, { status: 404 });
    }

    return NextResponse.json(item);
  } catch (error) {
    console.error("Error fetching ingredient:", error);
    return NextResponse.json({ error: "Error al obtener el maestro" }, { status: 500 });
  }
}

// PATCH /api/ingredients/[id] - Cambiar estado ACTIVO/INACTIVO (Solo ADMIN)
export async function PATCH(req: Request, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    if (session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Acceso denegado. Solo administradores pueden modificar el estado del maestro." },
        { status: 403 }
      );
    }

    const { id } = await params;
    const ingredientId = Number(id);

    if (isNaN(ingredientId)) {
      return NextResponse.json({ error: "ID de maestro inválido" }, { status: 400 });
    }

    const body = await req.json();
    const { status } = body;

    const validStatuses: IngredientStatus[] = ["ACTIVE", "INACTIVE"];
    if (!status || !validStatuses.includes(status)) {
      return NextResponse.json({ error: "Estado no válido" }, { status: 400 });
    }

    const updated = await toggleIngredientStatus(ingredientId, status);
    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof InventoryError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("Error updating ingredient status:", error);
    return NextResponse.json({ error: "Error al actualizar el estado del maestro" }, { status: 500 });
  }
}
