import React, { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  LabelList,
  ResponsiveContainer,
} from 'recharts';

export default function SuburbsTable({ suburbs, onSelectSuburb }) {
  const [showAll, setShowAll] = useState(false);


  const formattedData = [...suburbs]
    .filter((sub) => Number(sub.listingsCount || 0) >= 15)
    .map((sub) => {
      const price = Number(sub.avgSqmPrice || 0);
      let color = '#4C7A6D';
      if (price >= 14.0) color = '#B33F30';
      else if (price >= 10.5) color = '#C98A3E';

      return {
        name: sub.name,
        avgPrice: Number(price.toFixed(1)),
        listingsCount: Number(sub.listingsCount || 0),
        color: color,
        raw: sub,
      };
    })
    .sort((a, b) => b.avgPrice - a.avgPrice);

  const getSampleData = (data) => {
    if (!data || data.length === 0) return [];
    if (data.length <= 9) return data;

    const top3 = data.slice(0, 3);
    const midIndex = Math.floor(data.length / 2);
    const mid3 = data.slice(midIndex - 1, midIndex + 2);
    const low3 = data.slice(-3);

    return [...top3, ...mid3, ...low3];
  };

  const visibleChartData = showAll ? formattedData : getSampleData(formattedData);

  return (
    <div style={styles.chartCard}>
      <div style={styles.chartHeader}>
        <div>
          <h3 style={styles.chartTitle}>
            {showAll ? 'Όλες οι γειτονιές' : 'Δείγμα τιμών ανά κατηγορία γειτονιάς'}
          </h3>
          <span style={styles.chartSubtitle}>
            Κάντε κλικ σε μια μπάρα για να εστιάσετε στην αντίστοιχη περιοχή στον χάρτη
          </span>
        </div>
        <button onClick={() => setShowAll(!showAll)} style={styles.toggleBtn}>
          {showAll ? 'Προβολή δείγματος (9)' : `Προβολή όλων (${formattedData.length})`}
        </button>
      </div>

      <div
        style={{
          width: '100%',
          height: showAll ? '480px' : '320px',
          overflowY: showAll ? 'auto' : 'hidden',
          transition: 'height 0.3s ease',
          paddingRight: '0.5rem',
        }}
      >
        <ResponsiveContainer
          width="100%"
          height={showAll ? visibleChartData.length * 32 + 30 : 300}
        >
          <BarChart
            data={visibleChartData}
            layout="vertical"
            margin={{ top: 5, right: 65, left: 0, bottom: 5 }}
          >
            <XAxis
              type="number"
              tick={{ fontSize: 11, fill: '#7A7264' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              type="category"
              dataKey="name"
              width={140}
              tick={{ fontSize: 11, fill: '#16212B', fontWeight: 500 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              formatter={(value, name, item) => [
                `€${value}/m² (${item.payload.listingsCount} αγγελίες)`,
                'Μέσο ενοίκιο',
              ]}
              contentStyle={{
                fontSize: '12px',
                borderRadius: '8px',
                border: '1px solid #E7DFCD',
                fontFamily: 'Arial, sans-serif',
              }}
            />
            <Bar
              dataKey="avgPrice"
              radius={[0, 4, 4, 0]}
              barSize={14}
              onClick={(entry) => onSelectSuburb && onSelectSuburb(entry.raw)}
              style={{ cursor: 'pointer' }}
            >
              {visibleChartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
              <LabelList
                dataKey="avgPrice"
                position="right"
                formatter={(val) => `€${val}/m²`}
                style={{ fontSize: '11px', fontWeight: '600', fill: '#52606B' }}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

const styles = {
  chartCard: {
    backgroundColor: '#FFFDF9',
    border: '1px solid #E7DFCD',
    borderRadius: '12px',
    padding: '1.25rem 1.25rem 0.75rem',
    textAlign: 'left',
    boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
    fontFamily: 'Arial, sans-serif',
    marginTop: '1.5rem',
  },
  chartHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '1rem',
    flexWrap: 'wrap',
    gap: '0.5rem',
  },
  chartTitle: {
    fontSize: '1.15rem',
    fontWeight: '700',
    color: '#16212B',
    margin: '0 0 0.2rem 0',
  },
  chartSubtitle: {
    fontSize: '0.78rem',
    color: '#7A7264',
  },
  toggleBtn: {
    backgroundColor: '#EAF2F1',
    color: '#1D4E5F',
    border: '1px solid rgba(29, 78, 95, 0.2)',
    padding: '0.35rem 0.75rem',
    borderRadius: '6px',
    fontSize: '0.78rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
};