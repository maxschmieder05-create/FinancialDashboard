import type { MarketDataSnapshot, RecommendationTrend } from "@/lib/market-data-types";
import { getCompany } from "@/lib/industrials-data";

function isConfigured(value: string | undefined) {
  return Boolean(value && !value.startsWith("replace_with_") && !value.startsWith("your_"));
}

async function fetchJson<T>(url: string) {
  const response = await fetch(url, { cache: "no-store" });
  const text = await response.text();

  if (!response.ok) {
    throw new Error(`${response.status}: ${text.slice(0, 160)}`);
  }

  return JSON.parse(text) as T;
}

async function getFinnhubSnapshot(symbol: string): Promise<MarketDataSnapshot | null> {
  const token = process.env.FINNHUB_API_KEY;
  if (!isConfigured(token)) return null;

  const base = "https://finnhub.io/api/v1";
  const [quote, target, recommendations, metrics] = await Promise.allSettled([
    fetchJson<{ c?: number; d?: number; dp?: number; h?: number; l?: number; o?: number; pc?: number }>(
      `${base}/quote?symbol=${encodeURIComponent(symbol)}&token=${token}`
    ),
    fetchJson<{ targetHigh?: number; targetLow?: number; targetMean?: number; targetMedian?: number; lastUpdated?: string }>(
      `${base}/stock/price-target?symbol=${encodeURIComponent(symbol)}&token=${token}`
    ),
    fetchJson<RecommendationTrend[]>(
      `${base}/stock/recommendation?symbol=${encodeURIComponent(symbol)}&token=${token}`
    ),
    fetchJson<{
      metric?: {
        "52WeekHigh"?: number;
        "52WeekLow"?: number;
        peNormalizedAnnual?: number;
        peBasicExclExtraTTM?: number;
        dividendYieldIndicatedAnnual?: number;
        dividendPerShareAnnual?: number;
      };
    }>(`${base}/stock/metric?symbol=${encodeURIComponent(symbol)}&metric=all&token=${token}`),
  ]);

  if (quote.status === "rejected" || !quote.value.c) return null;

  const priceTarget = target.status === "fulfilled" ? target.value : undefined;
  const metric = metrics.status === "fulfilled" ? metrics.value.metric : undefined;

  return {
    symbol,
    source: "finnhub",
    price: quote.value.c,
    previousClose: quote.value.pc,
    open: quote.value.o,
    high: quote.value.h,
    low: quote.value.l,
    change: quote.value.d,
    changePercent: quote.value.dp,
    peRatio: metric?.peNormalizedAnnual ?? metric?.peBasicExclExtraTTM,
    dividendYield: metric?.dividendYieldIndicatedAnnual,
    dividendPerShare: metric?.dividendPerShareAnnual,
    fiftyTwoWeekHigh: metric?.["52WeekHigh"],
    fiftyTwoWeekLow: metric?.["52WeekLow"],
    analystTargetPrice: priceTarget?.targetMean ?? priceTarget?.targetMedian,
    targetHigh: priceTarget?.targetHigh,
    targetLow: priceTarget?.targetLow,
    targetMean: priceTarget?.targetMean,
    recommendationTrend: recommendations.status === "fulfilled" ? recommendations.value.slice(0, 4) : undefined,
  };
}

