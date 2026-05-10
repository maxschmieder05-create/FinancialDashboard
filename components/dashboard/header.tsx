"use client";

import { cn } from "@/lib/utils";
import type { Section } from "@/app/page";
import { Bell, Calendar, Search, Settings, X } from "lucide-react";
import { useState } from "react";
import { CompanySelector } from "@/components/dashboard/company-selector";
import { topIndustrialCompanies } from "@/lib/industrials-data";

interface HeaderProps {
  activeSection: Section;
  selectedTicker: string;
  onTickerChange: (ticker: string) => void;
  onSectionChange: (section: Section) => void;
}

const sectionTitles: Record<Section, string> = {
  overview: "Overview",
  pipeline: "Sales",
  deals: "Deals",
  customers: "Customers",
  forecasting: "Forecasting",
};

const quickResults: { label: string; section: Section; detail: string }[] = [
  ...topIndustrialCompanies.slice(0, 8).map((company) => ({
    label: `${company.ticker} ${company.name}`,
    section: "overview" as Section,
    detail: company.industry,
  })),
  { label: "Industrials M&A", section: "deals", detail: "Recent sector transactions" },
  { label: "Revenue Forecast", section: "forecasting", detail: "Company revenue and price outlook" },
  { label: "Top Clients", section: "customers", detail: "Customer concentration by company" },
];

export function Header({ activeSection, selectedTicker, onTickerChange, onSectionChange }: HeaderProps) {
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const filteredResults = quickResults.filter((result) =>
    result.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <header className="h-16 border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-30 flex items-center justify-between px-6">
      <div className="flex items-center gap-6">
        <h1 className="text-xl font-semibold text-foreground">
          {sectionTitles[activeSection]}
        </h1>
        <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="w-4 h-4" />
          <span>Top 25 industrials</span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden lg:block">
          <CompanySelector selectedTicker={selectedTicker} onTickerChange={onTickerChange} compact />
        </div>
        {/* Search */}
        <div
          className={cn(
            "relative flex items-center transition-all duration-300",
            searchFocused ? "w-64" : "w-48"
          )}
        >
          <Search className="absolute left-3 w-4 h-4 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => window.setTimeout(() => setSearchFocused(false), 120)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && filteredResults[0]) {
                onSectionChange(filteredResults[0].section);
                const ticker = topIndustrialCompanies.find((company) =>
                  filteredResults[0].label.startsWith(company.ticker)
                )?.ticker;
                if (ticker) onTickerChange(ticker);
                setSearchQuery("");
              }
            }}
            className="w-full h-9 pl-9 pr-4 rounded-lg bg-secondary border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-accent transition-all duration-200"
          />
          {searchFocused && searchQuery && (
            <div className="absolute right-0 top-11 w-80 rounded-lg border border-border bg-card shadow-xl overflow-hidden">
              {filteredResults.length > 0 ? (
                filteredResults.map((result) => (
                  <button
                    key={result.label}
                    onMouseDown={() => {
                      onSectionChange(result.section);
                      const ticker = topIndustrialCompanies.find((company) =>
                        result.label.startsWith(company.ticker)
                      )?.ticker;
                      if (ticker) onTickerChange(ticker);
                      setSearchQuery("");
                    }}
                    className="w-full px-4 py-3 text-left hover:bg-secondary transition-colors"
                  >
                    <span className="block text-sm font-medium text-foreground">{result.label}</span>
                    <span className="block text-xs text-muted-foreground">{result.detail}</span>
                  </button>
                ))
              ) : (
                <div className="px-4 py-3 text-sm text-muted-foreground">No matching records</div>
              )}
            </div>
          )}
        </div>

        {/* Notifications */}
        <button
          onClick={() => setNotificationsOpen((open) => !open)}
          className="relative w-9 h-9 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-all duration-200"
          aria-label="Toggle notifications"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-accent rounded-full animate-pulse" />
        </button>

        {/* User avatar */}
        <button
          className="w-9 h-9 rounded-lg overflow-hidden bg-secondary ring-2 ring-transparent hover:ring-accent/50 transition-all duration-200"
          aria-label="User profile"
        >
          <div className="w-full h-full bg-gradient-to-br from-accent/80 to-chart-1 flex items-center justify-center text-xs font-semibold text-accent-foreground">
            JD
          </div>
        </button>
      </div>
      {notificationsOpen && (
        <div className="absolute right-6 top-14 w-80 rounded-xl border border-border bg-card shadow-xl">
          <div className="flex items-center justify-between border-b border-border p-4">
            <div>
              <p className="text-sm font-semibold text-foreground">Notifications</p>
              <p className="text-xs text-muted-foreground">3 updates need attention</p>
            </div>
            <button
              onClick={() => setNotificationsOpen(false)}
              className="rounded-md p-1 text-muted-foreground hover:bg-secondary hover:text-foreground"
              aria-label="Close notifications"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          {[
            `${selectedTicker} forecast refreshed`,
            "Industrials M&A screen updated",
            "Customer concentration model ready",
          ].map((item) => (
            <button
              key={item}
              onClick={() => {
                if (item.includes("forecast")) onSectionChange("forecasting");
                if (item.includes("M&A")) onSectionChange("deals");
                if (item.includes("Customer")) onSectionChange("customers");
                setNotificationsOpen(false);
              }}
              className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-secondary"
            >
              <Settings className="h-4 w-4 text-accent" />
              <span className="text-sm text-foreground">{item}</span>
            </button>
          ))}
        </div>
      )}
    </header>
  );
}
