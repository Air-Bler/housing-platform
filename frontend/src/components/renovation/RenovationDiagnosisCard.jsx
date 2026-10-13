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
  // vision: null (χωρίς φωτογραφίες) | { status: 'completed', analysis } | { status: 'failed', error }
  const analysis = vision && vision.status === 'completed' ? vision.analysis : null;
  const hasVision = !!analysis;
  const failure = vision && vision.status === 'failed' ? vision.error : null;

  return (
    <div style={styles.visionCard}>
      <div style={styles.visionCardHeader}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {hasVision ? <Sparkles size={18} color="#0F766E" /> : <ClipboardList size={18} color="#0F766E" />}
          <h4 style={styles.visionTitle}>{hasVision ? 'AI Διάγνωση Ακινήτου' : 'Διάγνωση Ακινήτου'}</h4>
        </div>
        {hasVision && analysis.condition_score && (
          <div style={styles.visionScoreBadge}>
            <Star size={14} color="#C98A3E" fill="#C98A3E" />
            <span>{analysis.condition_score} / 10</span>
          </div>
        )}
      </div>

      <div style={styles.visionBody}>
        <p style={styles.visionSummaryText}>
          {hasVision && analysis.summary ? analysis.summary : `Κατάσταση: ${conditionLabel}.`}
        </p>

        {failure && (
          <span style={{ fontSize: '0.78rem', color: '#8A3226' }}>
            {failure.message} Οι φωτογραφίες δεν αναλύθηκαν — η εκτίμηση βασίζεται στην κατάσταση που δηλώσατε.
          </span>
        )}

        {hasVision && (
          <>
            <DiagnosisList
              title="Τι εντοπίστηκε:"
              items={analysis.detected_issues}
              icon={AlertCircle}
              color="#C98A3E"
              itemStyle={styles.visionListItemObservation}
            />
            <DiagnosisList
              title="Αξίζει να διατηρηθούν:"
              items={analysis.strengths}
              icon={CheckCircle2}
              color="#0F766E"
              itemStyle={styles.visionListItemPositive}
            />
            <DiagnosisList
              title="Quick wins (μικρό κόστος, μεγάλη διαφορά):"
              items={analysis.quick_wins}
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
