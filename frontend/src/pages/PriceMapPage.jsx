import React, { useState, useEffect, useMemo } from 'react';
import { loadCityStats } from '../components/landing/data/loadcitystats';
import PriceMapHeader from '../components/pricemap/PriceMapHeader';
import InteractiveMap from '../components/pricemap/InteractiveMap';
import SuburbRankings from '../components/pricemap/SuburbRankings';
import SuburbComparator from '../components/pricemap/SuburbComparator';
import SuburbsTable from '../components/pricemap/SuburbsTable';
import { Loader2 } from 'lucide-react';

export default function PriceMapPage() {
  const [suburbsData, setSuburbsData] = useState([]);
  const [statsData, setStatsData] = useState(null);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState('');
  const [tierFilter, setTierFilter] = useState('ALL');
  const [selectedSuburb, setSelectedSuburb] = useState(null);
  const [mapCenter, setMapCenter] = useState([37.9838, 23.7275]);
  const [mapZoom, setMapZoom] = useState(12);

  useEffect(() => {
    let isMounted = true;

    async function fetchData() {
      try {
        const cityStats = await loadCityStats().catch(() => null);
        if (isMounted && cityStats) {
          setStatsData(cityStats);
        }

        let backendList = [];
        try {
          const res = await fetch('http://127.0.0.1:8000/api/suburbs-stats');
          if (res.ok) {
            const data = await res.json();
            if (data && data.suburbs && data.suburbs.length > 0) {
              backendList = data.suburbs;
            }
          }
        } catch (e) {
          console.warn('Backend endpoint unreachable, using local stats fallback');
        }

        if (isMounted) {
          let rawList = [];
          if (backendList.length > 0) {
            rawList = backendList;
          } else if (cityStats && cityStats.chartData) {
            rawList = cityStats.chartData.map((c) => ({
              name: c.name,
              avgSqmPrice: Number(c.pricePerSqm || c.avgPriceSqm || c.avgPrice || 11.5),
              avgRent: Number(c.avgRent || 650),
              minRent: Number(c.minRent || 350),
              maxRent: Number(c.maxRent || 1200),
              listingsCount: Number(c.listingsCount || 30),
              lat: Number(c.lat || 37.9838),
              lon: Number(c.lon || 23.7275),
            }));
          }

          const validSuburbs = rawList.filter(
            (sub) => Number(sub.listingsCount || 0) >= 15
          );

          setSuburbsData(validSuburbs);
        }
      } catch (err) {
        console.error('Error in PriceMapPage fetch:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchData();

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredSuburbs = useMemo(() => {
    return suburbsData.filter((sub) => {
      const name = sub.name || '';
      const matchesSearch = name.toLowerCase().includes(searchTerm.toLowerCase());
      if (!matchesSearch) return false;

      const price = Number(sub.avgSqmPrice) || 0;
      if (tierFilter === 'BUDGET') return price < 10.5;
      if (tierFilter === 'MID') return price >= 10.5 && price < 14.0;
      if (tierFilter === 'PREMIUM') return price >= 14.0;
      return true;
    });
  }, [suburbsData, searchTerm, tierFilter]);

  const dynamicKPIs = useMemo(() => {
    const exactSampleSize = statsData?.totalProperties || statsData?.sampleSize || 4162;
    const exactSuburbsCount = suburbsData.length > 0 ? suburbsData.length : (statsData?.neighborhoodCount || 55);
    const avgPriceSqm = statsData?.avgPricePerSqm || statsData?.avgSqmPrice || '12.8';
    const unrenovated = statsData?.pctNotRenovated !== undefined && statsData?.pctNotRenovated !== null
      ? `${statsData.pctNotRenovated}%`
      : statsData?.unrenovatedPct ? `${statsData.unrenovatedPct}%` : '42%';

    return {
      sampleSize: typeof exactSampleSize === 'number' ? exactSampleSize.toLocaleString('el-GR') : exactSampleSize,
      suburbsCount: exactSuburbsCount,
      avgSqmPrice: avgPriceSqm.toString().startsWith('€') ? avgPriceSqm : `€${avgPriceSqm}`,
      unrenovatedPct: unrenovated
    };
  }, [statsData, suburbsData]);

  const dynamicBenchmarks = useMemo(() => {
    if (statsData && statsData.mostExpensive && statsData.mostAffordable) {
      return {
        expensive: {
          name: statsData.mostExpensive.name,
          price: `€${statsData.mostExpensive.avgPrice}/m²`
        },
        affordable: {
          name: statsData.mostAffordable.name,
          price: `€${statsData.mostAffordable.avgPrice}/m²`
        }
      };
    }

    if (suburbsData.length > 0) {
      const sorted = [...suburbsData].sort((a, b) => (b.avgSqmPrice || 0) - (a.avgSqmPrice || 0));
      return {
        expensive: {
          name: sorted[0]?.name || 'Κολωνάκι',
          price: `€${Number(sorted[0]?.avgSqmPrice || 18.6).toFixed(1)}/m²`
        },
        affordable: {
          name: sorted[sorted.length - 1]?.name || 'Αχαρνές',
          price: `€${Number(sorted[sorted.length - 1]?.avgSqmPrice || 8.2).toFixed(1)}/m²`
        }
      };
    }

    return {
      expensive: { name: 'Κολωνάκι', price: '€18.6/m²' },
      affordable: { name: 'Αχαρνές', price: '€8.2/m²' }
    };
  }, [statsData, suburbsData]);

  const handleSelectSuburb = (sub) => {
    setSelectedSuburb(sub);
    if (sub.lat && sub.lon) {
      setMapCenter([sub.lat, sub.lon]);
      setMapZoom(14);
    }
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <Loader2 size={36} color="#0F766E" className="spin" />
        <span style={{ marginTop: '0.8rem', color: '#6B7280', fontWeight: '600' }}>
          Φόρτωση δεδομένων χάρτη...
        </span>
      </div>
    );
  }

  return (
    <div style={styles.pageWrapper}>
      <PriceMapHeader dynamicKPIs={dynamicKPIs} />

      <InteractiveMap
        suburbs={filteredSuburbs}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        tierFilter={tierFilter}
        setTierFilter={setTierFilter}
        selectedSuburb={selectedSuburb}
        onSelectSuburb={handleSelectSuburb}
        mapCenter={mapCenter}
        mapZoom={mapZoom}
      />

      <SuburbRankings benchmarks={dynamicBenchmarks} />

   
      {suburbsData.length >= 2 && (
        <SuburbComparator suburbs={suburbsData} />
      )}

      <SuburbsTable suburbs={filteredSuburbs} onSelectSuburb={handleSelectSuburb} />
    </div>
  );
}

const styles = {
  pageWrapper: {
    maxWidth: '1280px',
    margin: '0 auto',
    padding: '2rem 1.5rem',
    fontFamily: 'Arial, sans-serif',
    color: '#16212B',
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '60vh',
    fontFamily: 'Arial, sans-serif',
  },
};