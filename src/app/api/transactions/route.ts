import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  MovementError,
  createMovement,
  getIngredientTransactions,
} from "@/services/transactions.service";

const MAX_QUANTITY = 9_999_999.999;

// GET /api/transactions?ingredientId=1 - Movimientos y saldos diarios de un maestro (ADMIN y USER)
export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const ingredientId = Number(new URL(req.url).searchParams.get("ingredientId"));
    if (!Number.isInteger(ingredientId) || ingredientId <= 0) {
      return NextResponse.json(
        { error: "Debes seleccionar un maestro válido" },
        { status: 400 }
      );
    }

    const data = await getIngredientTransactions(ingredientId);
    if (!data) {
      return NextResponse.json({ error: "El maestro no existe" }, { status: 404 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return NextResponse.json(
      { error: "Error al obtener los movimientos" },
      { status: 500 }
    );
  }
}

// POST /api/transactions - Registrar movimiento de inventario (ADMIN y USER)
export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const userId = Number(session.user.id);
    if (!Number.isInteger(userId)) {
      return NextResponse.json({ error: "Sesión de usuario inválida" }, { status: 400 });
    }

    const body = await req.json().catch(() => null);
    const ingredientId = Number(body?.ingredientId);
    const quantity = Number(body?.quantity);
    const type = body?.type;
    const reason = typeof body?.reason === "string" ? body.reason.trim().slice(0, 200) : null;

    if (!Number.isInteger(ingredientId) || ingredientId <= 0) {
      return NextResponse.json(
        { error: "Debes seleccionar un maestro válido" },
        { status: 400 }
      );
    }

    if (type !== "IN" && type !== "OUT") {
      return NextResponse.json(
        { error: "El tipo de movimiento debe ser entrada o salida" },
        { status: 400 }
      );
    }

    if (!Number.isFinite(quantity) || quantity <= 0 || quantity > MAX_QUANTITY) {
      return NextResponse.json(
        { error: "La cantidad debe ser un número mayor que 0" },
        { status: 400 }
      );
    }

    if (Math.abs(Math.round(quantity * 1000) - quantity * 1000) > 1e-6) {
      return NextResponse.json(
        { error: "La cantidad admite máximo 3 decimales" },
        { status: 400 }
      );
    }

    const transaction = await createMovement({
      ingredientId,
      type,
      quantity,
      reason,
      userId,
    });

    return NextResponse.json(transaction, { status: 201 });
  } catch (error) {
    if (error instanceof MovementError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    console.error("Error creating transaction:", error);
    return NextResponse.json(
      { error: "Error interno al registrar el movimiento" },
      { status: 500 }
    );
  }
}
