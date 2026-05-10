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

type PricePoint = {
  label: string;
  detail: string;
  price: number;
  previousClose: number;
};

const ranges: RangeKey[] = ["1D", "5D", "1M", "6M", "YTD", "1Y", "5Y", "Max"];

const rangeConfig: Record<RangeKey, { points: number; drift: number; labelEvery: number; summary: string }> = {
  "1D": { points: 44, drift: 0.002, labelEvery: 10, summary: "today" },
  "5D": { points: 38, drift: 0.008, labelEvery: 8, summary: "5 days" },
  "1M": { points: 44, drift: 0.036, labelEvery: 10, summary: "1 month" },
  "6M": { points: 56, drift: 0.18, labelEvery: 12, summary: "6 months" },
  YTD: { points: 88, drift: 0.4997, labelEvery: 18, summary: "year to date" },
  "1Y": { points: 76, drift: 0.34, labelEvery: 16, summary: "1 year" },
  "5Y": { points: 90, drift: 2.2, labelEvery: 18, summary: "5 years" },
  Max: { points: 160, drift: 274.2914, labelEvery: 32, summary: "all time" },
};

function seededWave(seed: number, index: number, range: RangeKey) {
  const highFrequency = range === "Max" || range === "YTD" ? 0.46 : 0.72;
  return (
    Math.sin(index * highFrequency + seed) * 0.42 +
    Math.sin(index * 1.73 + seed * 0.45) * 0.22 +
    Math.sin(index * 0.19 + seed * 1.1) * 0.28
  );
}

function tickerSeed(ticker: string) {
  return ticker.split("").reduce((total, char) => total + char.charCodeAt(0), 0) / 37;
}

function monthLabel(monthIndex: number) {
  return ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][monthIndex % 12];
}

function formatLabel(range: RangeKey, index: number, points: number) {
  const progress = index / (points - 1);

  if (range === "1D") {
    const minutes = 9 * 60 + 30 + Math.round(progress * 390);
    const hour = Math.floor(minutes / 60);
    const minute = String(minutes % 60).padStart(2, "0");
    if (hour < 12) return `${hour}:${minute} AM`;
    if (hour === 12) return `12:${minute} PM`;
    return `${hour - 12}:${minute} PM`;
  }

  if (range === "5D") return `Day ${Math.round(progress * 4) + 1}`;
  if (range === "1M") return `Week ${Math.round(progress * 4) + 1}`;
  if (range === "6M") return monthLabel(10 + Math.round(progress * 5));
  if (range === "YTD") return monthLabel(Math.round(progress * 4));
  if (range === "1Y") return monthLabel(5 + Math.round(progress * 11));
  if (range === "5Y") return `${2021 + Math.round(progress * 5)}`;
  return `${1986 + Math.round(progress * 40)}`;
}

const maxHistoryAnchors = [
  { year: 1986, price: 3.26 },
  { year: 1990, price: 5.36 },
  { year: 1994, price: 9.5 },
  { year: 1998, price: 18 },
  { year: 2002, price: 26 },
  { year: 2006, price: 80 },
  { year: 2009, price: 42 },
  { year: 2011, price: 112 },
  { year: 2016, price: 78 },
  { year: 2018, price: 156 },
  { year: 2020, price: 117 },
  { year: 2021, price: 220 },
  { year: 2022, price: 180 },
  { year: 2023, price: 295 },
  { year: 2024, price: 365 },
  { year: 2025, price: 620 },
  { year: 2026, price: 897.45 },
];

function interpolateMaxHistory(progress: number, currentPrice: number, seed: number) {
  const startYear = maxHistoryAnchors[0].year;
  const endYear = maxHistoryAnchors[maxHistoryAnchors.length - 1].year;
  const year = startYear + (endYear - startYear) * progress;
  const nextIndex = maxHistoryAnchors.findIndex((anchor) => anchor.year >= year);
  const right = maxHistoryAnchors[Math.max(1, nextIndex)];
  const left = maxHistoryAnchors[Math.max(0, Math.max(1, nextIndex) - 1)];
  const segmentProgress = (year - left.year) / Math.max(1, right.year - left.year);
  const logLeft = Math.log(left.price);
  const logRight = Math.log(right.price);
  const base = Math.exp(logLeft + (logRight - logLeft) * segmentProgress);
  const jagged = 1 + Math.sin(progress * 92 + seed) * 0.06 + Math.sin(progress * 311 + seed * 0.7) * 0.035;

  return {
    year: Math.round(year),
    price: Math.max(0.01, Math.min(currentPrice, base * jagged)),
  };
}

