import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Calculator, Hammer, Map, Menu, X } from 'lucide-react';

const Navbar = () => {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const mapPaths = ['/heatmap', '/prices', '/map'];
  const isActive = (path) =>
    location.pathname === path || (path === '/heatmap' && mapPaths.includes(location.pathname));

  // Σε κινητό το μενού κλείνει όταν αλλάζει σελίδα.
  useEffect(() => setMenuOpen(false), [location.pathname]);

  const navItems = [
    { path: '/', label: 'Αρχική', icon: Home },
    { path: '/estimator', label: 'Fair Rent Estimator', icon: Calculator },
    { path: '/renovation', label: 'Renovation ROI', icon: Hammer },
    { path: '/heatmap', label: 'Χάρτης Τιμών', icon: Map },
  ];

  return (
    <nav className="site-nav" style={styles.nav}>
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

        .nav-toggle {
          display: none;
          align-items: center;
          justify-content: center;
          width: 42px;
          height: 42px;
          border-radius: 8px;
          border: 1px solid rgba(255, 253, 249, 0.35);
          background: transparent;
          color: #FFFDF9;
          cursor: pointer;
        }

        @media (max-width: 820px) {
          .site-nav { padding: 0.6rem 1rem !important; flex-wrap: wrap; }
          .brand-text { font-size: 1.3rem; }
          .nav-toggle { display: inline-flex; }
          .nav-links {
            display: none !important;
            flex-basis: 100%;
            flex-direction: column;
            align-items: stretch !important;
            gap: 0.25rem !important;
            padding-top: 0.6rem;
          }
          .nav-links.open { display: flex !important; }
          .nav-link-item { padding: 0.7rem 0.9rem !important; }
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

      <button
        type="button"
        className="nav-toggle"
        aria-label={menuOpen ? 'Κλείσιμο μενού' : 'Άνοιγμα μενού'}
        aria-expanded={menuOpen}
        aria-controls="site-nav-links"
        onClick={() => setMenuOpen((open) => !open)}
      >
        {menuOpen ? <X size={22} /> : <Menu size={22} />}
      </button>

      {/* Navigation Links */}
      <div id="site-nav-links" className={`nav-links${menuOpen ? ' open' : ''}`} style={styles.linksContainer}>
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