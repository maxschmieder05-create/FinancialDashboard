"use client";

import { useEffect, useState } from "react";
import type { IndustrialsNewsResponse } from "@/lib/news-types";

export function useIndustrialsNews() {
  const [data, setData] = useState<IndustrialsNewsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/industrials-news", { signal: controller.signal });
        if (!response.ok) throw new Error(`News request failed: ${response.status}`);
        setData((await response.json()) as IndustrialsNewsResponse);
      } catch (requestError) {
        if (requestError instanceof DOMException && requestError.name === "AbortError") return;
        setError(requestError instanceof Error ? requestError.message : "Unable to load industrials news.");
      } finally {
        setLoading(false);
      }
    }

    void load();

    return () => controller.abort();
  }, []);

  return { data, loading, error };
}
