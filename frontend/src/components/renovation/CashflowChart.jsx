import React, { useRef, useState } from 'react';
import { renovationStyles as rs, SCENARIO_COLORS, formatEuro } from './renovation.styles';

const W = 760;
const H = 320;
const M = { top: 16, right: 150, bottom: 36, left: 64 };
const PLOT_W = W - M.left - M.right;
const PLOT_H = H - M.top - M.bottom;

const SURFACE = '#FFFDF9';
const INK_MUTED = '#7A7264';
const INK_SECONDARY = '#52606B';
const GRID = '#EFE8DA';
const BASELINE = '#9A9184';

function niceTicks(min, max, count = 5) {
  const span = max - min || 1;
  const rawStep = span / count;
  const mag = Math.pow(10, Math.floor(Math.log10(rawStep)));
  const step = [1, 2, 2.5, 5, 10].map((m) => m * mag).find((s) => span / s <= count) || 10 * mag;
  const ticks = [Math.floor(min / step) * step];
  while (ticks[ticks.length - 1] < max) ticks.push(ticks[ticks.length - 1] + step);
  return ticks;
}

const formatK = (v) => {
  if (v === 0) return '€0';
  const abs = Math.abs(v);
  const s = abs >= 1000 ? `€${(abs / 1000).toLocaleString('el-GR', { maximumFractionDigits: 1 })}k` : `€${abs}`;
  return v < 0 ? `−${s}` : s;
};