function buildPriceData(company: IndustrialCompany, range: RangeKey) {
  const config = rangeConfig[range];
  const seed = tickerSeed(company.ticker);
  const previousClose = company.currentPrice / (1 + company.dayChange / 100);
  const startPrice = company.currentPrice / (1 + config.drift);

  return Array.from({ length: config.points }, (_, index) => {
    const progress = index / (config.points - 1);
    if (range === "Max") {
      const point = interpolateMaxHistory(progress, company.currentPrice, seed);

      return {
        label: String(point.year),
        detail: String(point.year),
        price: Number((index === config.points - 1 ? company.currentPrice : point.price).toFixed(2)),
        previousClose: Number(previousClose.toFixed(2)),
      };
    }

    const base = startPrice + (company.currentPrice - startPrice) * progress;
    const volatility =
      range === "1D"
        ? company.currentPrice * 0.0018
        : company.currentPrice * 0.018;
    const cycle = seededWave(seed, index, range) * volatility;
    const price = Math.max(0.01, base + cycle);

    return {
      label: formatLabel(range, index, config.points),
      detail: formatLabel(range, index, config.points),
      price: Number((index === config.points - 1 ? company.currentPrice : price).toFixed(2)),
      previousClose: Number(previousClose.toFixed(2)),
    };
  });
}

function formatChange(value: number) {
  const sign = value >= 0 ? "+" : "-";
  return `${sign}${Math.abs(value).toFixed(2)}`;
}

function rangeDescription(range: RangeKey) {
  return rangeConfig[range].summary;
}

