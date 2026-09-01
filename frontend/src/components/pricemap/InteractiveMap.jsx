import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Search, Layers, Info, SearchX } from 'lucide-react';

export default function InteractiveMap({
  suburbs,
  searchTerm,
  setSearchTerm,
  tierFilter,
  setTierFilter,
  selectedSuburb,
  onSelectSuburb,
  mapCenter,
  mapZoom,
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const layersGroupRef = useRef(null);

  const onSelectSuburbRef = useRef(onSelectSuburb);
  useEffect(() => {
    onSelectSuburbRef.current = onSelectSuburb;
  }, [onSelectSuburb]);

  const getMarkerColor = (price) => {
    const val = Number(price) || 0;
    if (val >= 14.0) return '#B33F30';
    if (val >= 10.5) return '#C98A3E';
    return '#4C7A6D';
  };

  const getRadiusMeters = (count) => {
    const c = Number(count) || 20;
    return Math.max(700, Math.min(1600, 650 + Math.log2(c) * 130));
  };

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const map = L.map(mapContainerRef.current, {
      center: [37.9838, 23.7275],
      zoom: 12,
      zoomControl: true,
      scrollWheelZoom: true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);

    const group = L.layerGroup().addTo(map);
    layersGroupRef.current = group;
    mapInstanceRef.current = map;

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!mapInstanceRef.current || !layersGroupRef.current) return;

    layersGroupRef.current.clearLayers();

    suburbs.forEach((sub) => {
      if (!sub.lat || !sub.lon) return;

      const count = Number(sub.listingsCount || 0);
      const color = getMarkerColor(sub.avgSqmPrice);
      const radius = getRadiusMeters(count);
      const formattedPrice = Number(sub.avgSqmPrice || 0).toFixed(1);

      const circle = L.circle([sub.lat, sub.lon], {
        radius: radius,
        stroke: true,
        color: color,
        weight: 2,
        opacity: 0.85,
        fillColor: color,
        fillOpacity: 0.32,
      });

      const pillIcon = L.divIcon({
        className: '',
        html: `
          <div style="
            position: absolute;
            left: 0;
            top: 0;
            transform: translate(-50%, -50%);
            background: ${color};
            color: white;
            padding: 4px 9px;
            border-radius: 999px;
            font-family: Arial, sans-serif;
            font-size: 11px;
            font-weight: 700;
            white-space: nowrap;
            box-shadow: 0 3px 10px rgba(0,0,0,.22);
            border: 2px solid white;
            cursor: pointer;
          ">
            ${sub.name} · €${formattedPrice}/m²
          </div>
        `,
        iconSize: [0, 0],
        iconAnchor: [0, 0],
      });

      const labelMarker = L.marker([sub.lat, sub.lon], { icon: pillIcon });

      const popupHtml = `
        <div style="font-family: Arial, sans-serif; min-width: 175px; padding: 4px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; border-bottom: 1px solid #E5E7EB; padding-bottom: 4px;">
            <strong style="font-size: 0.95rem; color: #16212B;">${sub.name}</strong>
            <span style="font-size: 0.75rem; font-weight: 700; padding: 2px 7px; border-radius: 999px; background: ${color}; color: white;">
              €${formattedPrice}/m²
            </span>
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px; font-size: 0.8rem; margin-bottom: 6px;">
            <div>
              <span style="color: #6B7280; font-size: 0.7rem; display: block;">Μέσο Ενοίκιο</span>
              <strong style="color: #16212B;">€${Math.round(sub.avgRent || 0)}</strong>
            </div>
            <div>
              <span style="color: #6B7280; font-size: 0.7rem; display: block;">Εύρος</span>
              <strong style="color: #16212B;">€${sub.minRent || 0} - €${sub.maxRent || 0}</strong>
            </div>
          </div>
          <div style="font-size: 0.72rem; color: #6B7280; border-top: 1px solid #E5E7EB; padding-top: 4px;">
            Δείγμα: <strong>${count} αγγελίες</strong>
          </div>
        </div>
      `;

      circle.bindPopup(popupHtml);
      labelMarker.bindPopup(popupHtml);

      const handleClick = () => {
        if (onSelectSuburbRef.current) {
          onSelectSuburbRef.current(sub);
        }
      };

      circle.on('click', handleClick);
      labelMarker.on('click', handleClick);

      layersGroupRef.current.addLayer(circle);
      layersGroupRef.current.addLayer(labelMarker);
    });
  }, [suburbs]);

  useEffect(() => {
    if (mapInstanceRef.current && mapCenter && mapCenter[0] && mapCenter[1]) {
      mapInstanceRef.current.flyTo(mapCenter, mapZoom, { duration: 1.0 });
    }
  }, [mapCenter, mapZoom]);

  return (
    <div style={styles.mapWorkspaceCard}>
      <div style={styles.sidebarPanel}>
        <div style={styles.sidebarHeader}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Layers size={18} color="#0F766E" />
            <h3 style={styles.sidebarTitle}>Εξερεύνηση Περιοχών</h3>
          </div>
          <span style={styles.countBadge}>{suburbs.length} περιοχές</span>
        </div>

        <div style={styles.searchBox}>
          <Search size={16} color="#7A7264" />
          <input
            type="text"
            placeholder="Αναζήτηση γειτονιάς..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={styles.searchInput}
          />
        </div>

        <div style={styles.tierButtonGroup}>
          <button
            onClick={() => setTierFilter('ALL')}
            style={{ ...styles.tierBtn, ...(tierFilter === 'ALL' ? styles.tierBtnActive : {}) }}
          >
            Όλες
          </button>
          <button
            onClick={() => setTierFilter('BUDGET')}
            style={{
              ...styles.tierBtn,
              ...(tierFilter === 'BUDGET' ? { ...styles.tierBtnActive, borderColor: '#4C7A6D', color: '#4C7A6D' } : {})
            }}
          >
            Προσιτές (&lt;10.5€)
          </button>
          <button
            onClick={() => setTierFilter('MID')}
            style={{
              ...styles.tierBtn,
              ...(tierFilter === 'MID' ? { ...styles.tierBtnActive, borderColor: '#C98A3E', color: '#C98A3E' } : {})
            }}
          >
            Μεσαίες (10.5-14€)
          </button>
          <button
            onClick={() => setTierFilter('PREMIUM')}
            style={{
              ...styles.tierBtn,
              ...(tierFilter === 'PREMIUM' ? { ...styles.tierBtnActive, borderColor: '#B33F30', color: '#B33F30' } : {})
            }}
          >
            Premium (&gt;14€)
          </button>
        </div>

        <div style={styles.suburbsListContainer}>
          {suburbs.length > 0 ? (
            suburbs.map((sub, idx) => {
              const isSelected = selectedSuburb && selectedSuburb.name === sub.name;
              const color = getMarkerColor(sub.avgSqmPrice);
              return (
                <div
                  key={idx}
                  onClick={() => onSelectSuburb(sub)}
                  style={{
                    ...styles.suburbListItem,
                    ...(isSelected ? styles.suburbListItemActive : {})
                  }}
                >
                  <div>
                    <div style={styles.suburbListName}>{sub.name}</div>
                    <div style={styles.suburbListSub}>
                      Μέσο: <strong>€{Math.round(sub.avgRent || 0)}</strong> / μήνα
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ ...styles.suburbListPrice, color: color }}>
                      €{Number(sub.avgSqmPrice || 0).toFixed(1)}/m²
                    </div>
                    <div style={styles.suburbListListings}>{sub.listingsCount || 0} αγγελίες</div>
                  </div>
                </div>
              );
            })
          ) : (
            <div style={styles.notFoundContainer}>
              <SearchX size={32} color="#9CA3AF" />
              <div style={styles.notFoundTitle}>Δεν βρέθηκε γειτονιά</div>
              <div style={styles.notFoundSub}>
                Δοκιμάστε με διαφορετική ορθογραφία ή επιλέξτε «Όλες» στα φίλτρα.
              </div>
            </div>
          )}
        </div>

        <div style={styles.legendCard}>
          <div style={styles.legendTitle}>
            <Info size={13} color="#6B7280" /> Ενδεικτικό ενοίκιο €/m² 
          </div>
          <div style={styles.legendRow}>
            <div style={styles.legendItem}>
              <span style={{ ...styles.legendDot, backgroundColor: '#4C7A6D' }} />
              <span>Προσιτό (&lt; €10.5)</span>
            </div>
            <div style={styles.legendItem}>
              <span style={{ ...styles.legendDot, backgroundColor: '#C98A3E' }} />
              <span>Μεσαίο (€10.5 - €14.0)</span>
            </div>
            <div style={styles.legendItem}>
              <span style={{ ...styles.legendDot, backgroundColor: '#B33F30' }} />
              <span>Ακριβό (&gt; €14.0)</span>
            </div>
          </div>
        </div>
      </div>

      <div style={styles.mapContainerWrapper}>
        <div ref={mapContainerRef} style={{ width: '100%', height: '100%', minHeight: '620px' }} />
      </div>
    </div>
  );
}

