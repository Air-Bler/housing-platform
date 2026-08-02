import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Calculator, Hammer, Map } from 'lucide-react';

const Navbar = () => {
  const location = useLocation();
  const isActive = (path) => location.pathname === path;

  const navItems = [
    { path: '/', label: 'Αρχική', icon: Home },
    { path: '/estimator', label: 'Fair Rent Estimator', icon: Calculator },
    { path: '/renovation', label: 'Renovation ROI', icon: Hammer },
    { path: '/heatmap', label: 'Χάρτης Τιμών', icon: Map },
  ];

  return (
    <nav style={styles.nav}>
      <style>{`
        .brand-logo-container {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          text-decoration: none;
          cursor: pointer;
        }

        /* Η στέγη-καπέλο "χαιρετάει" κάθε 30 δευτερόλεπτα */
        @keyframes acropolisHatTip {
          0%, 88%, 100% {
            transform: translateY(0) rotate(0deg);
          }
          91% {
            transform: translateY(-3.5px) rotate(-7deg);
          }
          94% {
            transform: translateY(-1.5px) rotate(3deg);
          }
          97% {
            transform: translateY(0) rotate(0deg);
          }
        }

        .acropolis-roof-hat {
          transform-box: fill-box;
          transform-origin: 50% 100%;
          animation: acropolisHatTip 30s infinite cubic-bezier(0.4, 0, 0.2, 1);
        }

        @media (prefers-reduced-motion: reduce) {
          .acropolis-roof-hat { animation: none; }
        }

        /* Και σε hover, για άμεση ανατροφοδότηση */
        .brand-logo-container:hover .acropolis-roof-hat {
          animation: none;
          transform: translateY(-3px) rotate(-6deg);
          transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .brand-text {
          font-family: 'Fraunces', Georgia, serif;
          font-size: 1.35rem;
          font-weight: 700;
          color: #16212B;
          letter-spacing: -0.02em;
          transition: color 0.2s ease;
        }

        .brand-logo-container:hover .brand-text {
          color: #1D4E5F;
        }

        .nav-link-item {
          transition: all 0.2s ease;
        }
        .nav-link-item:hover {
          background-color: #F4EBDC !important;
          color: #16212B !important;
        }
      `}</style>

    
      <Link to="/" className="brand-logo-container" title="StegiAthens - Στέγη στην Αθήνα">
        <svg
          width="42"
          height="42"
          viewBox="0 0 42 42"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          role="img"
          aria-label="Λογότυπο StegiAthens"
        >
        
          <circle cx="21" cy="21" r="19" fill="#EAF2F1" />

        
          <path d="M8 30.5C12 28.5 30 28.5 34 30.5L35 33H7L8 30.5Z" fill="#D8CDB8" />

        
          <rect x="10" y="27" width="22" height="2" rx="0.5" fill="#1D4E5F" />
          <rect x="11.5" y="20" width="2" height="7" rx="0.5" fill="#1D4E5F" />
          <rect x="15.75" y="20" width="2" height="7" rx="0.5" fill="#1D4E5F" />
          <rect x="20" y="20" width="2" height="7" rx="0.5" fill="#1D4E5F" />
          <rect x="24.25" y="20" width="2" height="7" rx="0.5" fill="#1D4E5F" />
          <rect x="28.5" y="20" width="2" height="7" rx="0.5" fill="#1D4E5F" />

        
          <rect x="10" y="18" width="22" height="2" rx="0.5" fill="#163C4A" />

        
          <g className="acropolis-roof-hat">
        
            <path
              d="M6 18C6 17.5 9 16.5 21 16.5C33 16.5 36 17.5 36 18C36 18.5 33 19 21 19C9 19 6 18.5 6 18Z"
              fill="#8A5A22"
            />
            
            <path
              d="M8 17.5L21 6.5L34 17.5H8Z"
              fill="#C98A3E"
              stroke="#8A5A22"
              strokeWidth="1"
              strokeLinejoin="round"
            />
           
            <circle cx="21" cy="6.5" r="1.4" fill="#8A5A22" />
            <circle cx="8" cy="17.5" r="1.2" fill="#8A5A22" />
            <circle cx="34" cy="17.5" r="1.2" fill="#8A5A22" />
          </g>
        </svg>

        <span className="brand-text">StegiAthens</span>
      </Link>

      {/* Navigation Links */}
      <div style={styles.linksContainer}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              className="nav-link-item"
              style={{
                ...styles.link,
                ...(active ? styles.activeLink : {}),
              }}
            >
              <Icon size={16} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

const styles = {
  nav: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0.85rem 2.5rem',
    backgroundColor: '#FFFDF9',
    borderBottom: '1px solid #E7DFCD',
    position: 'sticky',
    top: 0,
    zIndex: 1000,
    boxShadow: '0 2px 8px rgba(31, 42, 51, 0.04)',
  },
  linksContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  link: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.45rem',
    textDecoration: 'none',
    color: '#52606B',
    fontWeight: '500',
    fontSize: '0.9rem',
    padding: '0.5rem 0.9rem',
    borderRadius: '6px',
  },
  activeLink: {
    color: '#1D4E5F',
    backgroundColor: '#EAF2F1',
    fontWeight: '600',
    border: '1px solid #D7E4E2',
  },
};

export default Navbar;