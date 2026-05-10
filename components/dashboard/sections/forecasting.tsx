"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { CompanySelector } from "@/components/dashboard/company-selector";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { fetchEdgarFinancials, type EdgarFinancials, type StatementKey } from "@/lib/edgar-financials";
import { financeApiProviders, formatBillions, getCompany } from "@/lib/industrials-data";
import { useMarketData } from "@/hooks/use-market-data";
import { Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { FileText, RefreshCw, Target, TrendingUp, Users } from "lucide-react";

function formatStatementValue(value?: number) {
  if (typeof value !== "number") return "—";

  const absValue = Math.abs(value);
  const sign = value < 0 ? "-" : "";

  if (absValue >= 1_000_000_000) return `${sign}$${(absValue / 1_000_000_000).toFixed(1)}B`;
  if (absValue >= 1_000_000) return `${sign}$${(absValue / 1_000_000).toFixed(0)}M`;

  return `${sign}$${absValue.toLocaleString()}`;
}

const statementLabels: Record<StatementKey, string> = {
  income: "Income Statement",
  balance: "Balance Sheet",
  cashflow: "Cash Flow",
};

export function ForecastingSection({
  selectedTicker,
  onTickerChange,
}: {
  selectedTicker: string;
  onTickerChange: (ticker: string) => void;
}) {
  const company = getCompany(selectedTicker);
  const { data: marketData, loading: marketDataLoading } = useMarketData(selectedTicker);
  const livePriceTarget = marketData?.analystTargetPrice ?? company.priceTarget;
  const liveCurrentPrice = marketData?.price ?? company.currentPrice;
  const [view, setView] = useState("revenue");
  const [activeTab, setActiveTab] = useState<"forecast" | "statements">("forecast");
  const [statementView, setStatementView] = useState<StatementKey>("income");
  const [granularity, setGranularity] = useState<"annual" | "quarterly">("quarterly");
  const [lastRefresh, setLastRefresh] = useState("Model loaded");
  const [edgarData, setEdgarData] = useState<EdgarFinancials | null>(null);
  const [edgarLoading, setEdgarLoading] = useState(false);
  const [edgarError, setEdgarError] = useState<string | null>(null);

  const loadEdgarStatements = useCallback(async () => {
    setEdgarLoading(true);
    setEdgarError(null);

    try {
      setEdgarData(await fetchEdgarFinancials(selectedTicker));
    } catch (error) {
      setEdgarData(null);
      setEdgarError(error instanceof Error ? error.message : "Unable to load EDGAR financial statements.");
    } finally {
      setEdgarLoading(false);
    }
  }, [selectedTicker]);

  useEffect(() => {
    void loadEdgarStatements();
  }, [loadEdgarStatements]);

  const forecastData = useMemo(
    () => {
      const yearlyData = ["2026", "2027", "2028", "2029"].map((period, index) => ({
        period,
        revenue: company.revenueForecast[index],
        stockPrice: index === 0 ? livePriceTarget : company.stockForecast[index],
        customers: company.topClients.length + company.futureCustomers.length + index * 2,
      }));

      if (granularity === "annual") return yearlyData;

      return yearlyData.flatMap((yearData, yearIndex) => {
        const previous =
          yearIndex === 0
            ? {
                revenue: company.revenue,
                stockPrice: liveCurrentPrice,
                customers: company.topClients.length,
              }
            : yearlyData[yearIndex - 1];
        const quarters = ["Q1", "Q2", "Q3", "Q4"];

        return quarters.map((quarter, quarterIndex) => {
          const progress = (quarterIndex + 1) / 4;

          return {
            period: `${yearData.period} ${quarter}`,
            revenue: Number((previous.revenue + (yearData.revenue - previous.revenue) * progress).toFixed(1)),
            stockPrice: Number((previous.stockPrice + (yearData.stockPrice - previous.stockPrice) * progress).toFixed(2)),
            customers: Math.round(previous.customers + (yearData.customers - previous.customers) * progress),
          };
        });
      });
    },
    [company, granularity, liveCurrentPrice, livePriceTarget]
  );

  const customerForecast = useMemo(
    () =>
      company.futureCustomers.map((name, index) => ({
        name,
        probability: 72 - index * 9,
        potential: Math.round(company.revenue * (0.045 - index * 0.006) * 100) / 100,
      })),
    [company]
  );

  const revenueCagr = Math.pow(company.revenueForecast[3] / company.revenueForecast[0], 1 / 3) - 1;
  const priceUpside = ((livePriceTarget - liveCurrentPrice) / liveCurrentPrice) * 100;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-foreground">{company.ticker} Forecasting</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Toggle between forecast models and SEC EDGAR financial statements.
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <CompanySelector selectedTicker={selectedTicker} onTickerChange={onTickerChange} />
          <Button
            variant="outline"
            size="sm"
            onClick={() => setLastRefresh(`Updated ${new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}`)}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "forecast" | "statements")} className="space-y-4">
        <TabsList className="bg-secondary border border-border p-1">
          <TabsTrigger value="forecast" className="px-3">
            <TrendingUp className="h-4 w-4" />
            Forecast
          </TabsTrigger>
          <TabsTrigger value="statements" className="px-3">
            <FileText className="h-4 w-4" />
            EDGAR Statements
          </TabsTrigger>
        </TabsList>

        <TabsContent value="forecast" className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="flex flex-wrap items-center gap-2">
        {[
          ["revenue", "Revenue"],
          ["stock", "Stock price"],
          ["customers", "Future customers"],
        ].map(([id, label]) => (
          <button
            key={id}
            onClick={() => setView(id)}
            className={
              view === id
                ? "rounded-lg bg-accent px-3 py-1.5 text-xs font-medium text-accent-foreground"
                : "rounded-lg bg-secondary px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
            }
          >
            {label}
          </button>
        ))}
        <div className="ml-0 flex rounded-lg border border-border bg-secondary p-1 sm:ml-2">
          {[
            ["quarterly", "Quarterly"],
            ["annual", "Annual"],
          ].map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setGranularity(id as "annual" | "quarterly")}
              className={
                granularity === id
                  ? "rounded-md bg-accent px-3 py-1 text-xs font-medium text-accent-foreground"
                  : "rounded-md px-3 py-1 text-xs font-medium text-muted-foreground hover:text-foreground"
              }
            >
              {label}
            </button>
          ))}
        </div>
        <Badge variant="outline" className="ml-auto border-border text-muted-foreground">
          {lastRefresh}
        </Badge>
      </div>

      <Card className="border-border bg-card">
        <CardContent className="p-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">Projection Data Inputs</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Live price and analyst forecast inputs use the secure server route backed by Finnhub first, Alpha Vantage second, then curated fallback data.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {financeApiProviders.slice(0, 4).map((provider) => (
                <Badge key={provider.env} variant="outline" className="border-border text-muted-foreground">
                  {provider.name}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "Revenue CAGR", value: `${(revenueCagr * 100).toFixed(1)}%`, subtext: "2026-2029", icon: TrendingUp },
          { label: "Price Target", value: `$${livePriceTarget.toFixed(2)}`, subtext: `${marketDataLoading ? "Refreshing" : `${priceUpside.toFixed(1)}% upside`}`, icon: Target },
          { label: "Future Pools", value: company.futureCustomers.length.toString(), subtext: "modeled customer groups", icon: Users },
          { label: "2029 Revenue", value: formatBillions(company.revenueForecast[3]), subtext: company.industry, icon: TrendingUp },
        ].map((stat) => (
          <Card key={stat.label} className="border-border bg-card">
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="mt-1 text-2xl font-semibold text-foreground">{stat.value}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{stat.subtext}</p>
                </div>
                <stat.icon className="h-5 w-5 text-accent" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-border bg-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium">
            {granularity === "quarterly" ? "Quarterly " : ""}
            {view === "revenue" ? "Revenue Forecast" : view === "stock" ? "Stock Price Forecast" : "Customer Count Forecast"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={forecastData}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.22 0.005 260)" />
                <XAxis
                  dataKey="period"
                  stroke="oklch(0.65 0 0)"
                  fontSize={12}
                  height={granularity === "quarterly" ? 52 : 30}
                  interval={0}
                  angle={granularity === "quarterly" ? -35 : 0}
                  textAnchor={granularity === "quarterly" ? "end" : "middle"}
                />
                <YAxis
                  stroke="oklch(0.65 0 0)"
                  fontSize={12}
                  tickFormatter={(value) =>
                    view === "stock" ? `$${value}` : view === "customers" ? `${value}` : `$${value}B`
                  }
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "oklch(0.12 0.005 260)",
                    border: "1px solid oklch(0.22 0.005 260)",
                    borderRadius: "8px",
                    color: "oklch(0.95 0 0)",
                  }}
                />
                <Legend wrapperStyle={{ fontSize: "12px" }} formatter={(value) => <span style={{ color: "oklch(0.65 0 0)" }}>{value}</span>} />
                <Line
                  type="linear"
                  dataKey={view === "stock" ? "stockPrice" : view === "customers" ? "customers" : "revenue"}
                  name={view === "stock" ? "Stock price" : view === "customers" ? "Customer pools" : "Revenue"}
                  stroke="oklch(0.7 0.18 145)"
                  strokeWidth={3}
                  dot={{ fill: "oklch(0.7 0.18 145)", r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-border bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">Future Customer Forecast</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={customerForecast}>
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.22 0.005 260)" />
                  <XAxis dataKey="name" stroke="oklch(0.65 0 0)" fontSize={11} interval={0} tick={{ width: 120 }} />
                  <YAxis stroke="oklch(0.65 0 0)" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "oklch(0.12 0.005 260)",
                      border: "1px solid oklch(0.22 0.005 260)",
                      borderRadius: "8px",
                      color: "oklch(0.95 0 0)",
                    }}
                  />
                  <Bar dataKey="probability" name="Probability %" fill="oklch(0.7 0.18 220)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">Forecast Notes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="rounded-lg bg-secondary p-4">
              <p className="text-sm font-medium text-foreground">Revenue</p>
              <p className="mt-1 text-sm text-muted-foreground">
                The model assumes {company.industry.toLowerCase()} demand drives revenue from {formatBillions(company.revenueForecast[0])} to {formatBillions(company.revenueForecast[3])}.
              </p>
            </div>
            <div className="rounded-lg bg-secondary p-4">
              <p className="text-sm font-medium text-foreground">Stock price</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Current modeled price is ${liveCurrentPrice.toFixed(2)}, with a target of ${livePriceTarget.toFixed(2)} from {marketData?.source ?? "curated fallback"}.
              </p>
            </div>
            <div className="rounded-lg bg-secondary p-4">
              <p className="text-sm font-medium text-foreground">Future customers</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Highest priority: {company.futureCustomers.join(", ")}.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
        </TabsContent>

        <TabsContent value="statements" className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <Card className="border-border bg-card">
            <CardContent className="p-4">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">SEC EDGAR Financial Statements</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Full annual 10-K statement line items for {edgarData?.companyName ?? company.name}, normalized from SEC companyfacts.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {(["income", "balance", "cashflow"] as StatementKey[]).map((id) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setStatementView(id)}
                      className={
                        statementView === id
                          ? "rounded-lg bg-accent px-3 py-1.5 text-xs font-medium text-accent-foreground"
                          : "rounded-lg bg-secondary px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
                      }
                    >
                      {statementLabels[id]}
                    </button>
                  ))}
                  <Button variant="outline" size="sm" onClick={loadEdgarStatements} disabled={edgarLoading}>
                    <RefreshCw className={`mr-2 h-4 w-4 ${edgarLoading ? "animate-spin" : ""}`} />
                    Refresh
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border bg-card">
            <CardHeader className="pb-2">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <CardTitle className="text-base font-medium">{statementLabels[statementView]}</CardTitle>
                <Badge variant="outline" className="w-fit border-border text-muted-foreground">
                  {edgarData ? `${edgarData.source} · CIK ${edgarData.cik}` : "Loading EDGAR"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              {edgarError ? (
                <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
                  {edgarError}
                </div>
              ) : edgarLoading && !edgarData ? (
                <div className="rounded-lg bg-secondary p-4 text-sm text-muted-foreground">Loading SEC EDGAR statements...</div>
              ) : edgarData ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="min-w-[180px]">Metric</TableHead>
                      {edgarData.years.map((year) => (
                        <TableHead key={year} className="text-right">
                          {year}
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {edgarData.statements[statementView].map((row) => (
                      <TableRow key={row.key}>
                        <TableCell className="font-medium text-foreground">{row.label}</TableCell>
                        {edgarData.years.map((year) => (
                          <TableCell key={year} className="text-right font-mono tabular-nums text-muted-foreground">
                            {formatStatementValue(row.values[year.toString()]?.value)}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : null}
              <p className="mt-3 text-xs text-muted-foreground">
                Values are displayed in USD from annual 10-K facts where available. Missing cells mean the company did not publish that exact standardized concept for that fiscal year.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
