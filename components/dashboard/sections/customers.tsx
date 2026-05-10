"use client";

import { useMemo, useState } from "react";
import { CompanySelector } from "@/components/dashboard/company-selector";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { formatBillions, getCompany } from "@/lib/industrials-data";
import { Building2, Search, Star, TrendingUp, Users } from "lucide-react";

export function CustomersSection({
  selectedTicker,
  onTickerChange,
}: {
  selectedTicker: string;
  onTickerChange: (ticker: string) => void;
}) {
  const company = getCompany(selectedTicker);
  const [searchQuery, setSearchQuery] = useState("");
  const [view, setView] = useState("current");

  const customers = useMemo(() => {
    const current = company.topClients.map((name, index) => ({
      id: `${company.ticker}-current-${index}`,
      name,
      type: "current",
      revenue: Math.round(company.revenue * (0.12 - index * 0.012) * 100) / 100,
      score: Math.max(72, 94 - index * 5),
      note: index < 2 ? "Strategic account" : "Core installed base",
    }));
    const future = company.futureCustomers.map((name, index) => ({
      id: `${company.ticker}-future-${index}`,
      name,
      type: "future",
      revenue: Math.round(company.revenue * (0.05 - index * 0.006) * 100) / 100,
      score: Math.max(58, 78 - index * 6),
      note: "Forecast opportunity",
    }));
    return [...current, ...future];
  }, [company]);

  const filteredCustomers = customers.filter((customer) => {
    const matchesSearch = customer.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesView = view === "all" || customer.type === view;
    return matchesSearch && matchesView;
  });

  const currentCount = customers.filter((customer) => customer.type === "current").length;
  const futureCount = customers.length - currentCount;
  const totalModeledRevenue = customers.reduce((sum, customer) => sum + customer.revenue, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-foreground">{company.ticker} Customer Map</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Top clients and future customer pools for {company.name}.
          </p>
        </div>
        <CompanySelector selectedTicker={selectedTicker} onTickerChange={onTickerChange} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "Current Top Clients", value: currentCount.toString(), icon: Building2 },
          { label: "Future Pools", value: futureCount.toString(), icon: Users },
          { label: "Modeled Revenue", value: formatBillions(totalModeledRevenue), icon: TrendingUp },
          { label: "Avg Fit Score", value: `${Math.round(customers.reduce((sum, item) => sum + item.score, 0) / customers.length)}%`, icon: Star },
        ].map((stat) => (
          <Card key={stat.label} className="border-border bg-card">
            <CardContent className="p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="mt-1 text-2xl font-semibold text-foreground">{stat.value}</p>
                </div>
                <stat.icon className="h-7 w-7 text-accent opacity-80" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search clients..."
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            className="w-[280px] bg-secondary pl-10 border-border focus:border-accent"
          />
        </div>
        <div className="flex items-center gap-2">
          {["all", "current", "future"].map((item) => (
            <button
              key={item}
              onClick={() => setView(item)}
              className={cn(
                "rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
                view === item ? "bg-accent text-accent-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"
              )}
            >
              {item === "all" ? "All clients" : item === "current" ? "Current" : "Future"}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredCustomers.map((customer, index) => (
          <Card
            key={customer.id}
            className="border-border bg-card hover:border-accent/50 transition-colors animate-in fade-in slide-in-from-bottom-2"
            style={{ animationDelay: `${index * 70}ms`, animationFillMode: "both" }}
          >
            <CardContent className="p-5">
              <div className="mb-4 flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Avatar className="h-11 w-11 bg-secondary">
                    <AvatarFallback className="bg-secondary text-sm font-semibold text-foreground">
                      {customer.name
                        .split(" ")
                        .map((part) => part[0])
                        .join("")
                        .slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold text-foreground">{customer.name}</h3>
                    <p className="text-sm text-muted-foreground">{customer.note}</p>
                  </div>
                </div>
                <Badge
                  className={
                    customer.type === "current"
                      ? "bg-accent/20 text-accent border-accent/30"
                      : "bg-chart-1/20 text-chart-1 border-chart-1/30"
                  }
                >
                  {customer.type === "current" ? "Current" : "Future"}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-lg bg-secondary p-3">
                  <p className="text-muted-foreground">Modeled Revenue</p>
                  <p className="font-semibold text-foreground">{formatBillions(customer.revenue)}</p>
                </div>
                <div className="rounded-lg bg-secondary p-3">
                  <p className="text-muted-foreground">Fit Score</p>
                  <p className="font-semibold text-foreground">{customer.score}%</p>
                </div>
              </div>
              <div className="mt-4 h-2 overflow-hidden rounded-full bg-secondary">
                <div className="h-full rounded-full bg-accent" style={{ width: `${customer.score}%` }} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