const styles = {
  mapWorkspaceCard: {
    backgroundColor: '#FFFFFF',
    border: '1px solid #E5E7EB',
    borderRadius: '18px',
    overflow: 'hidden',
    boxShadow: '0 12px 36px rgba(0,0,0,0.06)',
    display: 'grid',
    gridTemplateColumns: '360px 1fr',
    marginBottom: '2rem',
    minHeight: '620px',
    fontFamily: 'Arial, sans-serif',
  },
  sidebarPanel: {
    borderRight: '1px solid #E5E7EB',
    padding: '1.25rem',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#FAFAF9',
  },
  sidebarHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1rem',
  },
  sidebarTitle: {
    fontSize: '1rem',
    fontWeight: '700',
    color: '#16212B',
    margin: 0,
  },
  countBadge: {
    fontSize: '0.75rem',
    fontWeight: '700',
    backgroundColor: '#EAF2F1',
    color: '#0F766E',
    padding: '0.2rem 0.6rem',
    borderRadius: '999px',
  },
  searchBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    backgroundColor: '#FFFFFF',
    border: '1px solid #D1D5DB',
    borderRadius: '8px',
    padding: '0.5rem 0.75rem',
    marginBottom: '0.75rem',
  },
  searchInput: {
    border: 'none',
    outline: 'none',
    width: '100%',
    fontSize: '0.85rem',
    color: '#16212B',
    fontFamily: 'Arial, sans-serif',
  },
  tierButtonGroup: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '0.35rem',
    marginBottom: '0.9rem',
  },
  tierBtn: {
    border: '1px solid #D1D5DB',
    backgroundColor: '#FFFFFF',
    color: '#4B5563',
    padding: '0.45rem 0.4rem',
    borderRadius: '6px',
    fontSize: '0.72rem',
    fontWeight: '700',
    cursor: 'pointer',
    fontFamily: 'Arial, sans-serif',
    transition: 'all 0.15s ease',
  },
  tierBtnActive: {
    backgroundColor: '#EAF2F1',
    borderColor: '#0F766E',
    color: '#0F766E',
  },
  suburbsListContainer: {
    flex: 1,
    overflowY: 'auto',
    maxHeight: '340px',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.4rem',
    paddingRight: '0.25rem',
  },
  suburbListItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    border: '1px solid #E5E7EB',
    borderRadius: '8px',
    padding: '0.6rem 0.75rem',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  suburbListItemActive: {
    borderColor: '#0F766E',
    backgroundColor: '#F0FDF4',
    boxShadow: '0 2px 6px rgba(15, 118, 110, 0.1)',
  },
  suburbListName: {
    fontSize: '0.86rem',
    fontWeight: '700',
    color: '#16212B',
  },
  suburbListSub: {
    fontSize: '0.72rem',
    color: '#6B7280',
    marginTop: '2px',
  },
  suburbListPrice: {
    fontSize: '0.9rem',
    fontWeight: '700',
  },
  suburbListListings: {
    fontSize: '0.7rem',
    color: '#9CA3AF',
  },
  notFoundContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2.5rem 1rem',
    textAlign: 'center',
    gap: '0.4rem',
  },
  notFoundTitle: {
    fontSize: '0.9rem',
    fontWeight: '700',
    color: '#16212B',
    marginTop: '0.3rem',
  },
  notFoundSub: {
    fontSize: '0.75rem',
    color: '#6B7280',
    maxWidth: '220px',
    lineHeight: '1.4',
  },
  legendCard: {
    marginTop: 'auto',
    paddingTop: '0.9rem',
    borderTop: '1px solid #E5E7EB',
  },
  legendTitle: {
    fontSize: '0.75rem',
    fontWeight: '700',
    color: '#374151',
    marginBottom: '0.45rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.35rem',
  },
  legendRow: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.35rem',
  },
  legendItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '0.74rem',
    color: '#4B5563',
    fontWeight: '600',
  },
  legendDot: {
    width: '9px',
    height: '9px',
    borderRadius: '50%',
  },
  mapContainerWrapper: {
    position: 'relative',
    height: '100%',
    width: '100%',
    minHeight: '620px',
  },
};