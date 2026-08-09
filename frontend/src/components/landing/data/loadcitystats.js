import Papa from "papaparse";

function cleanSuburbName(raw) {
  if (!raw) return "";
  return raw
    .split("(")[0]   
    .split("-")[0]   
    .split("–")[0]   
    .trim();
}

export async function loadCityStats(
  csvPath = "/data/cleaned_properties.csv",
  minListings = 15
) {
  const response = await fetch(csvPath);

  if (!response.ok) {
    throw new Error(`Δεν βρέθηκε το CSV: ${response.status} ${response.statusText}`);
  }

  const csvText = await response.text();

  const { data: rows } = Papa.parse(csvText, {
    header: true,
    dynamicTyping: true,
    skipEmptyLines: true,
  });

  const validRows = rows.filter(
    (row) =>
      row.suburb &&
      Number.isFinite(Number(row.price_per_sqm)) &&
      Number.isFinite(Number(row.latitude)) &&
      Number.isFinite(Number(row.longitude))
  );

  const average = (arr) => arr.reduce((a, b) => a + b, 0) / arr.length;

  const groups = new Map();

  validRows.forEach((row) => {
    const cleanName = cleanSuburbName(row.suburb);
    if (!groups.has(cleanName)) {
      groups.set(cleanName, { prices: [], count: 0 });
    }
    const g = groups.get(cleanName);
    g.prices.push(Number(row.price_per_sqm));
    g.count += 1;
  });

  const reliableNeighborhoods = Array.from(groups.entries())
    .filter(([, g]) => g.count >= minListings)
    .map(([name, g]) => ({
      name,
      avgPrice: average(g.prices),
      count: g.count,
    }));

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

  const totalProperties = validRows.length;
  const neighborhoodCount = reliableNeighborhoods.length;
  const avgPricePerSqm = average(validRows.map((r) => Number(r.price_per_sqm)));

  const renovatedRows = validRows.filter((r) => Number.isFinite(Number(r.renovated)));
  const pctNotRenovated =
    renovatedRows.length > 0
      ? (renovatedRows.filter((r) => Number(r.renovated) === 0).length / renovatedRows.length) * 100
      : null;

  return {
    totalProperties,
    neighborhoodCount,
    avgPricePerSqm: Number(avgPricePerSqm.toFixed(1)),
    pctNotRenovated: pctNotRenovated !== null ? Math.round(pctNotRenovated) : null,
    mostExpensive: byPriceDesc[0] || null,
    mostAffordable: byPriceDesc[byPriceDesc.length - 1] || null,
    chartData: byPriceDesc,
  };
}