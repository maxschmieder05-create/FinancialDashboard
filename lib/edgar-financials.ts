export type StatementKey = "income" | "balance" | "cashflow";

export type EdgarStatementCell = {
  value: number;
  filed?: string;
  end?: string;
};

export type EdgarStatementRow = {
  key: string;
  label: string;
  values: Record<string, EdgarStatementCell>;
};

export type EdgarFinancials = {
  source: string;
  ticker: string;
  cik: string;
  companyName: string;
  years: number[];
  statements: Record<StatementKey, EdgarStatementRow[]>;
  updatedAt?: string;
};

export async function fetchEdgarFinancials(ticker: string): Promise<EdgarFinancials> {
  const normalizedTicker = ticker.trim().toUpperCase();

  if (!normalizedTicker) {
    throw new Error("Ticker is required.");
  }

  const response = await fetch(`edgar-financials/${normalizedTicker}.json`, {
    cache: "no-cache",
  });

  if (!response.ok) {
    throw new Error(`No EDGAR financial statement file found for ${normalizedTicker}.`);
  }

  return (await response.json()) as EdgarFinancials;
}
