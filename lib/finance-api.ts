import { financeApiProviders, topIndustrialCompanies } from "@/lib/industrials-data";

export function getFinanceApiStatus() {
  return financeApiProviders.map((provider) => {
    const value = process.env[provider.env];
    const configured = Boolean(value && !value.startsWith("replace_with_"));

    return {
      ...provider,
      configured,
    };
  });
}

export async function getIndustrialsSnapshot() {
  const factsetKey = process.env.FACTSET_API_KEY;
  const factsetUsernameSerial = process.env.FACTSET_USERNAME_SERIAL;
  const factsetConfigured = Boolean(factsetKey && !factsetKey.startsWith("replace_with_"));
  const factsetUsernameConfigured = Boolean(
    factsetUsernameSerial && !factsetUsernameSerial.startsWith("replace_with_")
  );

  if (!factsetConfigured || !factsetUsernameConfigured) {
    return {
      source: "curated-fallback",
      companies: topIndustrialCompanies,
      apiStatus: getFinanceApiStatus(),
    };
  }

  return {
    source: "factset-configured",
    companies: topIndustrialCompanies,
    apiStatus: getFinanceApiStatus(),
  };
}