function getRangeTicks(data: PricePoint[], range: RangeKey) {
  const every = rangeConfig[range].labelEvery;
  const ticks = data.filter((_, index) => index === 0 || index === data.length - 1 || index % every === 0).map((item) => item.label);
  return [...new Set(ticks)];
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
  const [range, setRange] = useState<RangeKey>("YTD");
  const [activePoint, setActivePoint] = useState<PricePoint | null>(null);
  const data = useMemo(() => buildPriceData(liveCompany, range), [liveCompany, range]);
  const previousClose = marketData?.previousClose ?? data[0]?.previousClose ?? liveCompany.currentPrice;
  const rangeStart = data[0]?.price ?? previousClose;
  const rangeChange = liveCompany.currentPrice - rangeStart;
  const rangePercent = rangeStart > 0 ? (rangeChange / rangeStart) * 100 : liveCompany.dayChange;
  const positive = rangeChange >= 0;
  const displayPoint = activePoint ?? data[data.length - 1];
  const pointChange = displayPoint ? displayPoint.price - rangeStart : rangeChange;
  const pointPercent = rangeStart > 0 ? (pointChange / rangeStart) * 100 : 0;
  const high = Math.max(...data.map((item) => item.price));
  const low = Math.min(...data.map((item) => item.price));
  const dayOpen = marketData?.open ?? Number((liveCompany.currentPrice * 1.0151).toFixed(2));
  const dayHigh = marketData?.high ?? Number((liveCompany.currentPrice * 1.0193).toFixed(2));
  const dayLow = marketData?.low ?? Number((liveCompany.currentPrice * 0.996).toFixed(2));
  const peRatio = marketData?.peRatio ?? 44.65;
  const dividendYield = marketData?.dividendYield ?? 0.67;
  const dividendPerShare = marketData?.dividendPerShare ?? 1.5;
  const fiftyTwoWeekHigh = marketData?.fiftyTwoWeekHigh ?? liveCompany.priceTarget;
  const fiftyTwoWeekLow = marketData?.fiftyTwoWeekLow ?? Number((liveCompany.currentPrice * 0.36).toFixed(2));
  const afterHoursPrice = Number((liveCompany.currentPrice * 1.0015).toFixed(2));
  const afterHoursChange = afterHoursPrice - liveCompany.currentPrice;
  const afterHoursPercent = (afterHoursChange / liveCompany.currentPrice) * 100;
  const yDomain: [number | string, number | string] =
    range === "Max" ? [Math.max(1, low * 0.75), high * 1.25] : ["dataMin - 1", "dataMax + 1"];

  return (
    <div className="min-h-[620px] rounded-xl border border-border bg-card p-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col gap-4">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{company.name}</p>
          <div className="mt-3 flex flex-wrap items-end gap-x-3 gap-y-2">
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
              {positive ? "↑" : "↓"} {Math.abs(rangePercent).toFixed(2)}%
            </span>
            <span className={cn("pb-2 text-sm font-semibold", positive ? "text-success" : "text-destructive")}>
              {formatChange(rangeChange)} {rangeDescription(range)}
            </span>
          </div>
          <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
            <span>Closed: May 8, 7:58 PM EDT</span>
            <span>
              After hours {afterHoursPrice.toFixed(2)} {formatChange(afterHoursChange)} ({formatChange(afterHoursPercent)}%)
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto border-b border-border pb-2">
          {ranges.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => {
                setRange(item);
                setActivePoint(null);
              }}
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

      <div className="mt-3 min-h-[330px]">
        <ResponsiveContainer width="100%" height={330}>
          <AreaChart
            data={data}
            margin={{ top: 18, right: 8, left: 6, bottom: 8 }}
            onMouseMove={(state) => {
              const point = state?.activePayload?.[0]?.payload as PricePoint | undefined;
              if (point) setActivePoint(point);
            }}
            onMouseLeave={() => setActivePoint(null)}
          >
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
              ticks={getRangeTicks(data, range)}
              tick={{ fill: "oklch(0.67 0 0)", fontSize: 12 }}
              minTickGap={range === "Max" ? 22 : 10}
              dy={8}
            />
            <YAxis
              domain={yDomain}
              scale={range === "Max" ? "log" : "auto"}
              allowDataOverflow={range === "Max"}
              orientation="left"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "oklch(0.67 0 0)", fontSize: 12 }}
              tickFormatter={(value) => Number(value).toFixed(0)}
            />
            <Tooltip
              cursor={{ stroke: "oklch(0.62 0 0)", strokeDasharray: "3 5" }}
              content={({ active, payload, label }) => {
                if (!active || !payload?.[0]) return null;
                const point = payload[0].payload as PricePoint;
                const change = point.price - rangeStart;
                const percent = rangeStart > 0 ? (change / rangeStart) * 100 : 0;

                return (
                  <div className="rounded-lg border border-border bg-card px-3 py-2 text-xs shadow-xl">
                    <p className="font-semibold text-foreground">{point.price.toFixed(2)} USD</p>
                    <p className="text-muted-foreground">{label}</p>
                    <p className={change >= 0 ? "text-success" : "text-destructive"}>
                      {formatChange(change)} ({formatChange(percent)}%)
                    </p>
                  </div>
                );
              }}
            />
            <ReferenceLine
              y={previousClose}
              stroke="oklch(0.62 0 0)"
              strokeDasharray="2 7"
              label={{
                value: `Previous close ${previousClose.toFixed(2)}`,
                position: "insideTopRight",
                fill: "oklch(0.65 0 0)",
                fontSize: 12,
              }}
            />
            <Area
              type="linear"
              dataKey="price"
              stroke={positive ? "oklch(0.72 0.13 145)" : "oklch(0.72 0.16 25)"}
              strokeWidth={2.5}
              fill={`url(#stockGradient-${company.ticker})`}
              dot={false}
              activeDot={{ r: 4, fill: "oklch(0.72 0.13 145)" }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-3 rounded-lg border border-border/70 bg-secondary/30 px-3 py-2 text-sm">
        <span className="text-muted-foreground">Selected: </span>
        <span className="font-medium text-foreground">{displayPoint?.detail}</span>
        <span className="mx-2 text-muted-foreground">·</span>
        <span className="font-medium text-foreground">{displayPoint?.price.toFixed(2)} USD</span>
        <span className={cn("ml-2 font-semibold", pointChange >= 0 ? "text-success" : "text-destructive")}>
          {formatChange(pointChange)} ({formatChange(pointPercent)}%)
        </span>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-x-8 gap-y-3 border-t border-border pt-4 text-sm sm:grid-cols-3">
        <Stat label="Open" value={dayOpen.toFixed(2)} />
        <Stat label="High" value={dayHigh.toFixed(2)} />
        <Stat label="Low" value={dayLow.toFixed(2)} />
        <Stat label="Mkt cap" value={`$${liveCompany.marketCap.toFixed(2)}B`} />
        <Stat label="P/E ratio" value={peRatio.toFixed(2)} />
        <Stat label="52-wk high" value={fiftyTwoWeekHigh.toFixed(2)} />
        <Stat label="Dividend" value={`${dividendYield.toFixed(2)}%`} />
        <Stat label="Qtrly Div Amt" value={dividendPerShare.toFixed(2)} />
        <Stat label="52-wk low" value={fiftyTwoWeekLow.toFixed(2)} />
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
