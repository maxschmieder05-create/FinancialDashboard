export type MarketDataSource = "finnhub" | "alpha-vantage" | "curated-fallback";

export type RecommendationTrend = {
  period: string;
  strongBuy: number;
  buy: number;
  hold: number;
  sell: number;
  strongSell: number;
};

export type MarketDataSnapshot = {
  symbol: string;
  source: MarketDataSource;
  price?: number;
  previousClose?: number;
  open?: number;
  high?: number;
  low?: number;
  change?: number;
  changePercent?: number;
  marketCap?: number;
  peRatio?: number;
  dividendYield?: number;
  dividendPerShare?: number;
  fiftyTwoWeekHigh?: number;
  fiftyTwoWeekLow?: number;
  analystTargetPrice?: number;
  targetHigh?: number;
  targetLow?: number;
  targetMean?: number;
  recommendationTrend?: RecommendationTrend[];
  note?: string;
};
