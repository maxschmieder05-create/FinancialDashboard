"use client";

import { useMemo, useState } from "react";
import { CompanySelector } from "@/components/dashboard/company-selector";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { formatBillions, getCompany } from "@/lib/industrials-data";
import { Building2, DollarSign, Factory, Plus, TrendingUp } from "lucide-react";

const stages = ["Prospect", "Qualified", "Proposal", "Strategic Account"] as const;

export function PipelineSection({
  selectedTicker,
  onTickerChange,
}: {
  selectedTicker: string;
  onTickerChange: (ticker: string) => void;
}) {
  const company = getCompany(selectedTicker);
  const [priority, setPriority] = useState("all");

  const opportunities = useMemo(
    () =>
      [...company.topClients, ...company.futureCustomers].map((name, index) => ({
        id: `${company.ticker}-${index}`,
        name,
        stage: stages[Math.min(stages.length - 1, Math.floor(index / 2))],
        value: Math.round((company.revenue * (0.012 + index * 0.003)) * 100) / 100,
        probability: Math.min(90, 30 + index * 8),
        priority: index < 3 ? "core" : index < 5 ? "expansion" : "future",
      })),
    [company]
  );

  const filtered = priority === "all" ? opportunities : opportunities.filter((item) => item.priority === priority);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-foreground">{company.ticker} Sales Workspace</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Account opportunities tailored to {company.name}.
          </p>
        </div>
        <CompanySelector selectedTicker={selectedTicker} onTickerChange={onTickerChange} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "Company Revenue", value: formatBillions(company.revenue), icon: DollarSign },
          { label: "Tracked Accounts", value: opportunities.length.toString(), icon: Building2 },
          { label: "Avg Probability", value: `${Math.round(opportunities.reduce((sum, item) => sum + item.probability, 0) / opportunities.length)}%`, icon: TrendingUp },
          { label: "Primary Segment", value: company.industry, icon: Factory },
        ].map((stat) => (
          <Card key={stat.label} className="border-border bg-card">
            <CardContent className="p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="mt-1 text-lg font-semibold text-foreground">{stat.value}</p>
                </div>
                <stat.icon className="h-6 w-6 shrink-0 text-accent" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {["all", "core", "expansion", "future"].map((item) => (
          <button
            key={item}
            onClick={() => setPriority(item)}
            className={cn(
              "rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
              priority === item
                ? "bg-accent text-accent-foreground"
                : "bg-secondary text-muted-foreground hover:text-foreground"
            )}
          >
            {item === "all" ? "All accounts" : item.charAt(0).toUpperCase() + item.slice(1)}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {stages.map((stage) => {
          const stageDeals = filtered.filter((deal) => deal.stage === stage);
          const total = stageDeals.reduce((sum, deal) => sum + deal.value, 0);

          return (
            <Card key={stage} className="border-border bg-card min-h-[430px]">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between gap-3">
                  <CardTitle className="text-sm font-semibold">{stage}</CardTitle>
                  <Badge variant="outline" className="border-border text-muted-foreground">
                    {formatBillions(total)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {stageDeals.map((deal, index) => (
                  <div
                    key={deal.id}
                    className="rounded-lg border border-border bg-background p-4 animate-in fade-in slide-in-from-bottom-2"
                    style={{ animationDelay: `${index * 50}ms`, animationFillMode: "both" }}
                  >
                    <div className="mb-3 flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-medium text-foreground">{deal.name}</p>
                        <p className="text-xs text-muted-foreground">{deal.priority} account</p>
                      </div>
                      <Badge className="bg-secondary text-muted-foreground hover:bg-secondary">
                        {formatBillions(deal.value)}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Win probability</span>
                      <span className="font-medium text-foreground">{deal.probability}%</span>
                    </div>
                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-secondary">
                      <div className="h-full rounded-full bg-accent" style={{ width: `${deal.probability}%` }} />
                    </div>
                  </div>
                ))}
                <button className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-border py-2 text-sm text-muted-foreground hover:border-accent/50 hover:text-foreground">
                  <Plus className="h-4 w-4" />
                  Add account thesis
                </button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
