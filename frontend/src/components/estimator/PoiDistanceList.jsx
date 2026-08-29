import React from 'react';
import { MapPin, TrainFront, GraduationCap, HeartPulse, Trees } from 'lucide-react';
import { styles, poiStyles } from './estimator.styles';

export default function PoiDistanceList({ poiDistances }) {
  if (!poiDistances) return null;

  const getProximityPercentage = (meters) => {
    if (!meters || meters <= 0) return 0;
    if (meters <= 300) return 100;
    if (meters >= 3000) return 10;
    return Math.max(10, Math.round(100 - ((meters - 300) / 2700) * 90));
  };

  const getProximityColor = (meters) => {
    if (meters <= 600) return '#0F766E';
    if (meters <= 1500) return '#C98A3E';
    return '#7A7264';
  };

  return (
    <div style={styles.infoCard}>
      <div style={styles.cardHeaderFlex}>
        <MapPin size={16} color="#0F766E" />
        <h4 style={styles.infoCardTitle}>Κοντινές Υποδομές & Προσβασιμότητα</h4>
      </div>

      <div style={styles.poiBarsContainer}>
        <PoiBarItem
          icon={<TrainFront size={16} color="#0F766E" />}
          title="Μετρό / ΗΣΑΠ"
          name={poiDistances.metro_name || "Σταθμός Μετρό"}
          distanceMeters={poiDistances.metro_m}
          getPercentage={getProximityPercentage}
          getColor={getProximityColor}
        />
        <PoiBarItem
          icon={<GraduationCap size={16} color="#0F766E" />}
          title="Πανεπιστήμιο"
          name={poiDistances.uni_name || "Πανεπιστημιούπολη"}
          distanceMeters={poiDistances.uni_m}
          getPercentage={getProximityPercentage}
          getColor={getProximityColor}
        />
        <PoiBarItem
          icon={<HeartPulse size={16} color="#0F766E" />}
          title="Νοσοκομείο"
          name={poiDistances.hospital_name || "Νοσοκομειακή Μονάδα"}
          distanceMeters={poiDistances.hospital_m}
          getPercentage={getProximityPercentage}
          getColor={getProximityColor}
        />
        <PoiBarItem
          icon={<Trees size={16} color="#0F766E" />}
          title="Πάρκο"
          name={poiDistances.park_name || "Πάρκο / Άλσος"}
          distanceMeters={poiDistances.park_m}
          getPercentage={getProximityPercentage}
          getColor={getProximityColor}
        />
      </div>
    </div>
  );
}

function PoiBarItem({ icon, title, name, distanceMeters, getPercentage, getColor }) {
  const pct = getPercentage(distanceMeters);
  const color = getColor(distanceMeters);

  return (
    <div style={poiStyles.itemContainer}>
      <div style={poiStyles.headerRow}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          {icon}
          <span style={poiStyles.titleText}>{title}</span>
          <span style={poiStyles.nameText}>({name})</span>
        </div>
        <span style={{ ...poiStyles.distanceText, color: color }}>
          ~{distanceMeters >= 1000 ? `${(distanceMeters / 1000).toFixed(1)}km` : `${distanceMeters}m`}
        </span>
      </div>

      <div style={poiStyles.track}>
        <div
          style={{
            ...poiStyles.fill,
            width: `${pct}%`,
            backgroundColor: color,
          }}
        />
      </div>
    </div>
  );
}