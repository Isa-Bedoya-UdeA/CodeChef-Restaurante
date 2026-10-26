import type { BalancePoint } from "@/lib/daily-balances";

export type MovementType = "IN" | "OUT";

export interface IngredientSummary {
  id: number;
  name: string;
  unit: string;
  stock: number;
  status: string;
}

export interface TransactionItem {
  id: number;
  createdAt: string;
  type: MovementType;
  quantity: number;
  balanceAfter: number;
  reason: string | null;
  createdBy: {
    id: number;
    name: string;
    email: string;
  };
}

export interface IngredientTransactions {
  ingredient: IngredientSummary;
  transactions: TransactionItem[];
  dailyBalances: BalancePoint[];
}
