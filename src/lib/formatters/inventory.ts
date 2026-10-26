const quantityFormatter = new Intl.NumberFormat("es-CO", {
  maximumFractionDigits: 3,
});

const dateTimeFormatter = new Intl.DateTimeFormat("es-CO", {
  timeZone: "America/Bogota",
  year: "numeric",
  month: "short",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

const shortDayFormatter = new Intl.DateTimeFormat("es-CO", {
  timeZone: "UTC",
  day: "numeric",
  month: "short",
});

const UNIT_LABELS: Record<string, string> = {
  KG: "kg",
  G: "g",
  L: "L",
  ML: "ml",
  UNITS: "und",
};

// Traducciones amigables para nombres de maestros precargados en inglés
const INGREDIENT_NAME_TRANSLATIONS: Record<string, string> = {
  "Hamburger bun": "Pan de hamburguesa",
  "Beef patty": "Carne de res",
  "Cheese slice": "Queso cheddar tajado",
  "Tomato": "Tomate fresco",
  "Lettuce": "Lechuga crespa",
  "Potato": "Papa sabanera",
  "Chicken breast": "Pechuga de pollo",
  "Soda can": "Gaseosa en lata",
  "Soda": "Gaseosa",
};

export function formatIngredientName(name: string): string {
  if (!name) return "";
  return INGREDIENT_NAME_TRANSLATIONS[name] ?? name;
}

export function formatQuantity(value: number): string {
  return quantityFormatter.format(value);
}

export function formatDateTime(value: string | Date): string {
  return dateTimeFormatter.format(new Date(value));
}

// Recibe una fecha en formato YYYY-MM-DD, como las que produce buildDailyBalances
export function formatShortDay(dayKey: string): string {
  return shortDayFormatter.format(new Date(`${dayKey}T12:00:00Z`));
}

export function unitLabel(unit: string): string {
  return UNIT_LABELS[unit] ?? unit;
}

// Traduce motivos comunes registrados en inglés a español
export function formatReason(reason?: string | null): string {
  if (!reason) return "—";
  const trimmed = reason.trim();
  const lower = trimmed.toLowerCase();

  if (lower === "initial stock") return "Stock inicial";
  if (lower.startsWith("order #")) {
    return trimmed.replace(/order #/i, "Pedido #");
  }
  if (lower === "expired product") return "Producto vencido";
  if (lower === "supplier delivery") return "Entrega de proveedor";

  return trimmed;
}
