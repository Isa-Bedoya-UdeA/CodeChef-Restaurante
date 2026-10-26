"use client";

import { useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { BalancePoint } from "@/lib/daily-balances";
import { formatQuantity, formatShortDay, unitLabel } from "@/lib/formatters/inventory";

const RANGES = [
  { label: "7 días", days: 7 },
  { label: "30 días", days: 30 },
  { label: "Todo", days: 0 },
] as const;

interface BalanceChartProps {
  points: BalancePoint[];
  unit: string;
}

interface TooltipProps {
  active?: boolean;
  payload?: { payload: BalancePoint }[];
  unit: string;
}

function BalanceTooltip({ active, payload, unit }: TooltipProps) {
  if (!active || !payload?.length) return null;
  const point = payload[0].payload;

  return (
    <div className="rounded-lg border border-stone-700 bg-stone-950 px-3 py-2 text-xs shadow-lg">
      <p className="text-stone-400">{formatShortDay(point.date)}</p>
      <p className="font-bold text-orange-400">
        {formatQuantity(point.balance)} {unitLabel(unit)}
      </p>
    </div>
  );
}

export function BalanceChart({ points, unit }: BalanceChartProps) {
  const [rangeDays, setRangeDays] = useState<number>(30);

  const visiblePoints = useMemo(
    () => (rangeDays > 0 ? points.slice(-rangeDays) : points),
    [points, rangeDays]
  );

  return (
    <div className="rounded-2xl bg-stone-900 border border-stone-800 p-4 sm:p-6 shadow-xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <div>
          <h2 className="text-sm font-bold text-white">Evolución del saldo diario</h2>
          <p className="text-[11px] text-stone-400">Saldo al cierre de cada día</p>
        </div>

        <div className="inline-flex rounded-lg bg-stone-950 border border-stone-800 p-0.5">
          {RANGES.map((range) => (
            <button
              key={range.label}
              type="button"
              onClick={() => setRangeDays(range.days)}
              className={`px-3 py-1 rounded-md text-[11px] font-semibold transition ${
                rangeDays === range.days
                  ? "bg-orange-600 text-white"
                  : "text-stone-400 hover:text-white"
              }`}
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>

      {visiblePoints.length === 0 ? (
        <div className="h-[260px] flex items-center justify-center text-xs text-stone-500">
          Este maestro aún no tiene movimientos registrados.
        </div>
      ) : (
        <div className="h-[260px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={visiblePoints} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="balanceFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ea580c" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#ea580c" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#292524" strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="date"
                tickFormatter={formatShortDay}
                stroke="#78716c"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                minTickGap={24}
              />
              <YAxis
                tickFormatter={(value: number) => formatQuantity(value)}
                stroke="#78716c"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                width={56}
              />
              <Tooltip content={<BalanceTooltip unit={unit} />} />
              <Area
                type="linear"
                dataKey="balance"
                stroke="#f97316"
                strokeWidth={2}
                fill="url(#balanceFill)"
                dot={visiblePoints.length <= 31 ? { r: 3, fill: "#f97316" } : false}
                activeDot={{ r: 5 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
