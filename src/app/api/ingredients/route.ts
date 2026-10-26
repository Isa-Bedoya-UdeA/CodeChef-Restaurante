import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { Unit } from "@/generated/prisma/enums";
import {
  listIngredients,
  createIngredient,
  InventoryError,
} from "@/services/inventory.service";

// GET /api/ingredients - Listar todos los Maestros (Visible para ADMIN y USER)
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const ingredients = await listIngredients();
    return NextResponse.json(ingredients);
  } catch (error) {
    console.error("Error fetching ingredients:", error);
    return NextResponse.json(
      { error: "Error al obtener los maestros" },
      { status: 500 }
    );
  }
}

// POST /api/ingredients - Crear Maestro (Sólo permitido para rol ADMIN)
export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    // Regla estricta: Solo ADMIN puede crear Maestros
    if (session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Acceso denegado. Solo administradores pueden crear maestros." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { name, unit, initialStock } = body;

    // Validaciones
    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json(
        { error: "El nombre del maestro es requerido" },
        { status: 400 }
      );
    }

    const validUnits: Unit[] = ["KG", "G", "ML", "L", "UNITS"];
    if (!unit || !validUnits.includes(unit)) {
      return NextResponse.json(
        { error: "La unidad de medida seleccionada no es válida" },
        { status: 400 }
      );
    }

    const stockNumber = Number(initialStock);
    if (isNaN(stockNumber) || stockNumber < 0) {
      return NextResponse.json(
        { error: "El saldo inicial debe ser un número mayor o igual a 0" },
        { status: 400 }
      );
    }

    const userId = Number(session.user.id);
    if (isNaN(userId)) {
      return NextResponse.json(
        { error: "Sesión de usuario inválida" },
        { status: 400 }
      );
    }

    const created = await createIngredient({
      name,
      unit,
      initialStock: stockNumber,
      userId,
    });

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    if (error instanceof InventoryError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("Error creating ingredient:", error);
    return NextResponse.json(
      { error: "Error interno al crear el maestro" },
      { status: 500 }
    );
  }
}
