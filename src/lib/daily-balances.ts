const TIME_ZONE = "America/Bogota";

const dayFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

export interface BalancePoint {
  date: string;
  balance: number;
}

interface BalanceMovement {
  id?: number;
  createdAt: Date | string;
  balanceAfter: number;
}

export function toDayKey(date: Date | string): string {
  return dayFormatter.format(new Date(date));
}

function nextDayKey(key: string): string {
  const date = new Date(`${key}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + 1);
  return date.toISOString().slice(0, 10);
}

// Saldo al cierre de cada día (hora Colombia). Los días sin movimientos conservan el saldo anterior.
export function buildDailyBalances(
  movements: BalanceMovement[],
  until: Date = new Date()
): BalancePoint[] {
  if (movements.length === 0) return [];

  const sorted = [...movements].sort((a, b) => {
    const diff = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    return diff !== 0 ? diff : (a.id ?? 0) - (b.id ?? 0);
  });

  const closing = new Map<string, number>();
  for (const movement of sorted) {
    closing.set(toDayKey(movement.createdAt), movement.balanceAfter);
  }

  const firstDay = toDayKey(sorted[0].createdAt);
  const lastMovementDay = toDayKey(sorted[sorted.length - 1].createdAt);
  const untilDay = toDayKey(until);
  const lastDay = untilDay > lastMovementDay ? untilDay : lastMovementDay;

  const points: BalancePoint[] = [];
  let balance = 0;

  for (let day = firstDay; day <= lastDay; day = nextDayKey(day)) {
    balance = closing.get(day) ?? balance;
    points.push({ date: day, balance });
  }

  return points;
}
