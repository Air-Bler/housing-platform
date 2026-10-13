import { getMarkerColor } from "../Common";
import { apiFetch } from "../../../api";

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

  return tiers.flatMap((tier) =>
    [...tier].sort((a, b) => b.count - a.count).slice(0, perTier)
  );
}

// Μέση τιμή ανά περιοχή από το backend· οι αγγελίες δεν φτάνουν ποτέ στον browser.
export async function loadAthensData(maxAreas = 36, maxLabels = 25) {
  const { areas: allAreas } = await apiFetch("/api/heatmap-areas");

  const areas = selectSignificant(allAreas, maxAreas);

  const byCountDesc = [...areas].sort((a, b) => b.count - a.count);
  const labelSet = new Set(byCountDesc.slice(0, maxLabels).map((a) => a.name));

  return areas.map((area) => {
    const numericPrice = Number(area.price.toFixed(1));
    const color = getMarkerColor(numericPrice);
    const radius = Math.min(2200, Math.max(500, 350 + Math.sqrt(area.count) * 170));
    const showLabel = labelSet.has(area.name);

    return {
      ...area,
      price: numericPrice,
      color,
      radius,
      showLabel,
    };
  });
}
