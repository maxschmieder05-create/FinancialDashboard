"use client";

import { MetricCard } from "@/components/dashboard/metric-card";
import { StockPerformanceChart } from "@/components/dashboard/charts/stock-performance-chart";
import { PipelineOverview } from "@/components/dashboard/charts/pipeline-overview";
import { RecentDeals } from "@/components/dashboard/recent-deals";
import { TopPerformers } from "@/components/dashboard/top-performers";
import { Building2, DollarSign, TrendingUp, Users } from "lucide-react";
import type { Section } from "@/app/page";
import { CompanySelector } from "@/components/dashboard/company-selector";
import { formatBillions, getCompany, topIndustrialCompanies } from "@/lib/industrials-data";
import { useMarketData } from "@/hooks/use-market-data";

export function OverviewSection({
  selectedTicker,
  onTickerChange,
  onSectionChange,
}: {
  selectedTicker: string;
  onTickerChange: (ticker: string) => void;
  onSectionChange: (section: Section) => void;
}) {
  const company = getCompany(selectedTicker);
  const { data: marketData, loading: marketDataLoading } = useMarketData(selectedTicker);
  const livePrice = marketData?.price ?? company.currentPrice;
  const liveChange = marketData?.changePercent ?? company.dayChange;
  const liveMarketCap = marketData?.marketCap ?? company.marketCap;
  const sectorMarketCap = topIndustrialCompanies.reduce((total, item) => total + item.marketCap, 0);
  const topPositive = topIndustrialCompanies.filter((item) => item.dayChange > 0).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-foreground">{company.name}</h2>
        </div>
        <CompanySelector selectedTicker={selectedTicker} onTickerChange={onTickerChange} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title={`${company.ticker} Market Cap`}
          value={formatBillions(liveMarketCap)}
          change={`${liveChange >= 0 ? "+" : ""}${liveChange.toFixed(2)}%`}
          changeType={liveChange >= 0 ? "positive" : "negative"}
          icon={DollarSign}
          delay={0}
        />
        <MetricCard
          title="Live Price"
          value={`$${livePrice.toFixed(2)}`}
          change={marketDataLoading ? "Refreshing..." : "Latest quote"}
          changeType="positive"
          icon={TrendingUp}
          delay={1}
        />
        <MetricCard
          title="Tracked Companies"
          value="25"
          change={`${topPositive} up today`}
          changeType="positive"
          icon={Building2}
          delay={2}
        />
        <MetricCard
          title="Top 25 Market Cap"
          value={formatBillions(sectorMarketCap)}
          change="Industrials universe"
          changeType="positive"
          icon={Users}
          delay={3}
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <StockPerformanceChart company={company} marketData={marketData} />
        </div>
        <PipelineOverview company={company} />
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentDeals onViewAll={() => onSectionChange("deals")} />
        <TopPerformers />
      </div>
    </div>
  );
}
