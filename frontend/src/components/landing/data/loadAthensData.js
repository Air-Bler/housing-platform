import Papa from "papaparse";

// Αφαιρεί το "(Αθήνα - Νότια Προάστια)" από το suburb name για καθαρή ετικέτα
function cleanSuburbName(raw) {
  return raw.replace(/\s*\(.*\)\s*$/, "").trim();
}

/**
 * Διαβάζει το public/data/cleaned_properties.csv, ομαδοποιεί τα ακίνητα
 * ανά suburb (γειτονιά) και επιστρέφει array στην ίδια μορφή που ήδη
 * περιμένει το Heatmap.jsx: { name, position, price, color, radius }.
 */
export async function loadAthensData(
  csvPath = "/data/cleaned_properties.csv",
  maxAreas = 16,
  minListings = 4
) {
  const response = await fetch(csvPath);
  const csvText = await response.text();

  const { data: rows } = Papa.parse(csvText, {
    header: true,
    dynamicTyping: true,
    skipEmptyLines: true,
  });

  // 1. Ομαδοποίηση ανά γειτονιά (suburb)
  const groups = new Map();

  rows.forEach((row) => {
    const validRow =
      row.suburb &&
      Number.isFinite(row.latitude) &&
      Number.isFinite(row.longitude) &&
      Number.isFinite(row.price_per_sqm);

    if (!validRow) return; // προσπερνάμε ελλιπείς/χαλασμένες γραμμές

    if (!groups.has(row.suburb)) {
      groups.set(row.suburb, {
        name: cleanSuburbName(row.suburb),
        lats: [],
        lngs: [],
        prices: [],
        count: 0,
      });
    }

    const g = groups.get(row.suburb);
    g.lats.push(row.latitude);
    g.lngs.push(row.longitude);
    g.prices.push(row.price_per_sqm);
    g.count += 1;
  });

  // 2. Μέσες τιμές & κεντροειδές ανά γειτονιά
  const average = (arr) => arr.reduce((a, b) => a + b, 0) / arr.length;

  const allAreas = Array.from(groups.values()).map((g) => ({
    name: g.name,
    position: [average(g.lats), average(g.lngs)],
    price: Math.round(average(g.prices)),
    count: g.count,
  }));

  // 2β. Περιορίζουμε στις πιο "σημαντικές" γειτονιές, ώστε ο χάρτης να
  //     παραμένει ευανάγνωστος: κρατάμε μόνο όσες έχουν αρκετές
  //     καταχωρήσεις (αξιόπιστη μέση τιμή) και παίρνουμε τις top N με τις
  //     περισσότερες, που είναι συνήθως και οι πιο ζητούμενες γειτονιές.
  const areas = allAreas
    .filter((a) => a.count >= minListings)
    .sort((a, b) => b.count - a.count)
    .slice(0, maxAreas);

  // 3. Χρωματισμός & ακτίνα βάσει πραγματικής διασποράς τιμών
  //    (ποσοστημόρια πάνω στις ίδιες τις γειτονιές, όχι σταθερά κατώφλια)
  const sorted = [...areas].sort((a, b) => a.price - b.price);
  const n = sorted.length;

  return sorted.map((a, i) => {
    const pct = n > 1 ? i / (n - 1) : 0;
    const color = pct >= 0.66 ? "#B33F30" : pct >= 0.33 ? "#C98A3E" : "#4C7A6D";
    // Περισσότερες καταχωρήσεις σε μια γειτονιά -> λίγο μεγαλύτερος κύκλος
    const radius = Math.min(1400, Math.max(400, 300 + Math.sqrt(a.count) * 150));

    return { ...a, color, radius };
  });
}