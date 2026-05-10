import fs from "node:fs/promises";
import path from "node:path";

const tickers = [
  "CAT",
  "GE",
  "GEV",
  "RTX",
  "BA",
  "UNP",
  "ETN",
  "DE",
  "HON",
  "VRT",
  "LMT",
  "PWR",
  "PH",
  "HWM",
  "TT",
  "CMI",
  "GD",
  "FDX",
  "WM",
  "UPS",
  "JCI",
  "CSX",
  "EMR",
  "NOC",
  "CP",
];

const headers = {
  "User-Agent": process.env.SEC_USER_AGENT || "FinancialDashboard/1.0 max@example.com",
  Accept: "application/json",
};

const statementMetrics = {
  income: [
    {
      key: "revenue",
      label: "Revenue",
      concepts: ["Revenues", "RevenueFromContractWithCustomerExcludingAssessedTax", "SalesRevenueNet"],
    },
    {
      key: "costOfRevenue",
      label: "Cost of Revenue",
      concepts: ["CostOfRevenue", "CostOfGoodsAndServicesSold", "CostOfGoodsSold"],
    },
    { key: "grossProfit", label: "Gross Profit", concepts: ["GrossProfit"] },
    { key: "researchDevelopment", label: "Research & Development", concepts: ["ResearchAndDevelopmentExpense"] },
    {
      key: "sellingGeneralAdministrative",
      label: "Selling, General & Administrative",
      concepts: ["SellingGeneralAndAdministrativeExpense", "SellingAndMarketingExpense"],
    },
    {
      key: "operatingExpenses",
      label: "Operating Expenses",
      concepts: ["OperatingExpenses", "CostsAndExpenses"],
    },
    { key: "operatingIncome", label: "Operating Income", concepts: ["OperatingIncomeLoss"] },
    {
      key: "interestExpense",
      label: "Interest Expense",
      concepts: ["InterestExpenseNonOperating", "InterestExpense"],
    },
    {
      key: "interestIncome",
      label: "Interest Income",
      concepts: ["InterestIncomeExpenseNonOperatingNet", "InvestmentIncomeInterest"],
    },
    {
      key: "otherIncomeExpense",
      label: "Other Income / Expense",
      concepts: ["OtherNonoperatingIncomeExpense", "NonoperatingIncomeExpense"],
    },
    {
      key: "pretaxIncome",
      label: "Pretax Income",
      concepts: [
        "IncomeLossFromContinuingOperationsBeforeIncomeTaxesExtraordinaryItemsNoncontrollingInterest",
        "IncomeLossFromContinuingOperationsBeforeIncomeTaxesMinorityInterestAndIncomeLossFromEquityMethodInvestments",
        "IncomeLossFromContinuingOperationsBeforeIncomeTaxes",
      ],
    },
    {
      key: "incomeTaxExpense",
      label: "Income Tax Expense",
      concepts: ["IncomeTaxExpenseBenefit"],
    },
    {
      key: "incomeFromContinuingOperations",
      label: "Income from Continuing Operations",
      concepts: ["IncomeLossFromContinuingOperations", "IncomeLossFromContinuingOperationsIncludingPortionAttributableToNoncontrollingInterest"],
    },
    {
      key: "netIncome",
      label: "Net Income",
      concepts: ["NetIncomeLoss", "ProfitLoss", "NetIncomeLossAvailableToCommonStockholdersBasic"],
    },
    {
      key: "netIncomeCommon",
      label: "Net Income to Common",
      concepts: ["NetIncomeLossAvailableToCommonStockholdersBasic", "NetIncomeLossAvailableToCommonStockholdersDiluted"],
    },
  ],
  balance: [
    {
      key: "cash",
      label: "Cash & Equivalents",
      concepts: ["CashAndCashEquivalentsAtCarryingValue", "CashCashEquivalentsRestrictedCashAndRestrictedCashEquivalents"],
    },
    {
      key: "shortTermInvestments",
      label: "Short-Term Investments",
      concepts: ["ShortTermInvestments", "MarketableSecuritiesCurrent"],
    },
    {
      key: "receivables",
      label: "Accounts Receivable",
      concepts: ["AccountsReceivableNetCurrent", "ReceivablesNetCurrent"],
    },
    { key: "inventory", label: "Inventory", concepts: ["InventoryNet", "InventoryFinishedGoodsNetOfReserves"] },
    {
      key: "otherCurrentAssets",
      label: "Other Current Assets",
      concepts: ["OtherCurrentAssets", "PrepaidExpenseAndOtherAssetsCurrent"],
    },
    { key: "currentAssets", label: "Current Assets", concepts: ["AssetsCurrent"] },
    {
      key: "ppe",
      label: "Property, Plant & Equipment",
      concepts: ["PropertyPlantAndEquipmentNet", "PropertyPlantAndEquipmentAndFinanceLeaseRightOfUseAssetAfterAccumulatedDepreciationAndAmortization"],
    },
    { key: "operatingLeaseAssets", label: "Operating Lease Assets", concepts: ["OperatingLeaseRightOfUseAsset"] },
    { key: "goodwill", label: "Goodwill", concepts: ["Goodwill"] },
    {
      key: "intangibles",
      label: "Intangible Assets",
      concepts: ["FiniteLivedIntangibleAssetsNet", "IntangibleAssetsNetExcludingGoodwill"],
    },
    {
      key: "longTermInvestments",
      label: "Long-Term Investments",
      concepts: ["LongTermInvestments", "InvestmentsAndAdvances"],
    },
    {
      key: "otherAssets",
      label: "Other Assets",
      concepts: ["OtherAssetsNoncurrent", "OtherAssetsCurrentAndNoncurrent"],
    },
    { key: "totalAssets", label: "Total Assets", concepts: ["Assets"] },
    {
      key: "accountsPayable",
      label: "Accounts Payable",
      concepts: ["AccountsPayableCurrent", "AccountsPayableAndAccruedLiabilitiesCurrent"],
    },
    {
      key: "accruedExpenses",
      label: "Accrued Expenses",
      concepts: ["AccruedLiabilitiesCurrent", "AccruedIncomeTaxesCurrent"],
    },
    {
      key: "shortTermDebt",
      label: "Short-Term Debt",
      concepts: ["ShortTermBorrowings", "ShortTermDebtCurrent", "CurrentMaturitiesOfLongTermDebt"],
    },
    { key: "currentLiabilities", label: "Current Liabilities", concepts: ["LiabilitiesCurrent"] },
    {
      key: "longTermDebt",
      label: "Long-Term Debt",
      concepts: ["LongTermDebtNoncurrent", "LongTermDebtAndFinanceLeaseObligationsNoncurrent"],
    },
    {
      key: "deferredTaxLiabilities",
      label: "Deferred Tax Liabilities",
      concepts: ["DeferredTaxLiabilitiesNoncurrent", "DeferredTaxLiabilities"],
    },
    {
      key: "pensionLiabilities",
      label: "Pension & Postretirement Liabilities",
      concepts: ["AccruedPensionAndOtherPostretirementBenefitLiabilitiesNoncurrent"],
    },
    {
      key: "operatingLeaseLiabilities",
      label: "Operating Lease Liabilities",
      concepts: ["OperatingLeaseLiability", "OperatingLeaseLiabilityNoncurrent"],
    },
    {
      key: "otherLiabilities",
      label: "Other Liabilities",
      concepts: ["OtherLiabilitiesNoncurrent", "OtherLiabilitiesCurrentAndNoncurrent"],
    },
    { key: "totalLiabilities", label: "Total Liabilities", concepts: ["Liabilities"] },
    { key: "commonStock", label: "Common Stock", concepts: ["CommonStocksIncludingAdditionalPaidInCapital", "CommonStockValue"] },
    { key: "additionalPaidInCapital", label: "Additional Paid-In Capital", concepts: ["AdditionalPaidInCapital"] },
    { key: "retainedEarnings", label: "Retained Earnings", concepts: ["RetainedEarningsAccumulatedDeficit"] },
    { key: "treasuryStock", label: "Treasury Stock", concepts: ["TreasuryStockValue"] },
    {
      key: "accumulatedOtherComprehensiveIncome",
      label: "Accumulated Other Comprehensive Income",
      concepts: ["AccumulatedOtherComprehensiveIncomeLossNetOfTax"],
    },
    {
      key: "noncontrollingInterest",
      label: "Noncontrolling Interest",
      concepts: ["MinorityInterest", "NoncontrollingInterestInConsolidatedEntity"],
    },
    {
      key: "equity",
      label: "Shareholders' Equity",
      concepts: ["StockholdersEquity", "StockholdersEquityIncludingPortionAttributableToNoncontrollingInterest"],
    },
    {
      key: "liabilitiesAndEquity",
      label: "Liabilities & Equity",
      concepts: ["LiabilitiesAndStockholdersEquity"],
    },
  ],
  cashflow: [
    {
      key: "netIncome",
      label: "Net Income",
      concepts: ["NetIncomeLoss", "ProfitLoss", "NetIncomeLossAvailableToCommonStockholdersBasic"],
    },
    {
      key: "depreciationAmortization",
      label: "Depreciation & Amortization",
      concepts: ["DepreciationDepletionAndAmortization", "DepreciationAndAmortization"],
    },
    {
      key: "stockCompensation",
      label: "Stock-Based Compensation",
      concepts: ["ShareBasedCompensation", "ShareBasedCompensationArrangementByShareBasedPaymentAwardExpense"],
    },
    {
      key: "deferredTaxes",
      label: "Deferred Taxes",
      concepts: ["DeferredIncomeTaxExpenseBenefit"],
    },
    {
      key: "receivablesChange",
      label: "Change in Receivables",
      concepts: ["IncreaseDecreaseInAccountsReceivable", "IncreaseDecreaseInReceivables"],
    },
    {
      key: "inventoryChange",
      label: "Change in Inventory",
      concepts: ["IncreaseDecreaseInInventories"],
    },
    {
      key: "payablesChange",
      label: "Change in Payables",
      concepts: ["IncreaseDecreaseInAccountsPayable", "IncreaseDecreaseInAccountsPayableAndAccruedLiabilities"],
    },
    {
      key: "workingCapitalChange",
      label: "Change in Operating Assets & Liabilities",
      concepts: ["IncreaseDecreaseInOperatingAssetsAndLiabilities"],
    },
    { key: "operatingCashFlow", label: "Operating Cash Flow", concepts: ["NetCashProvidedByUsedInOperatingActivities"] },
    {
      key: "capex",
      label: "Capital Expenditures",
      concepts: ["PaymentsToAcquirePropertyPlantAndEquipment"],
      forceNegative: true,
    },
    {
      key: "acquisitions",
      label: "Acquisitions",
      concepts: ["PaymentsToAcquireBusinessesNetOfCashAcquired", "PaymentsToAcquireBusinessesGross"],
      forceNegative: true,
    },
    {
      key: "investmentPurchases",
      label: "Investment Purchases",
      concepts: ["PaymentsToAcquireAvailableForSaleSecurities", "PaymentsToAcquireInvestments"],
      forceNegative: true,
    },
    {
      key: "investmentSales",
      label: "Investment Sales & Maturities",
      concepts: ["ProceedsFromSaleAndMaturityOfAvailableForSaleSecurities", "ProceedsFromSaleOfInvestments"],
    },
    { key: "investingCashFlow", label: "Investing Cash Flow", concepts: ["NetCashProvidedByUsedInInvestingActivities"] },
    { key: "debtIssued", label: "Debt Issued", concepts: ["ProceedsFromIssuanceOfLongTermDebt", "ProceedsFromBorrowings"] },
    {
      key: "debtRepaid",
      label: "Debt Repaid",
      concepts: ["RepaymentsOfLongTermDebt", "RepaymentsOfDebt"],
      forceNegative: true,
    },
    {
      key: "dividendsPaid",
      label: "Dividends Paid",
      concepts: ["PaymentsOfDividends", "PaymentsOfDividendsCommonStock"],
      forceNegative: true,
    },
    {
      key: "shareRepurchases",
      label: "Share Repurchases",
      concepts: ["PaymentsForRepurchaseOfCommonStock", "PaymentsForRepurchaseOfEquity"],
      forceNegative: true,
    },
    { key: "financingCashFlow", label: "Financing Cash Flow", concepts: ["NetCashProvidedByUsedInFinancingActivities"] },
    {
      key: "fxEffect",
      label: "FX Effect on Cash",
      concepts: ["EffectOfExchangeRateOnCashCashEquivalentsRestrictedCashAndRestrictedCashEquivalents"],
    },
    {
      key: "cashChange",
      label: "Change in Cash",
      concepts: ["CashCashEquivalentsRestrictedCashAndRestrictedCashEquivalentsPeriodIncreaseDecreaseIncludingExchangeRateEffect"],
    },
  ],
};

