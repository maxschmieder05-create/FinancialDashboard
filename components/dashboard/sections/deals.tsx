"use client";

import { useMemo, useState } from "react";
import { CompanySelector } from "@/components/dashboard/company-selector";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { getCompany, recentIndustrialDeals } from "@/lib/industrials-data";
import { ArrowUpDown, ExternalLink, Handshake, Search } from "lucide-react";

export function DealsSection({
  selectedTicker,
  onTickerChange,
}: {
  selectedTicker: string;
  onTickerChange: (ticker: string) => void;
}) {
  const company = getCompany(selectedTicker);
  const [searchQuery, setSearchQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [companyOnly, setCompanyOnly] = useState(false);
  const [sortNewestFirst, setSortNewestFirst] = useState(true);

  const visibleDeals = useMemo(() => {
    const filtered = recentIndustrialDeals.filter((deal) => {
      const matchesCompany = !companyOnly || deal.ticker === selectedTicker;
      const matchesStatus = status === "all" || deal.status === status;
      const matchesSearch = `${deal.acquirer} ${deal.target} ${deal.rationale}`
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      return matchesCompany && matchesStatus && matchesSearch;
    });

    return sortNewestFirst ? filtered : [...filtered].reverse();
  }, [companyOnly, searchQuery, selectedTicker, sortNewestFirst, status]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Industrials M&A Deals</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Recent sector deals, with an optional filter for {company.ticker}.
          </p>
        </div>
        <CompanySelector selectedTicker={selectedTicker} onTickerChange={onTickerChange} />
      </div>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search M&A deals..."
              className="h-9 w-64 rounded-lg border border-border bg-secondary pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none"
            />
          </div>
          {["all", "Signed", "Completed", "Announced", "Contested"].map((item) => (
            <button
              key={item}
              onClick={() => setStatus(item)}
              className={cn(
                "rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
                status === item ? "bg-accent text-accent-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"
              )}
            >
              {item === "all" ? "All statuses" : item}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCompanyOnly((value) => !value)}
            className={cn(
              "rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
              companyOnly ? "bg-accent text-accent-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"
            )}
          >
            {company.ticker} only
          </button>
          <button
            onClick={() => setSortNewestFirst((value) => !value)}
            className="flex items-center gap-2 rounded-lg bg-secondary px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
          >
            <ArrowUpDown className="h-3.5 w-3.5" />
            {sortNewestFirst ? "Newest first" : "Oldest first"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {visibleDeals.map((deal, index) => (
          <Card
            key={deal.id}
            className="border-border bg-card animate-in fade-in slide-in-from-bottom-2"
            style={{ animationDelay: `${index * 60}ms`, animationFillMode: "both" }}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary text-accent">
                    <Handshake className="h-5 w-5" />
                  </div>
                  <div>
                    <a
                      href={deal.articleUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-base font-semibold text-foreground hover:text-accent"
                    >
                      {deal.acquirer}
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                    <p className="mt-1 text-sm text-muted-foreground">{deal.target}</p>
                  </div>
                </div>
                <Badge className="bg-secondary text-muted-foreground hover:bg-secondary">
                  {deal.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-lg bg-secondary p-3">
                  <p className="text-muted-foreground">Value</p>
                  <p className="font-semibold text-foreground">{deal.value}</p>
                </div>
                <div className="rounded-lg bg-secondary p-3">
                  <p className="text-muted-foreground">Date</p>
                  <p className="font-semibold text-foreground">{deal.date}</p>
                </div>
              </div>
              <p className="mt-4 text-sm leading-6 text-muted-foreground">{deal.rationale}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {visibleDeals.length === 0 && (
        <div className="rounded-xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">
          No deals match the current filters.
        </div>
      )}
    </div>
  );
}
