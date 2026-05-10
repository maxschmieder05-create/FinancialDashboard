"use client";

import { topIndustrialCompanies } from "@/lib/industrials-data";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function CompanySelector({
  selectedTicker,
  onTickerChange,
  compact = false,
}: {
  selectedTicker: string;
  onTickerChange: (ticker: string) => void;
  compact?: boolean;
}) {
  return (
    <Select value={selectedTicker} onValueChange={onTickerChange}>
      <SelectTrigger className={compact ? "w-[132px] bg-secondary border-border" : "w-full sm:w-[280px] bg-secondary border-border"}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent className="max-h-[360px]">
        {topIndustrialCompanies.map((company) => (
          <SelectItem key={company.ticker} value={company.ticker}>
            {company.ticker} · {company.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
