"use client";

import { useEffect, useState } from "react";
import type { MarketDataSnapshot } from "@/lib/market-data-types";

export function useMarketData(symbol: string) {
  const [data, setData] = useState<MarketDataSnapshot | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/market-data?symbol=${encodeURIComponent(symbol)}`, {
          signal: controller.signal,
        });

        if (!response.ok) throw new Error(`Market data request failed: ${response.status}`);
        setData((await response.json()) as MarketDataSnapshot);
      } catch (requestError) {
        if (requestError instanceof DOMException && requestError.name === "AbortError") return;
        setData(null);
        setError(requestError instanceof Error ? requestError.message : "Unable to load market data.");
      } finally {
        setLoading(false);
      }
    }

    void load();
    const interval = window.setInterval(load, 60_000);

    return () => {
      controller.abort();
      window.clearInterval(interval);
    };
  }, [symbol]);

  return { data, loading, error };
}
