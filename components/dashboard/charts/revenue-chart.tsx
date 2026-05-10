"use client";

import { useState, useEffect } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceArea,
} from "recharts";

const data = [
  { month: "Jan", revenue: 186000, target: 180000 },
  { month: "Feb", revenue: 205000, target: 190000 },
  { month: "Mar", revenue: 237000, target: 200000 },
  { month: "Apr", revenue: 273000, target: 220000 },
  { month: "May", revenue: 209000, target: 230000 },
  { month: "Jun", revenue: 314000, target: 250000 },
  { month: "Jul", revenue: 352000, target: 270000 },
  { month: "Aug", revenue: 389000, target: 290000 },
  { month: "Sep", revenue: 421000, target: 310000 },
  { month: "Oct", revenue: 458000, target: 330000 },
  { month: "Nov", revenue: 492000, target: 350000 },
  { month: "Dec", revenue: 547000, target: 380000 },
];

export function RevenueChart() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [dragStart, setDragStart] = useState<string | null>(null);
  const [dragEnd, setDragEnd] = useState<string | null>(null);
  const [selection, setSelection] = useState<{
    start: string;
    end: string;
    change: number;
    percent: number;
  } | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 300);
    return () => clearTimeout(timer);
  }, []);

  const getIndex = (month: string | null) => data.findIndex((item) => item.month === month);

  const updateSelection = (startLabel: string | null, endLabel: string | null) => {
    const startIndex = getIndex(startLabel);
    const endIndex = getIndex(endLabel);

    if (startIndex < 0 || endIndex < 0 || startIndex === endIndex) return;

    const [from, to] = startIndex < endIndex ? [startIndex, endIndex] : [endIndex, startIndex];
    const start = data[from];
    const end = data[to];
    const change = end.revenue - start.revenue;

    setSelection({
      start: start.month,
      end: end.month,
      change,
      percent: (change / start.revenue) * 100,
    });
  };

  const handleMouseDown = (state: { activeLabel?: string }) => {
    if (!state.activeLabel) return;
    setDragStart(state.activeLabel);
    setDragEnd(state.activeLabel);
    setSelection(null);
  };

  const handleMouseMove = (state: { activeLabel?: string }) => {
    if (!dragStart || !state.activeLabel) return;
    setDragEnd(state.activeLabel);
    updateSelection(dragStart, state.activeLabel);
  };

  const handleMouseUp = () => {
    updateSelection(dragStart, dragEnd);
    setDragStart(null);
    setDragEnd(null);
  };

  const referenceStart =
    dragStart && dragEnd && getIndex(dragStart) <= getIndex(dragEnd) ? dragStart : dragEnd;
  const referenceEnd =
    dragStart && dragEnd && getIndex(dragStart) <= getIndex(dragEnd) ? dragEnd : dragStart;

  return (
    <div className="bg-card border border-border rounded-xl p-5 h-[380px] animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-base font-semibold text-foreground">Revenue Trend</h3>
          <p className="text-sm text-muted-foreground mt-0.5">Monthly performance vs target</p>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-chart-1" />
            <span className="text-muted-foreground">Revenue</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-chart-2" />
            <span className="text-muted-foreground">Target</span>
          </div>
        </div>
        {selection && (
          <div className="rounded-lg border border-border bg-secondary/70 px-3 py-2 text-right">
            <p className="text-xs text-muted-foreground">
              {selection.start}-{selection.end}
            </p>
            <p className={selection.change >= 0 ? "text-sm font-semibold text-success" : "text-sm font-semibold text-destructive"}>
              {selection.change >= 0 ? "+" : ""}${Math.abs(selection.change / 1000).toFixed(0)}k{" "}
              ({selection.percent >= 0 ? "+" : ""}
              {selection.percent.toFixed(1)}%)
            </p>
          </div>
        )}
      </div>

      <div className={`h-[280px] transition-opacity duration-700 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            <defs>
              <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="oklch(0.7 0.18 220)" stopOpacity={0.4} />
                <stop offset="100%" stopColor="oklch(0.7 0.18 220)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="targetGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="oklch(0.7 0.18 145)" stopOpacity={0.3} />
                <stop offset="100%" stopColor="oklch(0.7 0.18 145)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.22 0.005 260)" vertical={false} />
            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "oklch(0.65 0 0)", fontSize: 12 }}
              dy={10}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "oklch(0.65 0 0)", fontSize: 12 }}
              tickFormatter={(value) => `$${value / 1000}k`}
              dx={-10}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "oklch(0.12 0.005 260)",
                border: "1px solid oklch(0.22 0.005 260)",
                borderRadius: "8px",
                fontSize: "12px",
              }}
              labelStyle={{ color: "oklch(0.95 0 0)", fontWeight: 600 }}
              itemStyle={{ color: "oklch(0.65 0 0)" }}
              formatter={(value: number) => [`$${(value / 1000).toFixed(0)}k`, ""]}
            />
            {referenceStart && referenceEnd && referenceStart !== referenceEnd && (
              <ReferenceArea
                x1={referenceStart}
                x2={referenceEnd}
                strokeOpacity={0}
                fill="oklch(0.7 0.18 145)"
                fillOpacity={0.12}
              />
            )}
            <Area
              type="monotone"
              dataKey="target"
              stroke="oklch(0.7 0.18 145)"
              strokeWidth={2}
              fill="url(#targetGradient)"
              dot={false}
            />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="oklch(0.7 0.18 220)"
              strokeWidth={2}
              fill="url(#revenueGradient)"
              dot={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
