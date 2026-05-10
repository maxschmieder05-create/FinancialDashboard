"use client";

import { useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { IndustrialCompany } from "@/lib/industrials-data";
import type { MarketDataSnapshot } from "@/lib/market-data-types";
import { cn } from "@/lib/utils";

type RangeKey = "1D" | "5D" | "1M" | "6M" | "YTD" | "1Y" | "5Y" | "Max";

const ranges: RangeKey[] = ["1D", "5D", "1M", "6M", "YTD", "1Y", "5Y", "Max"];

const rangeConfig: Record<RangeKey, { points: number; drift: number; labelEvery: number }> = {
  "1D": { points: 28, drift: -0.002, labelEvery: 9 },
  "5D": { points: 26, drift: 0.008, labelEvery: 5 },
  "1M": { points: 30, drift: 0.026, labelEvery: 6 },
  "6M": { points: 32, drift: 0.09, labelEvery: 7 },
  YTD: { points: 34, drift: 0.14, labelEvery: 8 },
  "1Y": { points: 36, drift: 0.21, labelEvery: 9 },
  "5Y": { points: 40, drift: 0.68, labelEvery: 10 },
  Max: { points: 42, drift: 1.15, labelEvery: 10 },
};

function seededWave(seed: number, index: number) {
  return Math.sin(index * 0.82 + seed) * 0.72 + Math.sin(index * 0.27 + seed * 0.5) * 0.48;
}

function tickerSeed(ticker: string) {
  return ticker.split("").reduce((total, char) => total + char.charCodeAt(0), 0) / 37;
}

function buildPriceData(company: IndustrialCompany, range: RangeKey) {
  const config = rangeConfig[range];
  const seed = tickerSeed(company.ticker);
  const previousClose = company.currentPrice / (1 + company.dayChange / 100);
  const startPrice = company.currentPrice / (1 + config.drift);

  return Array.from({ length: config.points }, (_, index) => {
    const progress = index / (config.points - 1);
    const wave = seededWave(seed, index) * company.currentPrice * (range === "1D" ? 0.0026 : 0.0065);
    const middayDip =
      range === "1D" ? -Math.exp(-Math.pow((progress - 0.68) / 0.12, 2)) * company.currentPrice * 0.006 : 0;
    const price = startPrice + (company.currentPrice - startPrice) * progress + wave + middayDip;

    return {
      label: formatLabel(range, index, config.points),
      price: Number((index === config.points - 1 ? company.currentPrice : price).toFixed(2)),
      previousClose: Number(previousClose.toFixed(2)),
    };
  });
}

function formatLabel(range: RangeKey, index: number, points: number) {
  if (range === "1D") {
    const hour = 9 + Math.floor((index / (points - 1)) * 11);
    if (hour <= 11) return `${hour}:00 AM`;
    if (hour === 12) return "12:00 PM";
    return `${hour - 12}:00 PM`;
  }

  if (range === "5D") return `Day ${index + 1}`;
  if (range === "1M") return `W${Math.floor(index / 7) + 1}`;
  if (range === "6M") return ["Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][Math.floor(index / 5)] ?? "Dec";
  if (range === "YTD") return ["Jan", "Feb", "Mar", "Apr", "May"][Math.floor(index / 7)] ?? "May";
  if (range === "1Y") return ["Jun", "Aug", "Oct", "Dec", "Feb", "Apr"][Math.floor(index / 6)] ?? "May";
  if (range === "5Y") return `${2022 + Math.floor(index / 8)}`;
  return `${2018 + Math.floor(index / 6)}`;
}

export function StockPerformanceChart({
  company,
  marketData,
}: {
  company: IndustrialCompany;
  marketData?: MarketDataSnapshot | null;
}) {
  const liveCompany = {
    ...company,
    currentPrice: marketData?.price ?? company.currentPrice,
    dayChange: marketData?.changePercent ?? company.dayChange,
    priceTarget: marketData?.analystTargetPrice ?? company.priceTarget,
    marketCap: marketData?.marketCap ?? company.marketCap,
  };
  const [range, setRange] = useState<RangeKey>("1D");
  const data = useMemo(() => buildPriceData(liveCompany, range), [liveCompany, range]);
  const previousClose = marketData?.previousClose ?? data[0]?.previousClose ?? liveCompany.currentPrice;
  const dollarChange = marketData?.change ?? liveCompany.currentPrice - previousClose;
  const positive = dollarChange >= 0;
  const high = Math.max(...data.map((item) => item.price));
  const low = Math.min(...data.map((item) => item.price));

  return (
    <div className="h-[500px] rounded-xl border border-border bg-card p-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col gap-4">
        <div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">{company.name}</p>
            <div className="mt-3 flex flex-wrap items-end gap-x-3 gap-y-1">
              <span className="text-5xl font-medium tracking-normal text-foreground">
                {liveCompany.currentPrice.toFixed(2)}
              </span>
              <span className="pb-2 text-xl text-muted-foreground">USD</span>
              <span
                className={cn(
                  "mb-1 rounded-md px-3 py-1 text-base font-semibold",
                  positive ? "bg-success/25 text-success" : "bg-destructive/25 text-destructive"
                )}
              >
                {positive ? "↑" : "↓"} {Math.abs(liveCompany.dayChange).toFixed(2)}%
              </span>
              <span className={cn("pb-2 text-sm font-semibold", positive ? "text-success" : "text-destructive")}>
                {positive ? "+" : "-"}{Math.abs(dollarChange).toFixed(2)} today
              </span>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Source: {marketData?.source === "finnhub" ? "Finnhub" : marketData?.source === "alpha-vantage" ? "Alpha Vantage" : "Curated fallback"}
              {marketData?.note ? ` · ${marketData.note}` : ""}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto border-b border-border pb-2">
          {ranges.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setRange(item)}
              className={cn(
                "relative min-w-12 px-2 pb-2 pt-1 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground",
                range === item && "text-blue-300"
              )}
            >
              {item}
              {range === item && <span className="absolute inset-x-2 -bottom-[9px] h-1 rounded-full bg-blue-300" />}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-3 h-[235px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 14, right: 12, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id={`stockGradient-${company.ticker}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="oklch(0.72 0.13 145)" stopOpacity={0.32} />
                <stop offset="100%" stopColor="oklch(0.72 0.13 145)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="oklch(0.28 0.005 260)" vertical={false} />
            <XAxis
              dataKey="label"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "oklch(0.67 0 0)", fontSize: 12 }}
              interval={rangeConfig[range].labelEvery}
              dy={8}
            />
            <YAxis
              domain={["dataMin - 1", "dataMax + 1"]}
              orientation="right"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "oklch(0.67 0 0)", fontSize: 12 }}
              tickFormatter={(value) => Number(value).toFixed(0)}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "oklch(0.17 0.005 260)",
                border: "1px solid oklch(0.24 0.005 260)",
                borderRadius: "8px",
                color: "oklch(0.95 0 0)",
                fontSize: "12px",
              }}
              formatter={(value: number) => [`${Number(value).toFixed(2)} USD`, company.ticker]}
              labelStyle={{ color: "oklch(0.95 0 0)", fontWeight: 600 }}
            />
            <ReferenceLine
              y={previousClose}
              stroke="oklch(0.62 0 0)"
              strokeDasharray="2 7"
              label={{ value: `Previous close ${previousClose.toFixed(2)}`, position: "right", fill: "oklch(0.65 0 0)", fontSize: 12 }}
            />
            <Area
              type="monotone"
              dataKey="price"
              stroke={positive ? "oklch(0.72 0.13 145)" : "oklch(0.72 0.16 25)"}
              strokeWidth={3}
              fill={`url(#stockGradient-${company.ticker})`}
              dot={false}
              activeDot={{ r: 5, fill: "oklch(0.72 0.13 145)" }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-x-8 gap-y-2 border-t border-border pt-4 text-sm sm:grid-cols-3">
        <Stat label="Open" value={(marketData?.open ?? data[0]?.price ?? liveCompany.currentPrice).toFixed(2)} />
        <Stat label="High" value={(marketData?.high ?? high).toFixed(2)} />
        <Stat label="Low" value={(marketData?.low ?? low).toFixed(2)} />
        <Stat label="Mkt cap" value={`$${liveCompany.marketCap.toFixed(2)}B`} />
        <Stat label="P/E ratio" value="44.65" />
        <Stat label="Target" value={liveCompany.priceTarget.toFixed(2)} />
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex min-w-0 justify-between gap-4">
      <span className="text-muted-foreground">{label}</span>
      <span className="truncate font-medium text-foreground">{value}</span>
    </div>
  );
}
