import { getFreeMarketData } from "@/lib/free-market-data";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get("symbol")?.toUpperCase() || "CAT";
  const snapshot = await getFreeMarketData(symbol);

  return Response.json(snapshot);
}
