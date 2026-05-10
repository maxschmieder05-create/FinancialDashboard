"use client";

import { ChevronDown } from "lucide-react";
import type { IndustrialCompany } from "@/lib/industrials-data";
import { topIndustrialCompanies } from "@/lib/industrials-data";
import { cn } from "@/lib/utils";

function formatPrice(company: IndustrialCompany) {
  return `${company.currentPrice.toLocaleString(undefined, { maximumFractionDigits: 2 })} USD`;
}

const companyOverviewCopy: Record<string, string> = {
  CAT: "Caterpillar Inc. is an American construction, mining, and engineering equipment manufacturer. The company is one of the world's largest makers of construction equipment and diesel and natural gas engines.",
  DE: "Deere & Company manufactures agricultural, construction, forestry, and turf equipment, with a global dealer network and a large financing arm.",
  GE: "GE Aerospace designs and services aircraft engines, systems, and avionics for commercial and defense customers around the world.",
  RTX: "RTX Corporation is an aerospace and defense company with Collins Aerospace, Pratt & Whitney, and Raytheon defense systems.",
};

function wikipediaUrl(company: IndustrialCompany) {
  return `https://en.wikipedia.org/wiki/${encodeURIComponent(company.name.replace(/ Inc\\.?| Corporation| plc| Limited| Company/g, "").trim())}`;
}

export function PipelineOverview({ company }: { company: IndustrialCompany }) {
  const related = topIndustrialCompanies
    .filter((item) => item.ticker !== company.ticker)
    .sort((a, b) => {
      const aIndustry = a.industry === company.industry ? 0 : 1;
      const bIndustry = b.industry === company.industry ? 0 : 1;
      return aIndustry - bIndustry || b.marketCap - a.marketCap;
    })
    .slice(0, 4);
  const quarterlyRevenue = company.revenue / 4;
  const yYRevenueGrowth = ((company.revenueForecast[0] - company.revenue) / company.revenue) * 100;
  const epsBeat = Math.max(2.8, Math.min(19.3, company.dayChange * 4 + 8.3));
  const revenueBeat = Math.max(1.2, Math.min(7.8, yYRevenueGrowth + 2));

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-xl border border-border bg-card animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
        <div className="grid grid-cols-2 border-b border-border text-sm font-semibold">
          <button className="border-b-2 border-blue-300 px-4 py-3 text-foreground">Related</button>
          <button className="px-4 py-3 text-muted-foreground">Following</button>
        </div>
        {related.map((item) => {
          const positive = item.dayChange >= 0;

          return (
            <div key={item.ticker} className="flex items-center justify-between border-b border-border/70 px-4 py-3 last:border-b-0">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-foreground">{item.name}</p>
                <p className="text-xs text-muted-foreground">{formatPrice(item)}</p>
              </div>
              <span
                className={cn(
                  "ml-3 rounded-md px-2 py-1 text-xs font-semibold",
                  positive ? "bg-success/25 text-success" : "bg-destructive/25 text-destructive"
                )}
              >
                {positive ? "↑" : "↓"} {Math.abs(item.dayChange).toFixed(2)}%
              </span>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-base font-semibold text-foreground">Quarterly financials</p>
              <p className="text-sm text-muted-foreground">2026 Q1</p>
            </div>
            <ChevronDown className="h-5 w-5 text-muted-foreground" />
          </div>
          <p className="mt-6 text-2xl font-semibold text-foreground">{quarterlyRevenue.toFixed(2)}B</p>
          <p className={cn("mt-1 text-sm font-semibold", yYRevenueGrowth >= 0 ? "text-success" : "text-destructive")}>
            {yYRevenueGrowth >= 0 ? "+" : ""}
            {yYRevenueGrowth.toFixed(2)}% Y/Y Revenue
          </p>
        </div>

        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-base font-semibold text-foreground">Earnings</p>
              <p className="text-sm text-muted-foreground">Q1 2026</p>
            </div>
            <ChevronDown className="h-5 w-5 text-muted-foreground" />
          </div>
          <div className="mt-6 grid grid-cols-2 gap-3">
            <div>
              <p className="text-xl font-semibold text-success">+{epsBeat.toFixed(2)}%</p>
              <p className="text-sm font-medium text-foreground">EPS Beat</p>
            </div>
            <div>
              <p className="text-xl font-semibold text-success">+{revenueBeat.toFixed(2)}%</p>
              <p className="text-sm font-medium text-foreground">Revenue Beat</p>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-4">
        <h3 className="text-base font-semibold text-foreground">Overview</h3>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          {companyOverviewCopy[company.ticker] ??
            `${company.name} is a large industrial company in ${company.industry.toLowerCase()}, tracked here for market performance, quarterly fundamentals, earnings, and comparable public companies.`}{" "}
          <a href={wikipediaUrl(company)} target="_blank" rel="noreferrer" className="font-medium text-blue-300 hover:text-blue-200">
            Wikipedia
          </a>
        </p>
      </div>
    </div>
  );
}
