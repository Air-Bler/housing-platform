import React from 'react';
import { Calculator, Hammer, MapPin, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Features() {
  const navigate = useNavigate();

  const featuresList = [
    {
      icon: <Calculator size={24} color="#0F766E" />,
      tag: "ΓΙΑ ΕΝΟΙΚΙΑΣΤΕΣ & ΙΔΙΟΚΤΗΤΕΣ",
      title: "Fair Rent Estimator",
      desc: "Εκτιμήστε άμεσα τη δίκαιη τιμή ενοικίασης βάσει τετραγωνικών, ορόφου, έτους κατασκευής και απόστασης απο υπηρεσίες.",
      points: ["Ανάλυση πραγματικών δεδομένων", "Εκτίμηση εύρους μισθώματος", "Σύγκριση με μέσο όρο γειτονιάς"],
      link: "/estimator",
      btnText: "Υπολογισμός Ενοικίου",
      accent: "#0F766E",
      bg: "#EAF2F1"
    },
    {
      icon: <Hammer size={24} color="#C98A3E" />,
      tag: "ΓΙΑ ΕΠΕΝΔΥΤΕΣ & ΙΔΙΟΚΤΗΤΕΣ",
      title: "Renovation ROI & Vision",
      desc: "Υπολογίστε αν σας συμφέρει να ανακαινίσετε το ακίνητό σας και ανεβάστε φωτογραφίες για έξυπνη ανάλυση κατάστασης.",
      points: ["Εκτίμηση αύξησης ενοικίου", "Υπολογισμός απόσβεσης κόστους", "Vision AI ανάλυση φωτογραφιών"],
      link: "/roi",
      btnText: "Ανάλυση Ανακαίνισης",
      accent: "#C98A3E",
      bg: "#FDF6EC"
    },
    {
      icon: <MapPin size={24} color="#B33F30" />,
      tag: "ΕΡΕΥΝΑ ΑΓΟΡΑΣ",
      title: "Διαδραστικός Χάρτης Τιμών",
      desc: "Εξερευνήστε τις πραγματικές τιμές ανά m² σε όλη την Αττική, συγκρίνετε γειτονιές και δείτε αναλυτικά rankings.",
      points: ["Heatmap 60+ αξιόπιστων γειτονιών", "Σύγκριση γειτονιών", "Διαδραστικά γραφήματα τιμών"],
      link: "/prices",
      btnText: "Άνοιγμα Χάρτη",
      accent: "#B33F30",
      bg: "#FBEAE7"
    }
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

        <div style={styles.grid}>
          {featuresList.map((f, idx) => (
            <div
              key={idx}
              style={styles.card}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 12px 28px rgba(0,0,0,0.08)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 10px rgba(0,0,0,0.03)';
              }}
            >
              <div style={styles.cardTop}>
                <div style={{ ...styles.iconWrapper, backgroundColor: f.bg }}>
                  {f.icon}
                </div>
                <span style={{ ...styles.tag, color: f.accent }}>{f.tag}</span>
              </div>

              <h3 style={styles.cardTitle}>{f.title}</h3>
              <p style={styles.cardDesc}>{f.desc}</p>

              <div style={styles.pointsList}>
                {f.points.map((p, pIdx) => (
                  <div key={pIdx} style={styles.pointRow}>
                    <CheckCircle2 size={15} color={f.accent} style={{ flexShrink: 0 }} />
                    <span>{p}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => navigate(f.link)}
                style={{ ...styles.btn, backgroundColor: f.accent }}
              >
                <span>{f.btnText}</span>
                <ArrowRight size={16} />
              </button>
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
    fontFamily: 'Arial, sans-serif',
  },
  inner: {
    maxWidth: '1200px',
    margin: '0 auto',
  },
  header: {
    textAlign: 'center',
    marginBottom: '3rem',
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
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
    gap: '1.5rem',
  },
  card: {
    backgroundColor: '#FFFFFF',
    border: '1px solid #E7DFCD',
    borderRadius: '16px',
    padding: '1.8rem 1.6rem',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
    transition: 'all 0.25s ease',
  },
  cardTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.2rem',
  },
  iconWrapper: {
    width: '46px',
    height: '46px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tag: {
    fontSize: '0.68rem',
    fontWeight: '700',
    letterSpacing: '0.5px',
  },
  cardTitle: {
    fontFamily: "'Fraunces', Georgia, serif",
    fontSize: '1.35rem',
    fontWeight: '700',
    color: '#16212B',
    margin: '0 0 0.5rem 0',
  },
  cardDesc: {
    fontSize: '0.88rem',
    color: '#52606B',
    lineHeight: '1.5',
    marginBottom: '1.25rem',
    minHeight: '42px',
  },
  pointsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.6rem',
    marginBottom: '1.75rem',
    marginTop: 'auto',
    paddingTop: '1rem',
    borderTop: '1px solid #F3F4F6',
  },
  pointRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '0.82rem',
    color: '#374151',
    fontWeight: '500',
  },
  btn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '10px',
    padding: '0.75rem 1rem',
    fontSize: '0.88rem',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'opacity 0.2s ease',
  },
};