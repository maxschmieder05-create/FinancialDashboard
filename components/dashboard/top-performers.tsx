"use client";

import { Trophy, TrendingUp } from "lucide-react";
import { formatBillions, topIndustrialCompanies } from "@/lib/industrials-data";

export function TopPerformers() {
  const performers = [...topIndustrialCompanies]
    .sort((a, b) => b.dayChange - a.dayChange)
    .slice(0, 5);

  return (
    <div className="bg-card border border-border rounded-xl p-5 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-base font-semibold text-foreground">Top Performers</h3>
          <p className="text-sm text-muted-foreground mt-0.5">Best daily movers in the top 25</p>
        </div>
        <div className="flex items-center gap-1 text-warning">
          <Trophy className="w-5 h-5" />
        </div>
      </div>

      <div className="space-y-3">
        {performers.map((company, index) => (
          <div
            key={company.ticker}
            className="group flex items-center justify-between p-3 rounded-lg hover:bg-secondary/50 transition-all duration-200 cursor-pointer animate-in fade-in slide-in-from-right-2"
            style={{ animationDelay: `${(index + 4) * 100}ms`, animationFillMode: "both" }}
          >
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent/80 to-chart-1 flex items-center justify-center text-sm font-semibold text-accent-foreground">
                  {company.ticker}
                </div>
                {index < 3 && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-warning text-[10px] font-bold flex items-center justify-center text-background">
                    {index + 1}
                  </div>
                )}
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">{company.name}</p>
                <p className="text-xs text-muted-foreground">{company.industry}</p>
              </div>
            </div>

            <div className="text-right">
              <p className="text-sm font-semibold text-foreground">{formatBillions(company.marketCap)}</p>
              <div className="flex items-center justify-end gap-1 text-xs text-success">
                <TrendingUp className="w-3 h-3" />
                +{company.dayChange.toFixed(2)}%
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
