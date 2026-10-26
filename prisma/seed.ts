import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

// Redondea a 3 decimales (igual que Decimal(10, 3) en la base de datos)
const round3 = (n: number) => Math.round(n * 1000) / 1000;

async function main() {
  // ─────────────────────────────────────────────
  // 1. Limpiar (primero lo que depende de otras tablas)
  // ─────────────────────────────────────────────
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.recipe.deleteMany();
  await prisma.inventoryTransaction.deleteMany();
  await prisma.product.deleteMany();
  await prisma.ingredient.deleteMany();
  await prisma.user.deleteMany();

  // ─────────────────────────────────────────────
  // 2. Usuarios
  // ─────────────────────────────────────────────
  const admin = await prisma.user.create({
    data: {
      name: "Admin",
      email: "admin@codechef.com",
      password: await bcrypt.hash("admin123", 10),
      role: "ADMIN",
    },
  });

  const laura = await prisma.user.create({
    data: {
      name: "Laura Gómez",
      email: "laura@codechef.com",
      password: await bcrypt.hash("cliente123", 10),
    },
  });

  const andres = await prisma.user.create({
    data: {
      name: "Andrés Restrepo",
      email: "andres@codechef.com",
      password: await bcrypt.hash("cliente123", 10),
    },
  });

  // ─────────────────────────────────────────────
  // 3. Ingredientes + transacción de stock inicial (IN)
  // ─────────────────────────────────────────────
  const ingredientsData = [
    { key: "bun",     name: "Pan de hamburguesa",       unit: "UNITS", stock: 60 },
    { key: "patty",   name: "Carne de res",              unit: "UNITS", stock: 50 },
    { key: "cheese",  name: "Queso cheddar tajado",      unit: "UNITS", stock: 80 },
    { key: "tomato",  name: "Tomate fresco",             unit: "KG",    stock: 5 },
    { key: "lettuce", name: "Lechuga crespa",            unit: "KG",    stock: 3 },
    { key: "potato",  name: "Papa sabanera",             unit: "KG",    stock: 20 },
    { key: "chicken", name: "Pechuga de pollo",          unit: "KG",    stock: 10 },
    { key: "soda",    name: "Gaseosa en lata",           unit: "UNITS", stock: 48 },
  ] as const;

  // Aquí guardamos el id y el stock "en memoria" de cada ingrediente
  const ing: Record<string, { id: number; stock: number }> = {};

  // Helper para generar fechas en días pasados para tener historial rico en las gráficas
  const daysAgo = (days: number, hours = 10, minutes = 0): Date => {
    const d = new Date();
    d.setDate(d.getDate() - days);
    d.setHours(hours, minutes, 0, 0);
    return d;
  };

  for (const i of ingredientsData) {
    const created = await prisma.ingredient.create({
      data: {
        name: i.name,
        unit: i.unit,
        stock: i.stock,
        createdById: admin.id,
        createdAt: daysAgo(6, 8, 30),
      },
    });

    await prisma.inventoryTransaction.create({
      data: {
        ingredientId: created.id,
        quantity: i.stock,
        balanceAfter: i.stock,
        type: "IN",
        reason: "Stock inicial",
        createdById: admin.id,
        createdAt: daysAgo(6, 8, 30),
      },
    });

    ing[i.key] = { id: created.id, stock: i.stock };
  }

  // Registra un movimiento de inventario y actualiza el stock en memoria
  async function moveStock(
    key: string,
    quantity: number,
    type: "IN" | "OUT",
    reason: string,
    createdAt: Date = new Date()
  ) {
    const item = ing[key];
    item.stock = round3(type === "IN" ? item.stock + quantity : item.stock - quantity);

    await prisma.inventoryTransaction.create({
      data: {
        ingredientId: item.id,
        quantity,
        balanceAfter: item.stock,
        type,
        reason,
        createdById: admin.id,
        createdAt,
      },
    });
  }

  // ─────────────────────────────────────────────
  // 4. Productos con sus recetas
  // ─────────────────────────────────────────────
  const productsData = [
    {
      key: "classic", name: "Hamburguesa Clásica", price: 18000, category: "Hamburguesas",
      recipe: [["bun", 1], ["patty", 1], ["tomato", 0.05], ["lettuce", 0.03]],
    },
    {
      key: "cheese", name: "Hamburguesa con Queso", price: 21000, category: "Hamburguesas",
      recipe: [["bun", 1], ["patty", 1], ["cheese", 2], ["lettuce", 0.03]],
    },
    {
      key: "chicken", name: "Pollo a la Parrilla", price: 24000, category: "Platos Fuertes",
      recipe: [["chicken", 0.2], ["tomato", 0.05], ["lettuce", 0.05]],
    },
    {
      key: "fries", name: "Papas a la Francesa", price: 8000, category: "Acompañamientos",
      recipe: [["potato", 0.25]],
    },
    {
      key: "soda", name: "Gaseosa", price: 5000, category: "Bebidas",
      recipe: [["soda", 1]],
    },
  ] as const;

  const prod: Record<
    string,
    { id: number; price: number; recipe: readonly (readonly [string, number])[] }
  > = {};

  for (const p of productsData) {
    const created = await prisma.product.create({
      data: {
        name: p.name,
        price: p.price,
        category: p.category,
        recipes: {
          create: p.recipe.map(([key, qty]) => ({
            ingredientId: ing[key].id,
            quantityUsed: qty,
          })),
        },
      },
    });
    prod[p.key] = { id: created.id, price: p.price, recipe: p.recipe };
  }

  // ─────────────────────────────────────────────
  // 5. Pedidos con sus detalles (y descuento de inventario)
  // ─────────────────────────────────────────────
  async function createOrder(opts: {
    userId: number;
    status: "PENDING" | "PREPARING" | "DELIVERED" | "CANCELLED";
    paymentStatus: "PENDING" | "PAID" | "REJECTED" | "REFUNDED";
    paymentMethod?: "CASH" | "CARD" | "TRANSFER";
    items: { product: string; quantity: number; note?: string }[];
    createdAt?: Date;
  }) {
    const orderDate = opts.createdAt ?? new Date();
    const total = opts.items.reduce(
      (sum, it) => sum + prod[it.product].price * it.quantity,
      0
    );

    const order = await prisma.order.create({
      data: {
        userId: opts.userId,
        status: opts.status,
        paymentStatus: opts.paymentStatus,
        paymentMethod: opts.paymentMethod,
        total,
        createdAt: orderDate,
        items: {
          create: opts.items.map((it) => ({
            productId: prod[it.product].id,
            quantity: it.quantity,
            unitPrice: prod[it.product].price,
            note: it.note,
          })),
        },
      },
    });

    // Solo descuentan inventario los pedidos que ya se están preparando o se entregaron
    if (opts.status === "PREPARING" || opts.status === "DELIVERED") {
      // Suma cuánto se usa de cada ingrediente en todo el pedido
      const usage: Record<string, number> = {};
      for (const it of opts.items) {
        for (const [key, qty] of prod[it.product].recipe) {
          usage[key] = round3((usage[key] ?? 0) + qty * it.quantity);
        }
      }
      for (const [key, qty] of Object.entries(usage)) {
        await moveStock(key, qty, "OUT", `Pedido #${order.id}`, orderDate);
      }
    }
  }

  // Día -5: Pedido entregado (consumo de pan, carne, papas, gaseosa)
  await createOrder({
    userId: laura.id,
    status: "DELIVERED",
    paymentStatus: "PAID",
    paymentMethod: "CASH",
    createdAt: daysAgo(5, 13, 15),
    items: [
      { product: "classic", quantity: 1 },
      { product: "classic", quantity: 1, note: "Sin tomate" },
      { product: "fries", quantity: 1 },
      { product: "soda", quantity: 2 },
    ],
  });

  // Día -4: Ajuste manual por producto vencido (tomate)
  await moveStock("tomato", 0.5, "OUT", "Producto vencido", daysAgo(4, 11, 0));

  // Día -3: Pedido entregado (consumo de queso, pan, carne, papas)
  await createOrder({
    userId: andres.id,
    status: "DELIVERED",
    paymentStatus: "PAID",
    paymentMethod: "CARD",
    createdAt: daysAgo(3, 19, 45),
    items: [
      { product: "cheese", quantity: 1, note: "Queso extra" },
      { product: "fries", quantity: 1 },
    ],
  });

  // Día -2: Entrega de proveedor (reabastecimiento de gaseosa y carne)
  await moveStock("soda", 24, "IN", "Entrega de proveedor", daysAgo(2, 9, 30));
  await moveStock("patty", 20, "IN", "Entrega de proveedor", daysAgo(2, 9, 35));

  // Día -1: Pedido entregado (consumo de pollo, tomate, lechuga, gaseosa)
  await createOrder({
    userId: laura.id,
    status: "DELIVERED",
    paymentStatus: "PAID",
    paymentMethod: "TRANSFER",
    createdAt: daysAgo(1, 14, 20),
    items: [
      { product: "chicken", quantity: 1 },
      { product: "soda", quantity: 1 },
    ],
  });

  // Hoy: Pedido en preparación, pedido pendiente y pedido cancelado
  await createOrder({
    userId: andres.id,
    status: "PREPARING",
    paymentStatus: "PAID",
    paymentMethod: "CARD",
    createdAt: daysAgo(0, 11, 10),
    items: [
      { product: "classic", quantity: 1 },
      { product: "fries", quantity: 1 },
    ],
  });

  await createOrder({
    userId: laura.id,
    status: "PENDING",
    paymentStatus: "PENDING",
    createdAt: daysAgo(0, 12, 0),
    items: [
      { product: "chicken", quantity: 1 },
      { product: "soda", quantity: 1 },
    ],
  });

  await createOrder({
    userId: andres.id,
    status: "CANCELLED",
    paymentStatus: "REFUNDED",
    paymentMethod: "TRANSFER",
    createdAt: daysAgo(0, 12, 30),
    items: [{ product: "classic", quantity: 2 }],
  });

  // ─────────────────────────────────────────────
  // 6. Ajuste manual de inventario de hoy
  // ─────────────────────────────────────────────
  await moveStock("lettuce", 0.2, "OUT", "Merma en cocina", daysAgo(0, 14, 0));

  // ─────────────────────────────────────────────
  // 7. Guardar el stock final de cada ingrediente
  // ─────────────────────────────────────────────
  for (const item of Object.values(ing)) {
    await prisma.ingredient.update({
      where: { id: item.id },
      data: { stock: item.stock },
    });
  }

  console.log("Seed completed ✅");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