const durationStatements = new Set(["income", "cashflow"]);

function daysBetween(start, end) {
  if (!start || !end) return undefined;
  return (Date.parse(end) - Date.parse(start)) / 86_400_000;
}

function periodYear(fact) {
  return fact.end ? Number(fact.end.slice(0, 4)) : undefined;
}

function factsByPeriodYear(facts, statement) {
  const byYear = new Map();

  facts
    .filter((fact) => fact.form === "10-K" && fact.fp === "FY" && typeof fact.val === "number" && periodYear(fact))
    .filter((fact) => {
      if (!durationStatements.has(statement)) return true;
      const days = daysBetween(fact.start, fact.end) ?? 0;
      return days >= 300 && days <= 380;
    })
    .forEach((fact) => {
      const year = periodYear(fact);
      const current = byYear.get(year);
      if (!current || (fact.filed || "") > (current.filed || "")) {
        byYear.set(year, fact);
      }
    });

  return byYear;
}

function getMetricValues(companyFacts, metric, statement) {
  const gaap = companyFacts.facts?.["us-gaap"];
  const byYear = new Map();

  for (const concept of metric.concepts) {
    const usdFacts = gaap?.[concept]?.units?.USD;
    if (!usdFacts?.length) continue;

    factsByPeriodYear(usdFacts, statement).forEach((fact, year) => {
      if (!byYear.has(year)) {
        byYear.set(year, fact);
      }
    });
  }

  return byYear;
}

