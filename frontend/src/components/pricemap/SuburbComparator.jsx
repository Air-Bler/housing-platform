import React, { useState } from 'react';
import { ArrowRightLeft } from 'lucide-react';

export default function SuburbComparator({ suburbs }) {
  const [suburbAName, setSuburbAName] = useState('');
  const [suburbBName, setSuburbBName] = useState('');

  const suburbA = suburbs.find((s) => s.name === suburbAName);
  const suburbB = suburbs.find((s) => s.name === suburbBName);

  const priceA = suburbA ? Number(suburbA.avgSqmPrice || 0) : 0;
  const priceB = suburbB ? Number(suburbB.avgSqmPrice || 0) : 0;

  const rentA = suburbA ? Math.round(suburbA.avgRent || 0) : 0;
  const rentB = suburbB ? Math.round(suburbB.avgRent || 0) : 0;

  const diffSqm = priceA - priceB;
  const diffPct = priceB > 0 ? ((diffSqm / priceB) * 100).toFixed(1) : 0;

  const getTierColor = (price) => {
    if (price >= 14.0) return '#B33F30';
    if (price >= 10.5) return '#C98A3E';
    return '#4C7A6D';
  };

  const isBothSelected = Boolean(suburbA && suburbB);

  return (
    <div style={styles.card}>
      <div style={styles.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          
          <h3 style={styles.title}>Σύγκριση Περιοχών</h3>
        </div>
       
      </div>

      {/* Selectors */}
      <div style={styles.selectorGrid}>
        <div style={styles.selectCol}>
          <label style={styles.label}>1η Περιοχή</label>
          <select
            value={suburbAName}
            onChange={(e) => setSuburbAName(e.target.value)}
            style={styles.select}
          >
            <option value="">Επιλέξτε περιοχή...</option>
            {suburbs.map((s, idx) => (
              <option key={idx} value={s.name}>
                {s.name} (€{Number(s.avgSqmPrice || 0).toFixed(1)}/m²)
              </option>
            ))}
          </select>
        </div>

        <div style={styles.dividerWrapper}>
          <ArrowRightLeft size={18} color="#7A7264" />
        </div>

        <div style={styles.selectCol}>
          <label style={styles.label}>2η Περιοχή</label>
          <select
            value={suburbBName}
            onChange={(e) => setSuburbBName(e.target.value)}
            style={styles.select}
          >
            <option value="">Επιλέξτε περιοχή...</option>
            {suburbs.map((s, idx) => (
              <option key={idx} value={s.name}>
                {s.name} (€{Number(s.avgSqmPrice || 0).toFixed(1)}/m²)
              </option>
            ))}
          </select>
        </div>
      </div>

      {isBothSelected ? (
        <>
          {/* Summary Banner */}
          <div style={styles.summaryBanner}>
            {diffSqm !== 0 ? (
              <span>
                Η περιοχή <strong>{diffSqm > 0 ? suburbA.name : suburbB.name}</strong> είναι κατά{' '}
                <strong style={{ color: '#0F766E' }}>{Math.abs(diffPct)}%</strong> (€{Math.abs(diffSqm).toFixed(1)}/m²) ακριβότερη ανά m².
              </span>
            ) : (
              <span>Οι δύο περιοχές έχουν την ίδια μέση τιμή ανά τετραγωνικό μέτρο.</span>
            )}
          </div>

          {/* Comparison Cards */}
          <div style={styles.comparisonGrid}>
            <div style={{ ...styles.areaCard, borderTop: `3.5px solid ${getTierColor(priceA)}` }}>
              <div style={styles.areaHeader}>
                <h4 style={styles.areaTitle}>{suburbA.name}</h4>
                <span style={{ ...styles.pill, backgroundColor: getTierColor(priceA) }}>
                  €{priceA.toFixed(1)} / m²
                </span>
              </div>
              <div style={styles.metricsList}>
                <div style={styles.metricRow}>
                  <span style={styles.metricLabel}>Μέσο Ενοίκιο</span>
                  <strong style={styles.metricVal}>€{rentA} / μήνα</strong>
                </div>
                <div style={styles.metricRow}>
                  <span style={styles.metricLabel}>Εύρος Τιμών</span>
                  <strong style={styles.metricVal}>€{suburbA.minRent || 0} – €{suburbA.maxRent || 0}</strong>
                </div>
                <div style={styles.metricRow}>
                  <span style={styles.metricLabel}>Δείγμα Αγγελιών</span>
                  <strong style={styles.metricVal}>{suburbA.listingsCount || 0} ακίνητα</strong>
                </div>
              </div>
            </div>

            <div style={{ ...styles.areaCard, borderTop: `3.5px solid ${getTierColor(priceB)}` }}>
              <div style={styles.areaHeader}>
                <h4 style={styles.areaTitle}>{suburbB.name}</h4>
                <span style={{ ...styles.pill, backgroundColor: getTierColor(priceB) }}>
                  €{priceB.toFixed(1)} / m²
                </span>
              </div>
              <div style={styles.metricsList}>
                <div style={styles.metricRow}>
                  <span style={styles.metricLabel}>Μέσο Ενοίκιο</span>
                  <strong style={styles.metricVal}>€{rentB} / μήνα</strong>
                </div>
                <div style={styles.metricRow}>
                  <span style={styles.metricLabel}>Εύρος Τιμών</span>
                  <strong style={styles.metricVal}>€{suburbB.minRent || 0} – €{suburbB.maxRent || 0}</strong>
                </div>
                <div style={styles.metricRow}>
                  <span style={styles.metricLabel}>Δείγμα Αγγελιών</span>
                  <strong style={styles.metricVal}>{suburbB.listingsCount || 0} ακίνητα</strong>
                </div>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div style={styles.emptyPrompt}>
          Επιλέξτε δύο γειτονιές από τα παραπάνω πεδία για να δείτε τη μεταξύ τους σύγκριση.
        </div>
      )}
    </div>
  );
}

const styles = {
  card: {
    backgroundColor: '#FFFDF9',
    border: '1px solid #E7DFCD',
    borderRadius: '14px',
    padding: '1.25rem',
    marginTop: '1.25rem',
    boxShadow: '0 4px 18px rgba(0,0,0,0.02)',
    fontFamily: 'system-ui, -apple-system, sans-serif',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1rem',
    flexWrap: 'wrap',
    gap: '0.5rem',
  },
  title: {
    fontFamily: "'Fraunces', Georgia, serif",
    fontSize: '1.15rem',
    fontWeight: '600',
    color: '#16212B',
    margin: 0,
  },
  badge: {
    fontSize: '0.72rem',
    fontWeight: '700',
    backgroundColor: '#EAF2F1',
    color: '#0F766E',
    padding: '0.2rem 0.6rem',
    borderRadius: '999px',
  },
  selectorGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr auto 1fr',
    gap: '0.75rem',
    alignItems: 'flex-end',
    marginBottom: '1rem',
  },
  selectCol: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.3rem',
  },
  label: {
    fontSize: '0.72rem',
    fontWeight: '700',
    color: '#7A7264',
    textTransform: 'uppercase',
  },
  select: {
    backgroundColor: '#FFFFFF',
    border: '1px solid #D1D5DB',
    borderRadius: '8px',
    padding: '0.55rem 0.75rem',
    fontSize: '0.85rem',
    color: '#16212B',
    fontWeight: '600',
    outline: 'none',
    cursor: 'pointer',
    fontFamily: 'system-ui, -apple-system, sans-serif',
  },
  dividerWrapper: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: '0.6rem',
  },
  summaryBanner: {
    backgroundColor: '#F0FDF4',
    border: '1px solid #BBF7D0',
    borderRadius: '8px',
    padding: '0.65rem 0.9rem',
    fontSize: '0.82rem',
    color: '#166534',
    marginBottom: '1rem',
    textAlign: 'center',
  },
  comparisonGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
    gap: '0.85rem',
  },
  areaCard: {
    backgroundColor: '#FFFFFF',
    border: '1px solid #E5E7EB',
    borderRadius: '10px',
    padding: '0.9rem 1.1rem',
    boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
  },
  areaHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '0.75rem',
    paddingBottom: '0.45rem',
    borderBottom: '1px solid #F3F4F6',
  },
  areaTitle: {
    fontFamily: "'Fraunces', Georgia, serif",
    fontSize: '1.05rem',
    fontWeight: '600',
    color: '#16212B',
    margin: 0,
  },
  pill: {
    color: '#FFFFFF',
    fontSize: '0.72rem',
    fontWeight: '700',
    padding: '0.2rem 0.55rem',
    borderRadius: '999px',
  },
  metricsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.45rem',
  },
  metricRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '0.8rem',
  },
  metricLabel: {
    color: '#6B7280',
  },
  metricVal: {
    color: '#16212B',
  },
  emptyPrompt: {
    textAlign: 'center',
    padding: '1.25rem 1rem',
    fontSize: '0.82rem',
    color: '#7A7264',
    backgroundColor: '#FFFFFF',
    border: '1px dashed #D1D5DB',
    borderRadius: '8px',
  },
};