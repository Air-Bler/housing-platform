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
          gap: 0.6rem;
          text-decoration: none;
          cursor: pointer;
        }

        .brand-text {
          font-family: 'Fraunces', Georgia, serif;
          font-size: 1.6rem;
          font-weight: 700;
          color: #FFFDF9;
          letter-spacing: -0.02em;
          transition: color 0.2s ease;
        }

        .brand-logo-container:hover .brand-text {
          color: #C98A3E;
        }

        .brand-logo-container:hover svg {
          transform: scale(1.05);
          transition: transform 0.2s ease;
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
        <span style={styles.logoBadge}>
          <img
            src="/data/logo.png"
            alt="StegiAthens"
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
        </span>
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
    padding: '0.75rem 2.5rem',
    backgroundColor: '#0F766E',
    borderBottom: '1px solid #C98A3E',
    position: 'sticky',
    top: 0,
    zIndex: 1000,
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.18)',
  },
  logoBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFDF9',
    borderRadius: '50%',
    width: '46px',
    height: '46px',
    overflow: 'hidden',
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
    color: '#C7D0D6',
    fontWeight: '500',
    fontSize: '0.9rem',
    padding: '0.5rem 0.9rem',
    borderRadius: '6px',
  },
  activeLink: {
    color: '#FFFDF9',
    backgroundColor: 'rgba(201, 138, 62, 0.18)',
    fontWeight: '600',
    border: '1px solid rgba(201, 138, 62, 0.45)',
  },
};

export default Navbar;