async function getJson(url) {
  const response = await fetch(url, { headers });

  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText} for ${url}`);
  }

  return response.json();
}

async function main() {
  const outDir = path.join(process.cwd(), "public", "edgar-financials");
  await fs.mkdir(outDir, { recursive: true });

  const tickerRecords = await getJson("https://www.sec.gov/files/company_tickers.json");
  const index = {};

  for (const ticker of tickers) {
    const company = Object.values(tickerRecords).find((record) => record.ticker.toUpperCase() === ticker);
    if (!company) continue;

    const cik = String(company.cik_str).padStart(10, "0");
    const facts = await getJson(`https://data.sec.gov/api/xbrl/companyfacts/CIK${cik}.json`);
    const allYears = new Set();
    const statements = {};

    for (const [statement, metrics] of Object.entries(statementMetrics)) {
      statements[statement] = metrics.map((metric) => {
        const valuesByYear = getMetricValues(facts, metric, statement);
        valuesByYear.forEach((_fact, year) => allYears.add(year));

        return {
          key: metric.key,
          label: metric.label,
          values: Object.fromEntries(
            [...valuesByYear.entries()].map(([year, fact]) => [
              String(year),
              {
                value: metric.forceNegative ? -Math.abs(fact.val) : fact.val,
                filed: fact.filed,
                end: fact.end,
              },
            ])
          ),
        };
      });
    }

    const payload = {
      source: "SEC EDGAR companyfacts",
      ticker,
      cik,
      companyName: company.title,
      years: [...allYears].sort((a, b) => b - a).slice(0, 10),
      statements,
      updatedAt: new Date().toISOString(),
    };

    await fs.writeFile(path.join(outDir, `${ticker}.json`), `${JSON.stringify(payload, null, 2)}\n`);
    index[ticker] = { cik, companyName: company.title, file: `/edgar-financials/${ticker}.json` };
    console.log(`wrote ${ticker}`);

    await new Promise((resolve) => setTimeout(resolve, 150));
  }

  await fs.writeFile(path.join(outDir, "index.json"), `${JSON.stringify(index, null, 2)}\n`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
