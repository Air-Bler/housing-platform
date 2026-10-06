import React from 'react';
import { Receipt } from 'lucide-react';
import { styles } from '../estimator/estimator.styles';
import { renovationStyles as rs, SCENARIO_COLORS, formatEuro } from './renovation.styles';

export default function CostBreakdown({ scenario }) {
  const color = SCENARIO_COLORS[scenario.key];

  return (
    <div style={styles.infoCard}>
      <div style={styles.cardHeaderFlex}>
        <Receipt size={16} color="#0F766E" />
        <h4 style={styles.infoCardTitle}>Ανάλυση κόστους — {scenario.name}</h4>
        <span style={{ ...rs.swatch, backgroundColor: color, marginLeft: 'auto' }} />
      </div>

      {scenario.items.map((item) => (
        <div key={item.key} style={rs.breakdownRow}>
          <span>
            {item.label}
            {item.critical && <span style={rs.criticalTag}>ΑΠΑΡΑΙΤΗΤΟ</span>}
          </span>
          <strong style={{ whiteSpace: 'nowrap' }}>{formatEuro(item.cost)}</strong>
        </div>
      ))}

      <div style={{ ...rs.breakdownRow, color: '#52606B' }}>
        <span>Απρόβλεπτα (10%)</span>
        <span style={{ whiteSpace: 'nowrap' }}>{formatEuro(scenario.contingency)}</span>
      </div>
      <div style={{ ...rs.breakdownRow, fontWeight: '700' }}>
        <span>Σύνολο ({formatEuro(scenario.cost_per_sqm)}/m²)</span>
        <span style={{ whiteSpace: 'nowrap' }}>{formatEuro(scenario.gross_cost)}</span>
      </div>
      {scenario.subsidy > 0 && (
        <>
          <div style={{ ...rs.breakdownRow, color: '#0F766E' }}>
            <span>Επιδότηση</span>
            <span style={{ whiteSpace: 'nowrap' }}>−{formatEuro(scenario.subsidy)}</span>
          </div>
          <div style={{ ...rs.breakdownRow, fontWeight: '700', borderBottom: 'none' }}>
            <span>Καθαρό κόστος για εσάς</span>
            <span style={{ whiteSpace: 'nowrap' }}>{formatEuro(scenario.net_cost)}</span>
          </div>
        </>
      )}

      <div style={{ ...styles.statsGrid, marginTop: '1rem' }}>
        <div style={styles.statBox}>
          <span style={styles.statLabel}>Ακαθάριστα έσοδα / έτος</span>
          <span style={styles.statValue}>{formatEuro(scenario.annual_gross)}</span>
        </div>
        <div style={styles.statBox}>
          <span style={styles.statLabel}>Φόροι & συντήρηση / έτος</span>
          <span style={styles.statValue}>−{formatEuro(scenario.annual_expenses)}</span>
        </div>
      </div>
    </div>
  );
}
