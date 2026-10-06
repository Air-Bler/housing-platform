import React from 'react';
import { Award, AlertTriangle } from 'lucide-react';
import { renovationStyles as rs, SCENARIO_COLORS, formatEuro, formatYears } from './renovation.styles';

export default function ScenarioCard({ scenario, selected, onSelect }) {
  const color = SCENARIO_COLORS[scenario.key];

  return (
    <button
      type="button"
      onClick={() => onSelect(scenario.key)}
      aria-pressed={selected}
      style={{
        ...rs.scenarioCard,
        borderColor: selected ? color : `${color} #E7DFCD #E7DFCD #E7DFCD`,
        ...(selected ? rs.scenarioCardSelected : {}),
      }}
    >
      {scenario.recommended && (
        <span style={rs.recommendedBadge}>
          <Award size={12} /> ΠΡΟΤΕΙΝΕΤΑΙ
        </span>
      )}

      <div>
        <h3 style={rs.scenarioName}>
          <span style={{ ...rs.swatch, backgroundColor: color }} />
          {scenario.name}
        </h3>
        <p style={{ ...rs.scenarioTagline, marginTop: '0.3rem' }}>{scenario.tagline}</p>
      </div>

      <div>
        <p style={rs.metricLabel}>Αναμενόμενο ενοίκιο</p>
        <div style={rs.scenarioRentRow}>
          <span style={rs.scenarioRent}>{formatEuro(scenario.monthly_rent)}</span>
          <span style={{ fontSize: '0.85rem', color: '#52606B' }}>/ μήνα</span>
        </div>
        <p style={{ ...rs.metricLabel, marginTop: '0.2rem' }}>
          Εύρος {formatEuro(scenario.rent_min)} – {formatEuro(scenario.rent_max)}
        </p>
      </div>

      <dl style={rs.metricList}>
        <div>
          <dt style={rs.metricLabel}>Κόστος ανακαίνισης</dt>
          <dd style={rs.metricValue}>{formatEuro(scenario.gross_cost)}</dd>
        </div>
        <div>
          <dt style={rs.metricLabel}>Απόσβεση</dt>
          <dd style={rs.metricValue}>{formatYears(scenario.payback_years)}</dd>
        </div>
        <div>
          <dt style={rs.metricLabel}>Καθαρό εισόδημα / έτος</dt>
          <dd style={rs.metricValue}>{formatEuro(scenario.annual_net)}</dd>
        </div>
        <div>
          <dt style={rs.metricLabel}>Ετήσια απόδοση (ROI)</dt>
          <dd style={rs.metricValue}>
            {scenario.annual_roi_pct !== null ? `${scenario.annual_roi_pct.toLocaleString('el-GR')}%` : '—'}
          </dd>
        </div>
        <div>
          <dt style={rs.metricLabel}>Κέρδος 10ετίας</dt>
          <dd style={rs.metricValue}>{formatEuro(scenario.profit_10y)}</dd>
        </div>
        <div>
          <dt style={rs.metricLabel}>Αύξηση αξίας ακινήτου</dt>
          <dd style={rs.metricValue}>+{formatEuro(scenario.value_uplift)}</dd>
        </div>
      </dl>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem' }}>
        <span style={rs.hint}>~{scenario.duration_weeks} εβδομάδες εργασιών</span>
        {!scenario.within_budget && (
          <span style={rs.overBudget}>
            <AlertTriangle size={13} /> Εκτός budget
          </span>
        )}
      </div>
    </button>
  );
}
