import { apiFetch } from "../../../api";

// Συγκεντρωτικά στοιχεία από το backend· οι αγγελίες δεν φτάνουν ποτέ στον browser.
export async function loadCityStats() {
  const stats = await apiFetch("/api/city-stats");
  const reliableNeighborhoods = stats.neighborhoods;

  const sortedPrices = [...reliableNeighborhoods.map((a) => a.avgPrice)].sort((a, b) => a - b);
  const getPercentile = (value) => {
    if (sortedPrices.length <= 1) return 0.5;
    const idx = sortedPrices.findIndex((p) => p >= value);
    return idx === -1 ? 1 : idx / (sortedPrices.length - 1);
  };
  const colorFor = (pct) => (pct >= 0.7 ? "#B33F30" : pct >= 0.4 ? "#C98A3E" : "#4C7A6D");

  const byPriceDesc = [...reliableNeighborhoods]
    .sort((a, b) => b.avgPrice - a.avgPrice)
    .map((n) => ({
      ...n,
      avgPrice: Number(n.avgPrice.toFixed(1)),
      color: colorFor(getPercentile(n.avgPrice)),
    }));

  return {
    totalProperties: stats.totalProperties,
    neighborhoodCount: stats.neighborhoodCount,
    avgPricePerSqm: stats.avgPricePerSqm,
    pctNotRenovated: stats.pctNotRenovated,
    mostExpensive: byPriceDesc[0] || null,
    mostAffordable: byPriceDesc[byPriceDesc.length - 1] || null,
    chartData: byPriceDesc,
  };
}
