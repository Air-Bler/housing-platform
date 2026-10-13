import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calculator, Hammer, Map } from 'lucide-react';
import { apiFetch } from '../../api';

const TOOLS = [
  { path: '/estimator', label: 'Fair Rent Estimator', icon: Calculator },
  { path: '/renovation', label: 'Renovation ROI', icon: Hammer },
  { path: '/heatmap', label: 'Χάρτης Τιμών', icon: Map },
];

export default function Footer() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    apiFetch('/api/model-stats').then(setStats).catch(() => setStats(null));
  }, []);

  return (
    <footer style={styles.footer}>
      <style>{`
        .footer-grid { display: grid; grid-template-columns: 1.4fr 1fr 1.6fr; gap: 2.5rem; }
        .footer-link { color: #C7D0D6; text-decoration: none; transition: color 0.2s ease; }
        .footer-link:hover { color: #C98A3E; }
        @media (max-width: 820px) {
          .footer-grid { grid-template-columns: 1fr; gap: 2rem; }
        }
      `}</style>

      <div style={styles.inner}>
        <div className="footer-grid">
          <div>
            <Link to="/" style={styles.brand}>
              <span style={styles.logoBadge}>
                <img src="/data/logo.png" alt="" style={styles.logo} />
              </span>
              <span style={styles.brandText}>StegiAthens</span>
            </Link>
            <p style={styles.text}>
              Δείχνουμε στους ενοικιαστές αν πληρώνουν όσο πρέπει, και στους ιδιοκτήτες αν αξίζει να
              ανακαινίσουν ή να πουλήσουν.
            </p>
          </div>

          <nav aria-label="Εργαλεία">
            <h4 style={styles.heading}>Εργαλεία</h4>
            <ul style={styles.list}>
              {TOOLS.map(({ path, label, icon: Icon }) => (
                <li key={path}>
                  <Link to={path} className="footer-link" style={styles.toolLink}>
                    <Icon size={15} />
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <h4 style={styles.heading}>Δεδομένα & ακρίβεια</h4>
            {stats && (
              <p style={styles.text}>
                Οι εκτιμήσεις βασίζονται σε {stats.dataset_size.toLocaleString('el-GR')} αγγελίες ενοικίασης
                στην Αθήνα. Μέσο σφάλμα ±€{Math.round(stats.mae)} τον μήνα, μετρημένο σε{' '}
                {stats.test_size.toLocaleString('el-GR')} αγγελίες που δεν χρησιμοποιήθηκαν στην εκπαίδευση.
              </p>
            )}
            <p style={styles.text}>
              Οι εκτιμήσεις είναι ενδεικτικές και δεν αποτελούν επαγγελματική εκτίμηση ακινήτου ή
              επενδυτική συμβουλή.
            </p>
            <p style={styles.text}>
              Οι φωτογραφίες που ανεβάζετε αποστέλλονται στην OpenAI μόνο για την ανάλυση και δεν
              αποθηκεύονται από την εφαρμογή.
            </p>
          </div>
        </div>

        <div style={styles.bottom}>
          <span>© {new Date().getFullYear()} StegiAthens</span>
        </div>
      </div>
    </footer>
  );
}

const styles = {
  footer: {
    backgroundColor: '#16212B',
    color: '#C7D0D6',
    borderTop: '3px solid #C98A3E',
    fontFamily: "'Inter', Arial, sans-serif",
    padding: '3.5rem 1.5rem 1.5rem',
  },
  inner: {
    maxWidth: '1100px',
    margin: '0 auto',
  },
  brand: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.6rem',
    textDecoration: 'none',
    marginBottom: '0.9rem',
  },
  logoBadge: {
    display: 'inline-flex',
    backgroundColor: '#FFFDF9',
    borderRadius: '50%',
    width: '40px',
    height: '40px',
    overflow: 'hidden',
    flexShrink: 0,
  },
  logo: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    display: 'block',
  },
  brandText: {
    fontFamily: "'Fraunces', Georgia, serif",
    fontSize: '1.4rem',
    fontWeight: 700,
    color: '#FFFDF9',
    letterSpacing: '-0.02em',
  },
  heading: {
    fontFamily: "'Fraunces', Georgia, serif",
    fontSize: '1rem',
    fontWeight: 600,
    color: '#FFFDF9',
    margin: '0 0 0.9rem',
  },
  text: {
    fontSize: '0.85rem',
    lineHeight: 1.6,
    margin: '0 0 0.7rem',
    maxWidth: '420px',
  },
  list: {
    listStyle: 'none',
    margin: 0,
    padding: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: '0.65rem',
  },
  toolLink: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '0.9rem',
  },
  bottom: {
    marginTop: '2.5rem',
    paddingTop: '1.25rem',
    borderTop: '1px solid rgba(199, 208, 214, 0.18)',
    fontSize: '0.8rem',
    color: '#8C99A3',
  },
};