export default function CashflowChart({ scenarios }) {
  const wrapperRef = useRef(null);
  const [hoverYear, setHoverYear] = useState(null);
  const [showTable, setShowTable] = useState(false);

  const years = scenarios[0].cumulative_cashflow.length - 1;
  const allValues = scenarios.flatMap((s) => s.cumulative_cashflow);
  const ticks = niceTicks(Math.min(0, ...allValues), Math.max(0, ...allValues));
  const yMin = ticks[0];
  const yMax = ticks[ticks.length - 1];

  const x = (year) => M.left + (year / years) * PLOT_W;
  const y = (v) => M.top + (1 - (v - yMin) / (yMax - yMin)) * PLOT_H;

  // Άμεσες ετικέτες στο τέλος κάθε γραμμής, με ελάχιστη απόσταση για να μην επικαλύπτονται
  const endLabels = scenarios
    .map((s) => ({ key: s.key, name: s.name, value: s.cumulative_cashflow[years], y: y(s.cumulative_cashflow[years]) }))
    .sort((a, b) => a.y - b.y);
  for (let i = 1; i < endLabels.length; i++) {
    if (endLabels[i].y - endLabels[i - 1].y < 30) endLabels[i].y = endLabels[i - 1].y + 30;
  }

  const handleMove = (e) => {
    const rect = e.currentTarget.ownerSVGElement.getBoundingClientRect();
    const svgX = ((e.clientX - rect.left) / rect.width) * W;
    const year = Math.round(((svgX - M.left) / PLOT_W) * years);
    setHoverYear(Math.max(0, Math.min(years, year)));
  };

  const tooltipLeftPct = hoverYear !== null ? (x(hoverYear) / W) * 100 : 0;

  return (
    <div style={rs.chartCard}>
      <div style={rs.chartHeader}>
        <div>
          <h3 style={{ ...rs.sectionHeading, fontSize: '1.05rem' }}>Πορεία απόσβεσης — σωρευτική καθαρή ροή</h3>
          <p style={rs.sectionSub}>
            Ξεκινά αρνητικά (κόστος ανακαίνισης) και ανεβαίνει με το καθαρό ενοίκιο κάθε χρονιάς. Όπου περνά το €0, έχει γίνει απόσβεση.
          </p>
        </div>
        <button type="button" style={rs.toggleBtn} onClick={() => setShowTable((v) => !v)}>
          {showTable ? 'Διάγραμμα' : 'Πίνακας'}
        </button>
      </div>

      <div style={rs.legend}>
        {scenarios.map((s) => (
          <span key={s.key} style={rs.legendItem}>
            <span style={{ ...rs.legendLine, backgroundColor: SCENARIO_COLORS[s.key] }} />
            {s.name}
          </span>
        ))}
        <span style={rs.legendItem}>
          <svg width="12" height="12" aria-hidden="true">
            <circle cx="6" cy="6" r="4" fill={INK_SECONDARY} stroke={SURFACE} strokeWidth="2" />
          </svg>
          Σημείο απόσβεσης
        </span>
      </div>

      {showTable ? (
        <div style={{ overflowX: 'auto', marginTop: '0.75rem' }}>
          <table style={rs.table}>
            <thead>
              <tr>
                <th style={{ ...rs.th, textAlign: 'left' }}>Έτος</th>
                {scenarios.map((s) => (
                  <th key={s.key} style={rs.th}>{s.name}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {scenarios[0].cumulative_cashflow.map((_, year) => (
                <tr key={year}>
                  <td style={{ ...rs.td, textAlign: 'left' }}>{year === 0 ? 'Έναρξη' : `${year}ο`}</td>
                  {scenarios.map((s) => (
                    <td key={s.key} style={{ ...rs.td, color: s.cumulative_cashflow[year] < 0 ? '#8A3226' : '#16212B' }}>
                      {formatEuro(s.cumulative_cashflow[year])}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div ref={wrapperRef} style={{ position: 'relative', marginTop: '0.5rem' }}>
          <svg
            viewBox={`0 0 ${W} ${H}`}
            width="100%"
            role="img"
            aria-label="Σωρευτική καθαρή ταμειακή ροή ανά σενάριο για 10 χρόνια"
            style={{ display: 'block', overflow: 'visible' }}
          >
            {/* Πλέγμα & άξονας Y */}
            {ticks.map((t) => (
              <g key={t}>
                <line x1={M.left} x2={M.left + PLOT_W} y1={y(t)} y2={y(t)} stroke={t === 0 ? BASELINE : GRID} strokeWidth={t === 0 ? 1.5 : 1} />
                <text x={M.left - 10} y={y(t)} dy="0.32em" textAnchor="end" fontSize="12" fill={INK_MUTED}>
                  {formatK(t)}
                </text>
              </g>
            ))}
            <text x={M.left + PLOT_W} y={y(0) - 6} textAnchor="end" fontSize="11" fill={INK_SECONDARY} fontWeight="600">
              Σημείο απόσβεσης (€0)
            </text>

            {/* Άξονας X */}
            {Array.from({ length: years + 1 }, (_, i) => i).map((yr) => (
              <text key={yr} x={x(yr)} y={H - M.bottom + 20} textAnchor="middle" fontSize="12" fill={INK_MUTED}>
                {yr === 0 ? 'Σήμερα' : `${yr}ο`}
              </text>
            ))}

            {/* Crosshair */}
            {hoverYear !== null && (
              <line x1={x(hoverYear)} x2={x(hoverYear)} y1={M.top} y2={M.top + PLOT_H} stroke={INK_SECONDARY} strokeWidth="1" strokeDasharray="3 3" />
            )}

            {/* Γραμμές σεναρίων */}
            {scenarios.map((s) => (
              <polyline
                key={s.key}
                points={s.cumulative_cashflow.map((v, i) => `${x(i)},${y(v)}`).join(' ')}
                fill="none"
                stroke={SCENARIO_COLORS[s.key]}
                strokeWidth="2"
                strokeLinejoin="round"
                strokeLinecap="round"
              />
            ))}

            {/* Σημεία απόσβεσης */}
            {scenarios
              .filter((s) => s.payback_years !== null && s.payback_years <= years)
              .map((s) => (
                <circle
                  key={s.key}
                  cx={x(s.payback_years)}
                  cy={y(0)}
                  r="5"
                  fill={SCENARIO_COLORS[s.key]}
                  stroke={SURFACE}
                  strokeWidth="2"
                />
              ))}

            {/* Σημεία hover */}
            {hoverYear !== null &&
              scenarios.map((s) => (
                <circle
                  key={s.key}
                  cx={x(hoverYear)}
                  cy={y(s.cumulative_cashflow[hoverYear])}
                  r="4.5"
                  fill={SCENARIO_COLORS[s.key]}
                  stroke={SURFACE}
                  strokeWidth="2"
                />
              ))}

            {/* Άμεσες ετικέτες */}
            {endLabels.map((l) => (
              <g key={l.key}>
                <rect x={M.left + PLOT_W + 10} y={l.y - 5} width="10" height="10" rx="3" fill={SCENARIO_COLORS[l.key]} />
                <text x={M.left + PLOT_W + 26} y={l.y} dy="0.32em" fontSize="12" fill="#16212B" fontWeight="600">
                  {formatK(l.value)}
                </text>
                <text x={M.left + PLOT_W + 26} y={l.y + 14} dy="0.32em" fontSize="11" fill={INK_MUTED}>
                  {l.name}
                </text>
              </g>
            ))}

            {/* Ζώνη αλληλεπίδρασης */}
            <rect
              x={M.left - 10}
              y={M.top}
              width={PLOT_W + 20}
              height={PLOT_H}
              fill="transparent"
              onMouseMove={handleMove}
              onMouseLeave={() => setHoverYear(null)}
            />
          </svg>

          {hoverYear !== null && (
            <div
              style={{
                ...rs.tooltip,
                top: '8px',
                left: `${tooltipLeftPct}%`,
                transform: tooltipLeftPct > 55 ? 'translateX(calc(-100% - 12px))' : 'translateX(12px)',
              }}
            >
              <div style={{ fontWeight: '700', marginBottom: '0.2rem' }}>
                {hoverYear === 0 ? 'Σήμερα (μετά την ανακαίνιση)' : `Τέλος ${hoverYear}ου έτους`}
              </div>
              {scenarios.map((s) => (
                <div key={s.key} style={rs.tooltipRow}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                    <span style={{ ...rs.swatch, width: '9px', height: '9px', backgroundColor: SCENARIO_COLORS[s.key] }} />
                    {s.name}
                  </span>
                  <strong>{formatEuro(s.cumulative_cashflow[hoverYear])}</strong>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
