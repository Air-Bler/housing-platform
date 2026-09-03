import React from 'react';
import { Calculator, Hammer, MapPin, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Features() {
  const navigate = useNavigate();

  const secondaryFeatures = [
    {
      icon: <Hammer size={20} color="#C98A3E" />,
      tag: "ΓΙΑ ΕΠΕΝΔΥΤΕΣ & ΙΔΙΟΚΤΗΤΕΣ",
      title: "Renovation ROI & Vision",
      desc: "Δες αν σου συμφέρει να ανακαινίσεις, με εκτίμηση αύξησης ενοικίου και ανάλυση φωτογραφιών.",
      link: "/roi",
      linkText: "Ανάλυση Ανακαίνισης",
      accent: "#C98A3E",
      bg: "#FDF6EC",
    },
    {
      icon: <MapPin size={20} color="#B33F30" />,
      tag: "ΕΡΕΥΝΑ ΑΓΟΡΑΣ",
      title: "Διαδραστικός Χάρτης Τιμών",
      desc: "Πραγματικές τιμές ανά m² σε 60+ γειτονιές της Αττικής, με άμεση σύγκριση μεταξύ τους.",
      link: "/prices",
      linkText: "Άνοιγμα Χάρτη",
      accent: "#B33F30",
      bg: "#FBEAE7",
    },
  ];

  return (
    <section style={styles.section}>
      <div style={styles.inner}>
        <div style={styles.header}>
          <span style={styles.badge}>ΕΡΓΑΛΕΙΑ & ΔΥΝΑΤΟΤΗΤΕΣ</span>
          <h2 style={styles.title}>Όλα τα εργαλεία που χρειάζεστε σε ένα μέρος.</h2>
          <p style={styles.subtitle}>
            Βασισμένα σε αλγόριθμους ανάλυσης δεδομένων και 4.100+ πραγματικές αγγελίες της Αθήνας.
          </p>
        </div>

        
        <div style={styles.featuredCard}>
          <div style={styles.featuredText}>
            <div style={{ ...styles.iconWrapper, backgroundColor: '#EAF2F1' }}>
              <Calculator size={24} color="#0F766E" />
            </div>
            <span style={{ ...styles.tag, color: '#0F766E' }}>ΓΙΑ ΕΝΟΙΚΙΑΣΤΕΣ & ΙΔΙΟΚΤΗΤΕΣ</span>
            <h3 style={styles.featuredTitle}>Fair Rent Estimator</h3>
            <p style={styles.featuredDesc}>
              Εκτίμησε άμεσα τη δίκαιη τιμή ενοικίασης βάσει τετραγωνικών, ορόφου, έτους κατασκευής και
              απόστασης από υπηρεσίες, με σύγκριση στον μέσο όρο της γειτονιάς.
            </p>
            <button onClick={() => navigate('/estimator')} style={{ ...styles.btn, backgroundColor: '#0F766E' }}>
              <span>Υπολογισμός Ενοικίου</span>
              <ArrowRight size={16} />
            </button>
          </div>

        
          <div style={styles.previewWrap}>
            <div style={styles.previewCard}>
              <div style={styles.previewTopRow}>
                <span style={styles.previewLabel}>FAIR RENT ESTIMATE</span>
                <span style={styles.confidencePill}>89% confidence</span>
              </div>
              <div style={styles.previewPrice}>
                €657<span style={styles.previewPriceUnit}>/μήνα</span>
              </div>
              <div style={styles.previewSub}>Εύρος €583 – €732 · Καλλιθέα</div>
            </div>
          </div>
        </div>

      
        <div style={styles.secondaryGrid}>
          {secondaryFeatures.map((f, idx) => (
            <div key={idx} style={styles.secondaryCard}>
              <div style={{ ...styles.iconWrapperSm, backgroundColor: f.bg }}>{f.icon}</div>
              <div>
                <span style={{ ...styles.tag, color: f.accent }}>{f.tag}</span>
                <h4 style={styles.secondaryTitle}>{f.title}</h4>
                <p style={styles.secondaryDesc}>{f.desc}</p>
                <button onClick={() => navigate(f.link)} style={{ ...styles.linkBtn, color: f.accent }}>
                  {f.linkText} <ArrowRight size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const styles = {
  section: {
    padding: '4.5rem 1.5rem',
    backgroundColor: '#FDFBF7',
    fontFamily: "'Inter', Arial, sans-serif",
  },
  inner: {
    maxWidth: '1100px',
    margin: '0 auto',
  },
  header: {
    textAlign: 'center',
    marginBottom: '2.5rem',
  },
  badge: {
    display: 'inline-block',
    fontSize: '0.75rem',
    fontWeight: '700',
    color: '#0F766E',
    letterSpacing: '1px',
    textTransform: 'uppercase',
    marginBottom: '0.5rem',
  },
  title: {
    fontFamily: "'Fraunces', Georgia, serif",
    fontSize: '2.2rem',
    fontWeight: '700',
    color: '#16212B',
    margin: '0 0 0.6rem 0',
  },
  subtitle: {
    fontSize: '0.95rem',
    color: '#52606B',
    maxWidth: '600px',
    margin: '0 auto',
    lineHeight: '1.5',
  },

  /* Featured card */
  featuredCard: {
    display: 'grid',
    gridTemplateColumns: 'minmax(260px, 1fr) minmax(220px, 0.8fr)',
    gap: '1.5rem',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    border: '1px solid #E7DFCD',
    borderRadius: '16px',
    padding: '1.5rem 1.75rem',
    marginBottom: '1.25rem',
    boxShadow: '0 6px 24px rgba(0,0,0,0.04)',
  },
  featuredText: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  featuredTitle: {
    fontFamily: "'Fraunces', Georgia, serif",
    fontSize: '1.4rem',
    fontWeight: '700',
    color: '#16212B',
    margin: '0.4rem 0 0.4rem 0',
  },
  featuredDesc: {
    fontSize: '0.9rem',
    color: '#52606B',
    lineHeight: '1.5',
    marginBottom: '1rem',
  },

  previewWrap: {
    display: 'flex',
    justifyContent: 'center',
  },
  previewCard: {
    width: '100%',
    backgroundColor: '#0F4A45',
    borderRadius: '12px',
    padding: '1.1rem 1.25rem',
    color: '#FFFFFF',
  },
  previewTopRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '0.6rem',
  },
  previewLabel: {
    fontSize: '0.68rem',
    fontWeight: '700',
    letterSpacing: '0.06em',
    color: '#B9E0D8',
  },
  confidencePill: {
    fontSize: '0.65rem',
    fontWeight: '600',
    backgroundColor: 'rgba(255,255,255,0.15)',
    padding: '0.22rem 0.55rem',
    borderRadius: '999px',
  },
  previewPrice: {
    fontFamily: "'Fraunces', Georgia, serif",
    fontSize: '1.9rem',
    fontWeight: '700',
    lineHeight: 1,
  },
  previewPriceUnit: {
    fontSize: '0.9rem',
    fontWeight: '500',
    marginLeft: '0.3rem',
    color: '#B9E0D8',
  },
  previewSub: {
    fontSize: '0.76rem',
    color: '#CFE8E2',
    marginTop: '0.45rem',
  },

  /* Secondary tools */
  secondaryGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '1.25rem',
  },
  secondaryCard: {
    display: 'flex',
    gap: '1rem',
    padding: '1.25rem',
  },
  iconWrapper: {
    width: '46px',
    height: '46px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '0.9rem',
  },
  iconWrapperSm: {
    width: '38px',
    height: '38px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  tag: {
    fontSize: '0.68rem',
    fontWeight: '700',
    letterSpacing: '0.5px',
  },
  secondaryTitle: {
    fontFamily: "'Fraunces', Georgia, serif",
    fontSize: '1.05rem',
    fontWeight: '700',
    color: '#16212B',
    margin: '0.3rem 0 0.4rem 0',
  },
  secondaryDesc: {
    fontSize: '0.85rem',
    color: '#52606B',
    lineHeight: '1.5',
    marginBottom: '0.6rem',
  },
  linkBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.35rem',
    background: 'none',
    border: 'none',
    padding: 0,
    fontSize: '0.85rem',
    fontWeight: '700',
    cursor: 'pointer',
  },

  btn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '10px',
    padding: '0.7rem 1.1rem',
    fontSize: '0.88rem',
    fontWeight: '700',
    cursor: 'pointer',
  },
};