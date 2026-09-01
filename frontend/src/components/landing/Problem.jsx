import React from 'react';
import { AlertTriangle, Compass } from 'lucide-react';

export default function Problem() {
  return (
    <section style={styles.section}>
      <div style={styles.container}>
        
        {/* Header */}
        <div style={styles.header}>
          <span style={styles.topBadge}>ΤΟ ΠΡΟΒΛΗΜΑ</span>
          <h2 style={styles.title}>
            Η στεγαστική κρίση της Αθήνας δεν είναι μόνο θέμα τιμών.
          </h2>
          <p style={styles.subtitle}>
            Χιλιάδες κατοικίες παραμένουν κλειστές, ενώ η ζήτηση για διαθέσιμα σπίτια αυξάνεται. Το αποτέλεσμα είναι μια αγορά που γίνεται όλο και πιο δύσκολη για όσους ψάχνουν σπίτι.
          </p>
        </div>

        {/* 2 Clean Cards */}
        <div style={styles.grid}>
          
          {/* Κόκκινο Block */}
          <div style={styles.redCard}>
            <div style={styles.iconRow}>
              <AlertTriangle size={20} color="#B33F30" />
            </div>
            <span style={styles.redTag}>Η ΠΡΟΚΛΗΣΗ</span>
            <h3 style={styles.cardTitle}>Πολλά σπίτια μένουν εκτός αγοράς.</h3>
            <p style={styles.cardText}>
              Κλειστές και αναξιοποίητες κατοικίες συνυπάρχουν με μια αυξανόμενη ανάγκη για διαθέσιμη στέγαση.
            </p>
            <p style={styles.cardText}>
              Παράλληλα, η εικόνα της αγοράς διαφέρει σημαντικά από γειτονιά σε γειτονιά και δεν είναι πάντα εύκολο να γίνει κατανοητή.
            </p>
          </div>

          {/* Γαλάζιο Block */}
          <div style={styles.blueCard}>
            <div style={styles.iconRow}>
              <Compass size={20} color="#0284C7" />
            </div>
            <span style={styles.blueTag}>Η ΠΡΟΣΕΓΓΙΣΗ ΜΑΣ</span>
            <h3 style={styles.cardTitle}>Κάνουμε την αγορά πιο κατανοητή.</h3>
            <p style={styles.cardText}>
              Συγκεντρώνουμε πραγματικά δεδομένα από την αγορά ακινήτων και τα μετατρέπουμε σε χρήσιμη πληροφορία για κάθε γειτονιά.
            </p>
            <p style={styles.cardText}>
              Έτσι βοηθάμε ενοικιαστές και ιδιοκτήτες να βλέπουν την πραγματική εικόνα της αγοράς και να παίρνουν πιο ενημερωμένες αποφάσεις.
            </p>
          </div>

        </div>

      </div>
    </section>
  );
}

const styles = {
  section: {
    padding: '4.5rem 1.5rem',
    backgroundColor: '#FFFFFF',
    fontFamily: 'system-ui, -apple-system, sans-serif',
    borderTop: '1px solid #ECEAE5',
    borderBottom: '1px solid #ECEAE5',
  },
  container: {
    maxWidth: '1100px',
    margin: '0 auto',
  },
  header: {
    maxWidth: '750px',
    marginBottom: '2.5rem',
  },
  topBadge: {
    fontSize: '0.75rem',
    fontWeight: '700',
    color: '#0F766E',
    letterSpacing: '1px',
    textTransform: 'uppercase',
    display: 'block',
    marginBottom: '0.4rem',
  },
  title: {
    fontFamily: "'Fraunces', Georgia, serif",
    fontSize: '2.2rem',
    fontWeight: '700',
    color: '#16212B',
    lineHeight: '1.22',
    margin: '0 0 0.75rem 0',
  },
  subtitle: {
    fontSize: '0.95rem',
    color: '#52606B',
    lineHeight: '1.55',
    margin: 0,
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
    gap: '1.5rem',
  },
  redCard: {
    backgroundColor: '#FFF5F5',
    borderLeft: '4px solid #B33F30',
    borderRadius: '6px',
    padding: '2rem 1.8rem',
  },
  blueCard: {
    backgroundColor: '#F0F9FF',
    borderLeft: '4px solid #0284C7',
    borderRadius: '6px',
    padding: '2rem 1.8rem',
  },
  iconRow: {
    marginBottom: '0.75rem',
  },
  redTag: {
    fontSize: '0.75rem',
    fontWeight: '700',
    color: '#B33F30',
    letterSpacing: '0.5px',
    display: 'block',
    marginBottom: '0.4rem',
  },
  blueTag: {
    fontSize: '0.75rem',
    fontWeight: '700',
    color: '#0284C7',
    letterSpacing: '0.5px',
    display: 'block',
    marginBottom: '0.4rem',
  },
  cardTitle: {
    fontFamily: "'Fraunces', Georgia, serif",
    fontSize: '1.3rem',
    fontWeight: '700',
    color: '#16212B',
    margin: '0 0 1rem 0',
    lineHeight: '1.3',
  },
  cardText: {
    fontSize: '0.9rem',
    color: '#4B5563',
    lineHeight: '1.6',
    margin: '0 0 0.75rem 0',
  },
};