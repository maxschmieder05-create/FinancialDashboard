import { topIndustrialCompanies } from "@/lib/industrials-data";
import type { IndustrialsNewsResponse } from "@/lib/news-types";

export const dynamic = "force-dynamic";

function isConfigured(value: string | undefined) {
  return Boolean(value && !value.startsWith("replace_with_") && !value.startsWith("your_"));
}

const fallbackNews: IndustrialsNewsResponse = {
  source: "curated-fallback",
  note: "Add MARKETAUX_API_KEY in .env.local to enable live daily industrials news.",
  items: [
    {
      id: "fallback-defense",
      title: "Aerospace and defense suppliers track backlog, engine deliveries, and defense budget headlines",
      source: "Curated monitor",
      url: "https://www.google.com/search?tbm=nws&q=aerospace+defense+industrials+stocks+today",
      publishedAt: new Date().toISOString(),
      tickers: ["GE", "RTX", "LMT", "NOC", "GD"],
      summary: "Daily watch item for large-cap aerospace and defense industrials.",
    },
    {
      id: "fallback-machinery",
      title: "Machinery names watch construction, mining, agriculture, and dealer inventory updates",
      source: "Curated monitor",
      url: "https://www.google.com/search?tbm=nws&q=machinery+industrial+stocks+CAT+DE+today",
      publishedAt: new Date().toISOString(),
      tickers: ["CAT", "DE", "CMI"],
      summary: "Daily watch item for machinery, engines, and agriculture equipment.",
    },
    {
      id: "fallback-transport",
      title: "Rail and logistics companies follow freight demand, fuel spreads, and pricing commentary",
      source: "Curated monitor",
      url: "https://www.google.com/search?tbm=nws&q=rail+logistics+industrial+stocks+today",
      publishedAt: new Date().toISOString(),
      tickers: ["UNP", "CSX", "CP", "FDX", "UPS"],
      summary: "Daily watch item for rail, parcel, and freight-linked industrials.",
    },
  ],
};

export async function GET() {
  const token = process.env.MARKETAUX_API_KEY;

  if (!isConfigured(token)) {
    return Response.json(fallbackNews);
  }

  const symbols = topIndustrialCompanies.map((company) => company.ticker).join(",");
  const today = new Date().toISOString().slice(0, 10);
  const url = new URL("https://api.marketaux.com/v1/news/all");
  url.searchParams.set("api_token", token as string);
  url.searchParams.set("symbols", symbols);
  url.searchParams.set("language", "en");
  url.searchParams.set("filter_entities", "true");
  url.searchParams.set("published_after", `${today}T00:00:00Z`);
  url.searchParams.set("limit", "20");

  try {
    const response = await fetch(url, { cache: "no-store" });

    if (!response.ok) {
      return Response.json(fallbackNews);
    }

    const payload = await response.json() as {
      data?: Array<{
        uuid?: string;
        title?: string;
        description?: string;
        url?: string;
        published_at?: string;
        source?: string;
        entities?: Array<{ symbol?: string }>;
      }>;
    };

    const items = (payload.data ?? [])
      .filter((item) => item.title && item.url)
      .map((item, index) => ({
        id: item.uuid ?? `${item.url}-${index}`,
        title: item.title as string,
        source: item.source ?? "Marketaux",
        url: item.url as string,
        publishedAt: item.published_at ?? new Date().toISOString(),
        tickers: (item.entities ?? []).map((entity) => entity.symbol).filter(Boolean) as string[],
        summary: item.description,
      }));

    return Response.json({
      source: "marketaux",
      items: items.length ? items : fallbackNews.items,
      note: items.length ? undefined : "No live Marketaux headlines returned for today; showing curated search links.",
    } satisfies IndustrialsNewsResponse);
  } catch {
    return Response.json(fallbackNews);
  }
}
