"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useIndustrialsNews } from "@/hooks/use-industrials-news";
import { ExternalLink, Newspaper, RefreshCw } from "lucide-react";

function formatPublishedAt(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

export function NewsSection() {
  const { data, loading, error } = useIndustrialsNews();
  const items = data?.items ?? [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Industrials News</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Daily headlines for the tracked industrials universe.
          </p>
        </div>
        <Badge variant="outline" className="w-fit border-border text-muted-foreground">
          {loading ? "Refreshing" : data?.source === "marketaux" ? "Marketaux live feed" : "Curated fallback"}
        </Badge>
      </div>

      {error && (
        <div className="rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      {data?.note && (
        <div className="rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground">
          {data.note}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        {items.map((item, index) => (
          <a
            key={item.id}
            href={item.url}
            target="_blank"
            rel="noreferrer"
            className="block animate-in fade-in slide-in-from-bottom-2"
            style={{ animationDelay: `${index * 45}ms`, animationFillMode: "both" }}
          >
            <Card className="h-full border-border bg-card transition-colors hover:border-accent/50">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary text-accent">
                      <Newspaper className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-base leading-6">{item.title}</CardTitle>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {item.source} · {formatPublishedAt(item.publishedAt)}
                      </p>
                    </div>
                  </div>
                  <ExternalLink className="h-4 w-4 shrink-0 text-muted-foreground" />
                </div>
              </CardHeader>
              <CardContent>
                {item.summary && <p className="line-clamp-3 text-sm leading-6 text-muted-foreground">{item.summary}</p>}
                {item.tickers.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {item.tickers.slice(0, 6).map((ticker) => (
                      <Badge key={ticker} className="bg-secondary text-muted-foreground hover:bg-secondary">
                        {ticker}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </a>
        ))}
      </div>

      {loading && items.length === 0 && (
        <div className="flex items-center justify-center rounded-xl border border-border bg-card p-10 text-sm text-muted-foreground">
          <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
          Loading industrials news...
        </div>
      )}
    </div>
  );
}
