import React from 'react';
import { Sparkles, Star, CheckCircle2, AlertCircle, Zap, ClipboardList } from 'lucide-react';
import { styles } from '../estimator/estimator.styles';

function DiagnosisList({ title, items, icon: Icon, color, itemStyle }) {
  if (!items || items.length === 0) return null;
  return (
    <div style={styles.visionListBlock}>
      <span style={styles.listBlockTitle}>{title}</span>
      <ul style={styles.visionList}>
        {items.map((text, i) => (
          <li key={i} style={itemStyle}>
            <Icon size={15} color={color} style={{ flexShrink: 0, marginTop: '2px' }} />
            <span>{text}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function RenovationDiagnosisCard({ vision, conditionLabel, detectedNeeds }) {
  const hasVision = vision && !vision.error;

  return (
    <div style={styles.visionCard}>
      <div style={styles.visionCardHeader}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {hasVision ? <Sparkles size={18} color="#0F766E" /> : <ClipboardList size={18} color="#0F766E" />}
          <h4 style={styles.visionTitle}>{hasVision ? 'AI Διάγνωση Ακινήτου' : 'Διάγνωση Ακινήτου'}</h4>
        </div>
        {hasVision && vision.condition_score && (
          <div style={styles.visionScoreBadge}>
            <Star size={14} color="#C98A3E" fill="#C98A3E" />
            <span>{vision.condition_score} / 10</span>
          </div>
        )}
      </div>

      <div style={styles.visionBody}>
        <p style={styles.visionSummaryText}>
          {hasVision && vision.summary ? vision.summary : `Κατάσταση: ${conditionLabel}.`}
        </p>

        {vision && vision.error && (
          <span style={{ fontSize: '0.78rem', color: '#8A3226' }}>
            Οι φωτογραφίες δεν αναλύθηκαν — η εκτίμηση βασίζεται στην κατάσταση που δηλώσατε.
          </span>
        )}

        {hasVision && (
          <>
            <DiagnosisList
              title="Τι εντοπίστηκε:"
              items={vision.detected_issues}
              icon={AlertCircle}
              color="#C98A3E"
              itemStyle={styles.visionListItemObservation}
            />
            <DiagnosisList
              title="Αξίζει να διατηρηθούν:"
              items={vision.strengths}
              icon={CheckCircle2}
              color="#0F766E"
              itemStyle={styles.visionListItemPositive}
            />
            <DiagnosisList
              title="Quick wins (μικρό κόστος, μεγάλη διαφορά):"
              items={vision.quick_wins}
              icon={Zap}
              color="#0F766E"
              itemStyle={styles.visionListItemPositive}
            />
          </>
        )}

        {detectedNeeds && detectedNeeds.length > 0 && (
          <DiagnosisList
            title="Εργασίες που υπολογίστηκαν ως απαραίτητες:"
            items={detectedNeeds.map((n) => n.label)}
            icon={ClipboardList}
            color="#52606B"
            itemStyle={styles.visionListItemObservation}
          />
        )}
      </div>
    </div>
  );
}
