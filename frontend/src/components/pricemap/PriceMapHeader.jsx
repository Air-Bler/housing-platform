import React from 'react';


export default function PriceMapHeader({ dynamicKPIs }) {
  return (
    <>
      <div style={styles.headerContainer}>
        <div style={styles.badgeRow}>
          <span style={styles.badgePill}>
          </span>
        </div>
        <h1 style={styles.mainTitle}>Διαδραστικός Χάρτης Τιμών</h1>
        <p style={styles.subTitle}>
          Πλοηγηθείτε στις πραγματικές τιμές ενοικίασης ανά m² και στο μέσο μίσθωμα ανά γειτονιά της Αθήνας.
        </p>
      </div>

      <div style={styles.kpiGrid}>
        <div style={styles.kpiCard}>
          <span style={styles.kpiLabel}>Δείγμα Αγγελιών</span>
          <span style={styles.kpiValue}>{dynamicKPIs.sampleSize}</span>
          
        </div>
        <div style={styles.kpiCard}>
          <span style={styles.kpiLabel}>Γειτονιές με Δεδομένα</span>
          <span style={styles.kpiValue}>{dynamicKPIs.suburbsCount}</span>
         
        </div>
        <div style={styles.kpiCard}>
          <span style={styles.kpiLabel}>Μέσο Ενοίκιο / m²</span>
          <span style={{ ...styles.kpiValue, color: '#C98A3E' }}>{dynamicKPIs.avgSqmPrice}</span>
          <span style={styles.kpiSub}>Σταθμισμένος μέσος όρος</span>
        </div>
        <div style={styles.kpiCard}>
          <span style={styles.kpiLabel}>Χωρίς Ανακαίνιση</span>
          <span style={{ ...styles.kpiValue, color: '#B33F30' }}>{dynamicKPIs.unrenovatedPct}</span>
          <span style={styles.kpiSub}>Περιθώριο αναβάθμισης</span>
        </div>
      </div>
    </>
  );
}

const styles = {
  headerContainer: {
    textAlign: 'center',
    marginBottom: '1.6rem',
  },
  badgeRow: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: '0.5rem',
  },
  badgePill: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.35rem',
    backgroundColor: '#EAF2F1',
    color: '#0F766E',
    padding: '0.25rem 0.75rem',
    borderRadius: '999px',
    fontSize: '0.72rem',
    fontWeight: '700',
    letterSpacing: '0.5px',
    fontFamily: 'system-ui, -apple-system, sans-serif',
  },
  mainTitle: {
    fontFamily: "'Fraunces', Georgia, serif",
    fontSize: '2rem',
    fontWeight: '700',
    color: '#16212B',
    margin: '0 0 0.4rem 0',
    letterSpacing: '-0.3px',
  },
  subTitle: {
    fontFamily: 'system-ui, -apple-system, sans-serif',
    fontSize: '0.92rem',
    color: '#52606B',
    maxWidth: '640px',
    margin: '0 auto',
    lineHeight: '1.45',
  },
  kpiGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: '0.85rem',
    marginBottom: '1.5rem',
  },
  kpiCard: {
    backgroundColor: '#FFFFFF',
    border: '1px solid #E5E7EB',
    borderRadius: '12px',
    padding: '0.85rem 1rem',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
  },
  kpiLabel: {
    fontFamily: 'system-ui, -apple-system, sans-serif',
    fontSize: '0.78rem',
    fontWeight: '600',
    color: '#16212B',
    marginBottom: '0.15rem',
  },
  kpiValue: {
    fontFamily: "'Fraunces', Georgia, serif",
    fontSize: '1.65rem',
    fontWeight: '600',
    color: '#0F766E',
    lineHeight: '1.15',
    marginBottom: '0.15rem',
  },
  kpiSub: {
    fontFamily: 'system-ui, -apple-system, sans-serif',
    fontSize: '0.7rem',
    color: '#7A7264',
  },
};