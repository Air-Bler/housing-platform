import React, { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Cell, LabelList, ResponsiveContainer } from "recharts";
import { loadCityStats } from "./data/loadcitystats";

export default function Stats() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    let cancelled = false;

    loadCityStats()
      .then((data) => {
        if (!cancelled) setStats(data);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const getSampleData = (data) => {
    if (!data || data.length === 0) return [];
    if (data.length <= 9) return data;

    const top3 = data.slice(0, 3);
    const midIndex = Math.floor(data.length / 2);
    const mid3 = data.slice(midIndex - 1, midIndex + 2);
    const low3 = data.slice(-3);

    return [...top3, ...mid3, ...low3];
  };

  const visibleChartData = stats?.chartData
    ? showAll
      ? stats.chartData
      : getSampleData(stats.chartData)
    : [];

  return (
    <section style={styles.section}>
      <div style={styles.inner}>
        <h2 style={styles.title}>Η Αθήνα σε αριθμούς</h2>
        <p style={styles.subtitle}>
          Όλα τα παρακάτω υπολογίζονται ζωντανά από μοντέλα τεχνητής νοημοσύνης πάνω σε 4.100+ επαληθευμένες αγγελίες.
        </p>

        {error && <p style={styles.errorText}>Δεν μπορέσαμε να φορτώσουμε τα στατιστικά αυτή τη στιγμή.</p>}
        {!stats && !error && <p style={styles.loadingText}>Υπολογισμός στατιστικών…</p>}

        {stats && (
          <>
            {/* Stat Cards */}
            <div style={styles.grid}>
              <StatCard
                accent="#1D4E5F"
                bg="#EAF2F1"
                number={stats.totalProperties.toLocaleString("el-GR")}
                label="Ακίνητα αναλύθηκαν"
                sub="Πραγματικές αγγελίες, όχι εκτιμήσεις"
              />
              <StatCard
                accent="#4C7A6D"
                bg="#E9F0EC"
                number={stats.neighborhoodCount}
                label="Γειτονιές με αξιόπιστα δεδομένα"
                sub="Με επαρκές πλήθος καταχωρήσεων"
              />
              <StatCard
                accent="#C98A3E"
                bg="#F4EBDC"
                number={`€${stats.avgPricePerSqm}`}
                label="Μέσο ενοίκιο ανά m²"
                sub="Σταθμισμένος μέσος όρος Αθήνας"
              />
              {stats.pctNotRenovated !== null && (
                <StatCard
                  accent="#B33F30"
                  bg="#FBEAE7"
                  number={`${stats.pctNotRenovated}%`}
                  label="Χωρίς ανακαίνιση"
                  sub="Ακίνητα με περιθώριο αναβάθμισης"
                />
              )}
            </div>

            {/* Extremes Row */}
            <div style={styles.extremesRow}>
              {stats.mostExpensive && (
                <div style={{ ...styles.extremeCard, borderLeftColor: "#B33F30" }}>
                  <span style={styles.extremeLabel}>Ακριβότερη γειτονιά</span>
                  <span style={styles.extremeValue}>
                    {stats.mostExpensive.name} · €{stats.mostExpensive.avgPrice}/m²
                  </span>
                </div>
              )}
              {stats.mostAffordable && (
                <div style={{ ...styles.extremeCard, borderLeftColor: "#4C7A6D" }}>
                  <span style={styles.extremeLabel}>Πιο προσιτή γειτονιά</span>
                  <span style={styles.extremeValue}>
                    {stats.mostAffordable.name} · €{stats.mostAffordable.avgPrice}/m²
                  </span>
                </div>
              )}
            </div>

            {/* Chart Card */}
            {stats.chartData && stats.chartData.length > 0 && (
              <div style={styles.chartCard}>
                <div style={styles.chartHeader}>
                  <h3 style={styles.chartTitle}>
                    {showAll ? "Όλες οι γειτονιές" : "Δείγμα τιμών ανά κατηγορία γειτονιάς"}
                  </h3>
                  <button
                    onClick={() => setShowAll(!showAll)}
                    style={styles.toggleBtn}
                  >
                    {showAll ? "Προβολή δείγματος (9)" : `Προβολή όλων (${stats.chartData.length})`}
                  </button>
                </div>

                <div
                  style={{
                    width: "100%",
                    height: showAll ? "450px" : "300px",
                    overflowY: showAll ? "auto" : "hidden",
                    transition: "height 0.3s ease",
                  }}
                >
                  <ResponsiveContainer width="100%" height={showAll ? visibleChartData.length * 32 + 30 : 280}>
                    <BarChart
                      data={visibleChartData}
                      layout="vertical"
                      margin={{ top: 5, right: 65, left: 0, bottom: 5 }}
                    >
                      <XAxis type="number" tick={{ fontSize: 11, fill: "#7A7264" }} axisLine={false} tickLine={false} />
                      <YAxis
                        type="category"
                        dataKey="name"
                        width={135}
                        tick={{ fontSize: 11, fill: "#16212B", fontWeight: 500 }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <Tooltip
                        formatter={(value) => [`€${value}/m²`, "Μέσο ενοίκιο"]}
                        contentStyle={{ fontSize: "12px", borderRadius: "8px", border: "1px solid #E7DFCD" }}
                      />
                      <Bar dataKey="avgPrice" radius={[0, 4, 4, 0]} barSize={14}>
                        {visibleChartData.map((entry, index) => (
                          <Cell key={index} fill={entry.color} />
                        ))}
                       
                        <LabelList
                          dataKey="avgPrice"
                          position="right"
                          formatter={(val) => `€${val}/m²`}
                          style={{ fontSize: "11px", fontWeight: "600", fill: "#52606B" }}
                        />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}

function StatCard({ number, label, sub, accent, bg }) {
  return (
    <div style={{ ...styles.statCard, backgroundColor: bg, borderColor: accent + "33" }}>
      <div style={{ ...styles.statNumber, color: accent }}>{number}</div>
      <div style={styles.statLabel}>{label}</div>
      <div style={styles.statSub}>{sub}</div>
    </div>
  );
}

const styles = {
  section: {
    backgroundColor: "#EFF3F1",
    backgroundImage:
      "radial-gradient(circle at 8% 8%, rgba(29,78,95,0.06), transparent 40%), radial-gradient(circle at 95% 15%, rgba(201,138,62,0.07), transparent 38%)",
    padding: "3.5rem 1.5rem",
  },
  inner: {
    maxWidth: "960px",
    margin: "0 auto",
    textAlign: "center",
  },
  title: {
    fontFamily: "'Fraunces', Georgia, serif",
    fontSize: "1.75rem",
    fontWeight: "600",
    color: "#16212B",
    marginBottom: "0.5rem",
  },
  subtitle: {
    fontSize: "0.92rem",
    color: "#52606B",
    marginBottom: "2rem",
    maxWidth: "560px",
    marginLeft: "auto",
    marginRight: "auto",
  },
  loadingText: { fontSize: "0.9rem", color: "#7A7264" },
  errorText: { fontSize: "0.9rem", color: "#B33F30" },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "1rem",
    marginBottom: "1.25rem",
  },
  statCard: {
    border: "1px solid",
    borderRadius: "10px",
    padding: "1.25rem 1rem",
    textAlign: "center",
  },
  statNumber: {
    fontFamily: "'Fraunces', Georgia, serif",
    fontSize: "1.85rem",
    fontWeight: "600",
    marginBottom: "0.25rem",
  },
  statLabel: {
    fontSize: "0.88rem",
    fontWeight: "600",
    color: "#16212B",
    marginBottom: "0.2rem",
  },
  statSub: { fontSize: "0.75rem", color: "#7A7264" },
  extremesRow: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: "1rem",
    marginBottom: "1.5rem",
  },
  extremeCard: {
    backgroundColor: "#FFFDF9",
    border: "1px solid #E7DFCD",
    borderLeft: "4px solid",
    borderRadius: "8px",
    padding: "0.85rem 1rem",
    textAlign: "left",
    display: "flex",
    flexDirection: "column",
    gap: "0.2rem",
  },
  extremeLabel: { fontSize: "0.75rem", color: "#7A7264" },
  extremeValue: { fontSize: "0.92rem", fontWeight: "600", color: "#16212B" },

  chartCard: {
    backgroundColor: "#FFFDF9",
    border: "1px solid #E7DFCD",
    borderRadius: "12px",
    padding: "1.25rem 1.25rem 0.75rem",
    textAlign: "left",
    boxShadow: "0 4px 20px rgba(0,0,0,0.03)",
  },
  chartHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "1rem",
    flexWrap: "wrap",
    gap: "0.5rem",
  },
  chartTitle: {
    fontFamily: "'Fraunces', Georgia, serif",
    fontSize: "1.05rem",
    fontWeight: "600",
    color: "#16212B",
    margin: 0,
  },
  toggleBtn: {
    backgroundColor: "#EAF2F1",
    color: "#1D4E5F",
    border: "1px solid #1D4E5F33",
    padding: "0.35rem 0.75rem",
    borderRadius: "6px",
    fontSize: "0.78rem",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
};