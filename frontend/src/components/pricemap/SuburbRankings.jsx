import React from 'react';

export default function SuburbRankings({ benchmarks }) {
  return (
    <div style={styles.benchmarksGrid}>
      <div style={{ ...styles.benchmarkCard, borderLeft: '3.5px solid #B33F30' }}>
        <div>
          <span style={styles.benchmarkLabel}>Ακριβότερη γειτονιά</span>
          <h3 style={styles.benchmarkName}>{benchmarks.expensive.name}</h3>
          <p style={styles.benchmarkDesc}>Ιστορικό κέντρο & προνομιακές ζώνες</p>
        </div>
        <div style={{ ...styles.benchmarkPrice, color: '#B33F30' }}>
          {benchmarks.expensive.price}
        </div>
      </div>

      <div style={{ ...styles.benchmarkCard, borderLeft: '3.5px solid #4C7A6D' }}>
        <div>
          <span style={styles.benchmarkLabel}>Πιο προσιτή γειτονιά</span>
          <h3 style={styles.benchmarkName}>{benchmarks.affordable.name}</h3>
          <p style={styles.benchmarkDesc}>Υψηλή διαθεσιμότητα & προσιτή στέγαση</p>
        </div>
        <div style={{ ...styles.benchmarkPrice, color: '#4C7A6D' }}>
          {benchmarks.affordable.price}
        </div>
      </div>
    </div>
  );
}

const styles = {
  benchmarksGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
    gap: '0.85rem',
    marginBottom: '0.75rem',
  },
  benchmarkCard: {
    backgroundColor: '#FFFDF9',
    border: '1px solid #E7DFCD',
    borderRadius: '10px',
    padding: '0.8rem 1.1rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
  },
  benchmarkLabel: {
    fontFamily: 'system-ui, -apple-system, sans-serif',
    fontSize: '0.7rem',
    fontWeight: '700',
    color: '#7A7264',
    textTransform: 'uppercase',
  },
  benchmarkName: {
    fontFamily: "'Fraunces', Georgia, serif",
    fontSize: '1.1rem',
    fontWeight: '600',
    color: '#16212B',
    margin: '0.1rem 0',
  },
  benchmarkDesc: {
    fontFamily: 'system-ui, -apple-system, sans-serif',
    fontSize: '0.74rem',
    color: '#52606B',
    margin: 0,
  },
  benchmarkPrice: {
    fontFamily: "'Fraunces', Georgia, serif",
    fontSize: '1.35rem',
    fontWeight: '600',
  }
};