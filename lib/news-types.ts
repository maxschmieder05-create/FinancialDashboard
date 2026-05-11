export type IndustrialsNewsItem = {
  id: string;
  title: string;
  source: string;
  url: string;
  publishedAt: string;
  tickers: string[];
  summary?: string;
};

export type IndustrialsNewsResponse = {
  source: "marketaux" | "curated-fallback";
  items: IndustrialsNewsItem[];
  note?: string;
};
