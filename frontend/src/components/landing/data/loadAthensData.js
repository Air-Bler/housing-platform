import Papa from "papaparse";

function cleanSuburbName(raw) {
  if (!raw) return "";
  return raw
    .split("(")[0] 
    .split("-")[0] 
    .trim();
}


function selectSignificant(allAreas, maxAreas) {
  const byPriceDesc = [...allAreas].sort((a, b) => b.price - a.price);
  const n = byPriceDesc.length;
  const tierSize = Math.ceil(n / 3);

  const tiers = [
    byPriceDesc.slice(0, tierSize), 
    byPriceDesc.slice(tierSize, tierSize * 2), 
    byPriceDesc.slice(tierSize * 2), 
  ];

  const perTier = Math.max(1, Math.floor(maxAreas / 3));

  return tiers.flatMap((tier) => [...tier].sort((a, b) => b.count - a.count).slice(0, perTier));
}

export async function loadAthensData(
  csvPath = "/data/cleaned_properties.csv",
  minListings = 15,
  maxAreas = 36,
  maxLabels = 25
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

  
  //  ΟΜΑΔΟΠΟΙΗΣΗ ΑΝΑ ΓΕΙΤΟΝΙΑ
  

  const groups = new Map();

  rows.forEach((row) => {
    const validRow =
      row.suburb &&
      Number.isFinite(Number(row.latitude)) &&
      Number.isFinite(Number(row.longitude)) &&
      Number.isFinite(Number(row.price_per_sqm));

    if (!validRow) return;

    if (!groups.has(row.suburb)) {
      groups.set(row.suburb, {
        name: cleanSuburbName(row.suburb),
        lats: [],
        lngs: [],
        prices: [],
        count: 0,
      });
    }

    const group = groups.get(row.suburb);
    group.lats.push(Number(row.latitude));
    group.lngs.push(Number(row.longitude));
    group.prices.push(Number(row.price_per_sqm));
    group.count += 1;
  });

  
  //  ΜΕΣΗ ΤΙΜΗ
  

  const average = (values) => values.reduce((sum, value) => sum + value, 0) / values.length;

  const allAreas = Array.from(groups.values())
    .filter((group) => group.count >= minListings)
    .map((group) => ({
      name: group.name,
      position: [average(group.lats), average(group.lngs)],
      price: average(group.prices),
      count: group.count,
    }));

  

  const areas = selectSignificant(allAreas, maxAreas);

  console.log(
    "DEBUG - όλες οι γειτονιές που περνούν minListings, ταξινομημένες κατά τιμή:",
    [...allAreas].sort((a, b) => b.price - a.price).map((a) => `${a.name} · €${a.price.toFixed(1)} · ${a.count} αγγελίες`)
  );

  
  //  ΥΠΟΛΟΓΙΣΜΟΣ ΧΡΩΜΑΤΟΣ ΜΕ ΒΑΣΗ ΤΗΝ ΕΠΙΛΟΓΗ
  

  const prices = areas.map((area) => area.price).sort((a, b) => a - b);

  const getPercentile = (value) => {
    if (prices.length <= 1) return 0.5;
    const index = prices.findIndex((price) => price >= value);
    if (index === -1) return 1;
    return index / (prices.length - 1);
  };

  
  //  ΔΗΜΙΟΥΡΓΙΑ HEATMAP DATA
  


  const byCountDesc = [...areas].sort((a, b) => b.count - a.count);
  const labelSet = new Set(byCountDesc.slice(0, maxLabels).map((a) => a.name));

  return areas.map((area) => {
    const percentile = getPercentile(area.price);

    let color;
    if (percentile >= 0.7) {
      color = "#B33F30"; 
    } else if (percentile >= 0.4) {
      color = "#C98A3E"; 
    } else {
      color = "#4C7A6D"; 
    }

    const radius = Math.min(2200, Math.max(500, 350 + Math.sqrt(area.count) * 170));
    const showLabel = labelSet.has(area.name);

    return {
      ...area,
      price: Number(area.price.toFixed(1)),
      color,
      radius,
      showLabel,
    };
  });
}