async function getAlphaVantageSnapshot(symbol: string): Promise<MarketDataSnapshot | null> {
  const token = process.env.ALPHA_VANTAGE_API_KEY;
  if (!isConfigured(token)) return null;

  const [quote, overview] = await Promise.allSettled([
    fetchJson<{
      "Global Quote"?: {
        "05. price"?: string;
        "08. previous close"?: string;
        "09. change"?: string;
        "10. change percent"?: string;
      };
    }>(
      `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${encodeURIComponent(symbol)}&apikey=${token}`
    ),
    fetchJson<{
      AnalystTargetPrice?: string;
      MarketCapitalization?: string;
      PERatio?: string;
      DividendYield?: string;
      DividendPerShare?: string;
      "52WeekHigh"?: string;
      "52WeekLow"?: string;
    }>(
      `https://www.alphavantage.co/query?function=OVERVIEW&symbol=${encodeURIComponent(symbol)}&apikey=${token}`
    ),
  ]);

  const globalQuote = quote.status === "fulfilled" ? quote.value["Global Quote"] : undefined;
  const price = Number(globalQuote?.["05. price"]);
  if (!Number.isFinite(price) || price <= 0) return null;

  const previousClose = Number(globalQuote?.["08. previous close"]);
  const change = Number(globalQuote?.["09. change"]);
  const changePercent = Number(globalQuote?.["10. change percent"]?.replace("%", ""));
  const analystTargetPrice =
    overview.status === "fulfilled" ? Number(overview.value.AnalystTargetPrice) : undefined;
  const marketCapRaw =
    overview.status === "fulfilled" && overview.value.MarketCapitalization
      ? Number(overview.value.MarketCapitalization)
      : undefined;
  const peRatio = overview.status === "fulfilled" ? Number(overview.value.PERatio) : undefined;
  const dividendYield = overview.status === "fulfilled" ? Number(overview.value.DividendYield) : undefined;
  const dividendPerShare = overview.status === "fulfilled" ? Number(overview.value.DividendPerShare) : undefined;
  const fiftyTwoWeekHigh = overview.status === "fulfilled" ? Number(overview.value["52WeekHigh"]) : undefined;
  const fiftyTwoWeekLow = overview.status === "fulfilled" ? Number(overview.value["52WeekLow"]) : undefined;

  return {
    symbol,
    source: "alpha-vantage",
    price,
    previousClose: Number.isFinite(previousClose) ? previousClose : undefined,
    change: Number.isFinite(change) ? change : undefined,
    changePercent: Number.isFinite(changePercent) ? changePercent : undefined,
    analystTargetPrice: Number.isFinite(analystTargetPrice) ? analystTargetPrice : undefined,
    marketCap: typeof marketCapRaw === "number" && Number.isFinite(marketCapRaw) ? marketCapRaw / 1_000_000_000 : undefined,
    peRatio: Number.isFinite(peRatio) ? peRatio : undefined,
    dividendYield: Number.isFinite(dividendYield) ? dividendYield * 100 : undefined,
    dividendPerShare: Number.isFinite(dividendPerShare) ? dividendPerShare : undefined,
    fiftyTwoWeekHigh: Number.isFinite(fiftyTwoWeekHigh) ? fiftyTwoWeekHigh : undefined,
    fiftyTwoWeekLow: Number.isFinite(fiftyTwoWeekLow) ? fiftyTwoWeekLow : undefined,
  };
}

export async function getFreeMarketData(symbol: string): Promise<MarketDataSnapshot> {
  const normalizedSymbol = symbol.toUpperCase();
  const company = getCompany(normalizedSymbol);
  const finnhub = await getFinnhubSnapshot(normalizedSymbol);
  if (finnhub) return finnhub;

  const alphaVantage = await getAlphaVantageSnapshot(normalizedSymbol);
  if (alphaVantage) return alphaVantage;

  return {
    symbol: normalizedSymbol,
    source: "curated-fallback",
    price: company.currentPrice,
    previousClose: company.currentPrice / (1 + company.dayChange / 100),
    open: Number((company.currentPrice * 1.0151).toFixed(2)),
    high: Number((company.currentPrice * 1.0193).toFixed(2)),
    low: Number((company.currentPrice * 0.996).toFixed(2)),
    changePercent: company.dayChange,
    marketCap: company.marketCap,
    peRatio: 44.65,
    dividendYield: 0.67,
    dividendPerShare: 1.5,
    fiftyTwoWeekHigh: company.priceTarget,
    fiftyTwoWeekLow: Number((company.currentPrice * 0.36).toFixed(2)),
    analystTargetPrice: company.priceTarget,
    note: "Add FINNHUB_API_KEY or ALPHA_VANTAGE_API_KEY in .env.local to enable free live quote and forecast data.",
  };
}
