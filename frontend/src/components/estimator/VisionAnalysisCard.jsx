import React from 'react';
import { Sparkles, Star, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { styles } from './estimator.styles';

export default function VisionAnalysisCard({ visionLoading, visionResult }) {
  if (!visionLoading && (!visionResult || visionResult.error)) {
    return null;
  }

  const isHighQuality = visionResult && visionResult.score >= 8.8;

  return (
    <div style={styles.visionCard}>
      <div style={styles.visionCardHeader}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Sparkles size={18} color="#0F766E" />
          <h4 style={styles.visionTitle}>Οπτική Αξιολόγηση Ακινήτου (AI Vision)</h4>
        </div>
        {visionResult && visionResult.score && (
          <div style={styles.visionScoreBadge}>
            <Star size={14} color="#C98A3E" fill="#C98A3E" />
            <span>{visionResult.score} / 10</span>
          </div>
        )}
      </div>

      {/* Spinner φόρτωσης */}
      {visionLoading && (
        <div style={styles.loaderContainer}>
          <Loader2 size={28} color="#0F766E" className="spin" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
            <span style={{ fontSize: '0.88rem', fontWeight: '600', color: '#16212B' }}>
              Ανάλυση φωτογραφιών σε εξέλιξη...
            </span>
            <span style={{ fontSize: '0.78rem', color: '#7A7264' }}>
              Το AI εξετάζει τους χώρους και τη φωτεινότητα
            </span>
          </div>
        </div>
      )}

      {visionResult && !visionLoading && (
        <div style={styles.visionBody}>
          {visionResult.summary && (
            <p style={styles.visionSummaryText}>{visionResult.summary}</p>
          )}

          {visionResult.highlights && visionResult.highlights.length > 0 && (
            <div style={styles.visionListBlock}>
              <span style={styles.listBlockTitle}>Δυνατά Σημεία:</span>
              <ul style={styles.visionList}>
                {visionResult.highlights.map((h, i) => (
                  <li key={i} style={styles.visionListItemPositive}>
                    <CheckCircle2 size={15} color="#0F766E" style={{ flexShrink: 0, marginTop: '2px' }} />
                    <span>{h}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {visionResult.observations && visionResult.observations.length > 0 && (
            <div style={styles.visionListBlock}>
              <span style={styles.listBlockTitle}>
                {isHighQuality ? "Κατάσταση Χώρων:" : "Σημεία Προσοχής & Προτάσεις Ανακαίνισης:"}
              </span>
              <ul style={styles.visionList}>
                {visionResult.observations.map((obs, i) => (
                  <li 
                    key={i} 
                    style={isHighQuality ? styles.visionListItemPositive : styles.visionListItemObservation}
                  >
                    {isHighQuality ? (
                      <CheckCircle2 size={15} color="#0F766E" style={{ flexShrink: 0, marginTop: '2px' }} />
                    ) : (
                      <AlertCircle size={15} color="#C98A3E" style={{ flexShrink: 0, marginTop: '2px' }} />
                    )}
                    <span>{obs}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}