import React from 'react';
import { Link } from 'react-router-dom';
import { Calculator, Hammer, ShieldCheck, TrendingUp, AlertTriangle, MapPin, Home } from 'lucide-react';
import athensHero from '../assets/Athens-Monastiraki-Evening.jpg';

const LandingPage = () => {
  return (
    <div style={styles.container}>
      {/* Global CSS για animations */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&family=Inter:wght@400;500;600;700&display=swap');

        * { box-sizing: border-box; }

        /* General CTA & Card effects */
        .lp-cta {
          transition: transform 0.15s ease, box-shadow 0.15s ease, background-color 0.15s ease;
          cursor: pointer;
        }
        .lp-cta:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.35);
        }
        .lp-cta:focus-visible {
          outline: 3px solid #C98A3E;
          outline-offset: 2px;
        }

        .lp-feature-card {
          transition: transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease;
        }
        .lp-feature-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 10px 24px rgba(31, 42, 51, 0.08);
          border-color: #d8cdb8;
        }

        /* Ticket effect για τα stats */
        .lp-ticket {
          position: relative;
          background: #ffffff;
          border-radius: 4px;
        }
        .lp-ticket::before,
        .lp-ticket::after {
          content: '';
          position: absolute;
          left: 0;
          right: 0;
          height: 14px;
          background-image: radial-gradient(circle at 12px 7px, transparent 7px, #F5F1E8 7.5px);
          background-size: 24px 14px;
          background-repeat: repeat-x;
        }
        .lp-ticket::before { top: -13px; }
        .lp-ticket::after { bottom: -13px; transform: rotate(180deg); }

        /* Media queries */
        @media (max-width: 640px) {
          .lp-title { font-size: 2.1rem !important; }
          .lp-ctagroup { flex-direction: column; align-items: stretch !important; }
        }

        /* --- Footer Logo Hat-Tip Animation (30s loop & Hover) --- */
        
        .footer-logo-container {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          text-decoration: none;
          cursor: pointer;
        }

        @keyframes footerAcropolisHatTip {
          0%, 88%, 100% {
            transform: translateY(0) rotate(0deg);
          }
          91% {
            transform: translateY(-7px) rotate(-14deg); /* Ανασήκωμα & χαιρετισμός */
          }
          94% {
            transform: translateY(-3px) rotate(5deg);
          }
          97% {
            transform: translateY(0) rotate(0deg);
          }
        }

        .footer-acropolis-roof-hat {
          animation: footerAcropolisHatTip 30s infinite cubic-bezier(0.4, 0, 0.2, 1);
          transform-origin: 21px 17px; /* Κέντρο περιστροφής */
        }

        /* Hover trigger για το Footer Logo */
        .footer-logo-container:hover .footer-acropolis-roof-hat {
          animation: none;
          transform: translateY(-6px) rotate(-13deg);
          transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        /* Hover effects για τα Footer Links */
        .footer-link-item {
          transition: color 0.2s ease;
        }
        .footer-link-item:hover {
          color: #B33F30 !important; /* Κεραμιδί χρώμα στο hover */
        }

      `}</style>

      {/* Hero Section */}
      <section style={styles.hero}>
        <div style={styles.heroOverlay} />
        <div style={styles.heroContent}>
         
          <h1 className="lp-title" style={styles.title}>
            Δίκαια ενοίκια<br />
            <span style={styles.highlight}>Ζωντανές γειτονιές στην Αθήνα!</span>
          </h1>
          <p style={styles.subtitle}>
            Η ραγδαία αύξηση των ενοικίων και τα χιλιάδες κλειστά ακίνητα έχουν δημιουργήσει αδιέξοδο στην Αθήνα, την ώρα που χιλιάδες διαμερίσματα μένουν κλειδωμένα
            και άδεια. Φτιάξαμε δύο απλά εργαλεία: το ένα δείχνει στους ενοικιαστές αν πληρώνουν όσο πρέπει,
            το άλλο δείχνει στους ιδιοκτήτες πόσο αξίζει να ανακαινίσουν.
          </p>
          <div className="lp-ctagroup" style={styles.ctaGroup}>
            <Link to="/estimator" className="lp-cta" style={styles.primaryCta}>
              <Calculator size={18} /> Δες αν πληρώνεις δίκαιο ενοίκιο
            </Link>
            <Link to="/renovation" className="lp-cta" style={styles.secondaryCta}>
              <Hammer size={18} /> Υπολόγισε την απόδοση ανακαίνισης
            </Link>
          </div>
        </div>
      </section>

      {/* Problem & Solution Section */}
      <section style={styles.impactSection}>
        <div style={styles.impactGrid}>
          <div style={styles.impactCard}>
            <div style={styles.impactHeader}>
              <AlertTriangle size={20} color="#B33F30" />
              <h3 style={styles.impactTitle}>Το πρόβλημα</h3>
            </div>
            <p style={styles.impactText}>
              Οι τιμές των ενοικίων ανεβαίνουν ανεξέλεγκτα, ενώ οι αγγελίες σπανίως δικαιολογούν τα ζητούμενα ποσά. Την ίδια στιγμή, χιλιάδες παλαιά διαμερίσματα στην Αθήνα παραμένουν κλειστά, καθώς οι ιδιοκτήτες διστάζουν να επενδύσουν σε μια ανακαίνιση χωρίς να γνωρίζουν το πραγματικό όφελος.
            </p>
          </div>

          <div style={{ ...styles.impactCard, ...styles.solutionCard }}>
            <div style={styles.impactHeader}>
              <ShieldCheck size={20} color="#1D4E5F" />
              <h3 style={styles.impactTitle}>Πώς βοηθάμε</h3>
            </div>
            <p style={styles.impactText}>
              Φέρνουμε διαφάνεια στην αγορά. Δίνουμε στους ενοικιαστές ένα αντικειμενικό εργαλείο για να γνωρίζουν αν το ενοίκιο είναι δίκαιο, και υπολογίζουμε για τους ιδιοκτήτες την ακριβή απόδοση και τον χρόνο απόσβεσης μιας ανακαίνισης.
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section style={styles.statsSection}>
        <div className="lp-ticket" style={styles.statsGrid}>
          <div style={styles.statCard}>
            <h3 style={styles.statNumber}>4.100+</h3>
            <p style={styles.statLabel}>Διαμερίσματα στην Αθήνα</p>
            <span style={styles.statSub}>Αναλύσαμε αγγελίες σε όλη την πόλη</span>
          </div>
          <div style={styles.statCard}>
            <h3 style={styles.statNumber}>81%</h3>
            <p style={styles.statLabel}>Ακρίβεια εκτίμησης</p>
            <span style={styles.statSub}>Βασισμένη σε πραγματικά δεδομένα</span>
          </div>
          <div style={styles.statCard}>
            <h3 style={styles.statNumber}>76</h3>
            <p style={styles.statLabel}>Γειτονιές της Αττικής</p>
            <span style={styles.statSub}>Από το κέντρο μέχρι τα προάστια</span>
          </div>
          <div style={styles.statCard}>
            <h3 style={styles.statNumber}>100%</h3>
            <p style={styles.statLabel}>Διαφανής υπολογισμός</p>
            <span style={styles.statSub}>Βλέπεις ακριβώς πώς βγαίνει η τιμή</span>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section style={styles.featuresSection}>
        <h2 style={styles.sectionTitle}>Οι Υπηρεσίες μας</h2>
        <div style={styles.featuresGrid}>
          <div className="lp-feature-card" style={styles.featureCard}>
            <div style={{ ...styles.iconWrapper, backgroundColor: '#EAF2F1' }}>
              <ShieldCheck size={22} color="#1D4E5F" />
            </div>
            <h3 style={styles.cardTitle}>Εκτίμηση Δίκαιου Ενοικίου</h3>
            <p style={styles.cardText}>
              Ελέγξτε αν το ζητούμενο ενοίκιο ανταποκρίνεται στην πραγματικότητα. Ο αλγόριθμος συνυπολογίζει την περιοχή, τα τετραγωνικά, την παλαιότητα, καθώς και την εγγύτητα σε Μετρό, Πανεπιστήμια και Πάρκα.
            </p>
          </div>
          <div className="lp-feature-card" style={styles.featureCard}>
            <div style={{ ...styles.iconWrapper, backgroundColor: '#F4EBDC' }}>
              <Hammer size={22} color="#C98A3E" />
            </div>
            <h3 style={styles.cardTitle}>Αξιοποίηση Κλειστών Ακινήτων</h3>
            <p style={styles.cardText}>
             Μάθετε πόσο μπορείτε να νοικιάσετε ένα κλειστό ή παλαιό διαμέρισμα μετά την ανακαίνιση. Δείτε την εκτιμώμενη αύξηση της αξίας του και το ακριβές χρονικό διάστημα απόσβεσης της επένδυσής σας.
            </p>
          </div>
          <div className="lp-feature-card" style={styles.featureCard}>
            <div style={{ ...styles.iconWrapper, backgroundColor: '#E9F0EC' }}>
              <TrendingUp size={22} color="#4C7A6D" />
            </div>
            <h3 style={styles.cardTitle}>Χάρτης & Τάσεις Αγοράς</h3>
            <p style={styles.cardText}>
              Ανακαλύψτε γειτονιές της Αθήνας με υψηλή προσβασιμότητα σε συγκοινωνίες και υποδομές, που προσφέρουν ακόμα προσιτές τιμές ενοικίασης πριν ανέβουν περαιτέρω.
            </p>
          </div>
        </div>
      </section>

      {/* --- Footer Section με το Animated Acropolis Logo --- */}
      <footer style={styles.footer}>
        <div style={styles.footerContent}>
          
          {/* Footer Logo & Brand ( Animated ) */}
          <div style={styles.footerBrand}>
            <Link to="/" className="footer-logo-container" title="StegiAthens - Αρχική">
              
            
              <svg
                width="40"
                height="40"
                viewBox="0 0 42 42"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                
                <circle cx="21" cy="21" r="19" fill="#EAF2F1" />

                
                <path d="M8 30.5C12 28.5 29 28.5 34 30.5L35 33H7L8 30.5Z" fill="#D8CDB8" />

                
                <g className="parthenon-columns">
                  <rect x="10" y="27" width="22" height="2" rx="0.5" fill="#1D4E5F" />
                  <rect x="11.5" y="20" width="2" height="7" rx="0.5" fill="#1D4E5F" />
                  <rect x="15.75" y="20" width="2" height="7" rx="0.5" fill="#1D4E5F" />
                  <rect x="20" y="20" width="2" height="7" rx="0.5" fill="#1D4E5F" />
                  <rect x="24.25" y="20" width="2" height="7" rx="0.5" fill="#1D4E5F" />
                  <rect x="28.5" y="20" width="2" height="7" rx="0.5" fill="#1D4E5F" />
                  <rect x="10" y="18" width="22" height="2" rx="0.5" fill="#C98A3E" />
                </g>

               
                <g className="footer-acropolis-roof-hat">
                  
                  <path d="M6 18C6 17.5 9 16.5 21 16.5C33 16.5 36 17.5 36 18C36 18.5 33 19 21 19C9 19 6 18.5 6 18Z" fill="#C98A3E" />
                  {/* Κεραμιδί Στέγη */}
                  <path d="M8 17.5L21 6.5L34 17.5H8Z" fill="#B33F30" stroke="#FFFDF9" strokeWidth="1.2" strokeLinejoin="round" />
                  
                  <path d="M12 15.5L21 8L30 15.5" stroke="#F4EBDC" strokeWidth="1.2" fill="none" opacity="0.85" />
                </g>
              </svg>

              <span style={styles.footerLogoText}>StegiAthens</span>
            </Link>
            
            <p style={styles.footerSubtext}>
              Μια ανεξάρτητη πρωτοβουλία για τη διαφάνεια στις ενοικιάσεις και την αξιοποίηση των κλειστών διαμερισμάτων στην Αθήνα.
            </p>
          </div>

          {/* Footer Navigation */}
          <div style={styles.footerNav}>
            <Link to="/estimator" className="footer-link-item" style={styles.footerLink}>Fair Rent Estimator</Link>
            <Link to="/renovation" className="footer-link-item" style={styles.footerLink}>Renovation ROI</Link>
            <Link to="/heatmap" className="footer-link-item" style={styles.footerLink}>Χάρτης Τιμών</Link>
          </div>
        </div>

        {/* Footer Bottom Line */}
        <div style={styles.footerBottom}>
          <p>© {new Date().getFullYear()} StegiAthens. Με επιφύλαξη παντός δικαιώματος.</p>
        </div>
      </footer>
    </div>
  );
};

const styles = {
  container: {
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    color: '#1F2A33',
    backgroundColor: '#F5F1E8', 
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
  },
  hero: {
    position: 'relative',
    padding: '6rem 1.5rem 5.5rem 1.5rem',
    textAlign: 'center',
    backgroundImage: `url(${athensHero})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    color: '#ffffff',
  },
  heroOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(180deg, rgba(22, 33, 43, 0.82) 0%, rgba(15, 23, 32, 0.92) 100%)',
    zIndex: 1,
  },
  heroContent: {
    position: 'relative',
    zIndex: 2,
    maxWidth: '820px',
    margin: '0 auto',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  badge: {
    display: 'inline-flex',
    alignItems: 'center',
    backgroundColor: 'rgba(244, 235, 220, 0.15)',
    backdropFilter: 'blur(8px)',
    color: '#F4EBDC',
    padding: '0.45rem 1rem',
    borderRadius: '999px',
    fontSize: '0.85rem',
    fontWeight: '600',
    marginBottom: '1.5rem',
    border: '1px solid rgba(229, 211, 179, 0.3)',
  },
  title: {
    fontFamily: "'Fraunces', Georgia, serif",
    fontSize: '2.8rem',
    fontWeight: '600',
    lineHeight: '1.25',
    marginBottom: '1.2rem',
    color: '#ffffff',
    letterSpacing: '-0.01em',
  },
  highlight: {
    color: '#7DD3FC',
  },
  subtitle: {
    fontSize: '1.1rem',
    color: '#E2E8F0',
    lineHeight: '1.65',
    maxWidth: '750px',
    marginBottom: '2.25rem',
  },
  ctaGroup: {
    display: 'flex',
    gap: '0.8rem',
    flexWrap: 'wrap',
    justifyContent: 'center',
    position: 'relative',
    zIndex: 10,
  },
  primaryCta: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
    backgroundColor: '#1D4E5F',
    color: '#ffffff',
    padding: '0.85rem 1.6rem',
    borderRadius: '8px',
    textDecoration: 'none',
    fontWeight: '600',
    fontSize: '0.95rem',
    boxShadow: '0 4px 14px rgba(0,0,0,0.4)',
  },
  secondaryCta: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
    backgroundColor: '#ffffff',
    color: '#16212B',
    padding: '0.85rem 1.6rem',
    borderRadius: '8px',
    textDecoration: 'none',
    fontWeight: '600',
    fontSize: '0.95rem',
  },
  impactSection: {
    maxWidth: '1000px',
    margin: '3rem auto 0 auto', 
    padding: '0 1.5rem',
  },
  impactGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '1.25rem',
  },
  impactCard: {
    backgroundColor: '#FFFDF9',
    padding: '1.5rem',
    borderRadius: '10px',
    border: '1px solid #F1DAD3',
    borderLeft: '4px solid #B33F30',
  },
  solutionCard: {
    borderColor: '#D7E4E2',
    borderLeft: '4px solid #1D4E5F',
  },
  impactHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    marginBottom: '0.5rem',
  },
  impactTitle: {
    fontFamily: "'Fraunces', Georgia, serif",
    fontSize: '1.15rem',
    fontWeight: '600',
    color: '#16212B',
  },
  impactText: {
    fontSize: '0.92rem',
    color: '#52606B',
    lineHeight: '1.6',
  },
  statsSection: {
    maxWidth: '1000px',
    margin: '2.5rem auto 0 auto',
    padding: '0 1.5rem',
  },
  statsGrid: {
    display: 'flex',
    flexDirection: 'row', 
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '1.5rem',
    padding: '2rem 1.5rem',
    width: '100%', 
    boxSizing: 'border-box',
  },
  statCard: {
    textAlign: 'center',
    padding: '0.5rem',
    flex: 1,
  },
  statNumber: {
    fontFamily: "'Fraunces', Georgia, serif",
    fontSize: '1.9rem',
    fontWeight: '600',
    color: '#1D4E5F',
    marginBottom: '0.15rem',
  },
  statLabel: {
    fontSize: '0.9rem',
    color: '#16212B',
    fontWeight: '600',
    marginBottom: '0.15rem',
  },
  statSub: {
    fontSize: '0.78rem',
    color: '#7A7264',
  },
  featuresSection: {
    maxWidth: '1000px',
    margin: '0 auto',
    padding: '3.5rem 1.5rem 5rem 1.5rem',
  },
  sectionTitle: {
    fontFamily: "'Fraunces', Georgia, serif",
    fontSize: '1.6rem',
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: '2rem',
    color: '#16212B',
  },
  featuresGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '1.25rem',
  },
  featureCard: {
    backgroundColor: '#FFFDF9',
    padding: '1.75rem',
    borderRadius: '10px',
    border: '1px solid #E7DFCD',
  },
  iconWrapper: {
    width: '46px',
    height: '46px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '1rem',
  },
  cardTitle: {
    fontSize: '1.1rem',
    fontWeight: '600',
    marginBottom: '0.5rem',
    color: '#16212B',
  },
  cardText: {
    fontSize: '0.9rem',
    color: '#52606B',
    lineHeight: '1.55',
  },

  /* --- New Footer Styling --- */
  footer: {
    backgroundColor: '#FFFDF9', 
    borderTop: '1px solid #E7DFCD', 
    marginTop: 'auto', 
    padding: '3rem 1.5rem 2rem 1.5rem',
  },
  footerContent: {
    maxWidth: '1000px',
    margin: '0 auto',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    flexWrap: 'wrap', 
    gap: '2.5rem',
    paddingBottom: '2.5rem',
    borderBottom: '1px solid #E7DFCD', 
  },
  footerBrand: {
    maxWidth: '420px', 
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  footerLogoText: {
    fontFamily: "'Fraunces', Georgia, serif",
    fontSize: '1.35rem',
    fontWeight: '700',
    color: '#16212B',
    letterSpacing: '-0.01em',
  },
  footerSubtext: {
    fontSize: '0.88rem',
    color: '#52606B',
    lineHeight: '1.6',
    marginTop: '0.25rem',
  },
  footerNav: {
    display: 'flex',
    gap: '1.5rem',
    flexWrap: 'wrap',
    marginTop: '0.5rem', 
  },
  footerLink: {
    color: '#1D4E5F', 
    textDecoration: 'none',
    fontSize: '0.92rem',
    fontWeight: '600',
  },
  footerBottom: {
    maxWidth: '1000px',
    margin: '0 auto',
    paddingTop: '1.5rem',
    textAlign: 'center',
    fontSize: '0.8rem',
    color: '#7A7264',
  },
};

export default LandingPage;