import React, { useState, useEffect } from 'react';
import { loadCityStats } from '../components/landing/data/loadcitystats';
import { styles } from '../components/estimator/estimator.styles';
import ImageDropzone from '../components/estimator/ImageDropzone';
import VisionAnalysisCard from '../components/estimator/VisionAnalysisCard';
import PoiDistanceList from '../components/estimator/PoiDistanceList';

import {
  Calculator,
  Star,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
  Home,
  MapPin,
  Building,
  Sparkles,
  Car,
  Sofa,
  Wrench,
  ArrowUpFromLine,
  RotateCcw,
  TrendingUp,
  TrendingDown,
  Building2,
  ShieldCheck,
  Image as ImageIcon,
  BrainCircuit,
  TrainFront
} from 'lucide-react';

export default function EstimatorPage() {
  const initialForm = {
    sqm: '',
    bedrooms: '',
    bathrooms: '',
    floor: '',
    year_built: '',
    suburb: '',
    metro_walk_time: 'auto',
    elevator: false,
    renovated: false,
    furnished: false,
    parking: false,
    user_asking_price: '',
  };

  const [suburbs, setSuburbs] = useState([]);
  const [formData, setFormData] = useState(initialForm);
  const [formErrors, setFormErrors] = useState({});
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // States Φωτογραφιών & AI Vision
  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [visionResult, setVisionResult] = useState(null);
  const [visionLoading, setVisionLoading] = useState(false);

  // Δυναμικά στατιστικά
  const [modelStats, setModelStats] = useState({
    dataset_size: '4.100+',
    model_accuracy: '98.4%',
  });

  const cleanName = (raw) => (raw ? raw.split('(')[0].split('-')[0].split('–')[0].trim() : '');

  // Φόρτωση Γειτονιών & Στατιστικών Μοντέλου
  useEffect(() => {
    const EXTRA_SUBURBS = [
      'Βικτώρια',
      'Κάτω Πατήσια',
      'Ομόνοια',
      'Πλατεία Αμερικής',
      'Πλατεία Βικτωρίας',
      'Άγιος Παντελεήμονας',
      'Πλατεία Κολιάτσου',
      'Σύνταγμα',
      'Μοναστηράκι',
      'Πλάκα',
      'Θησείο',
      'Μουσείο',
      'Νεάπολη',
      'Γκύζη',
      'Πολύγωνο'
    ];

    loadCityStats()
      .then((stats) => {
        if (stats && stats.chartData) {
          const baseList = stats.chartData.map((n) => n.name);
          const fullList = Array.from(new Set([...baseList, ...EXTRA_SUBURBS])).sort((a, b) =>
            a.localeCompare(b, 'el')
          );
          setSuburbs(fullList);
        }
      })
      .catch((err) => {
        console.error('Error loading suburbs:', err);
        setError('Δεν μπορέσαμε να φορτώσουμε τα δεδομένα των γειτονιών.');
      });

    fetch('http://127.0.0.1:8000/api/model-stats')
      .then((res) => res.json())
      .then((data) => {
        if (data.dataset_size && data.model_accuracy) {
          setModelStats({
            dataset_size: data.dataset_size,
            model_accuracy: data.model_accuracy,
          });
        }
      })
      .catch(() => {
        console.log('Using default model stats');
      });
  }, []);

  const handleFilesAdded = (newFiles) => {
    const validFiles = Array.from(newFiles).filter((file) => file.type.startsWith('image/'));
    if (validFiles.length === 0) return;

    const updatedImages = [...images, ...validFiles];
    setImages(updatedImages);
    setPreviews(updatedImages.map((file) => URL.createObjectURL(file)));
  };

  const handleRemoveImage = (index) => {
    const updatedImages = images.filter((_, i) => i !== index);
    const updatedPreviews = previews.filter((_, i) => i !== index);
    setImages(updatedImages);
    setPreviews(updatedPreviews);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const toggleCheckbox = (name) => {
    setFormData((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  const handleClear = () => {
    setFormData(initialForm);
    setFormErrors({});
    setResult(null);
    setError(null);
    setImages([]);
    setPreviews([]);
    setVisionResult(null);
    setVisionLoading(false);
  };

  const validateForm = () => {
    const errors = {};
    const currentYear = new Date().getFullYear();

    if (!formData.suburb) errors.suburb = 'Παρακαλώ επιλέξτε γειτονιά.';

    const sqmVal = parseFloat(formData.sqm);
    if (!formData.sqm || isNaN(sqmVal)) errors.sqm = 'Συμπληρώστε τα m².';
    else if (sqmVal <= 5 || sqmVal > 1000) errors.sqm = 'Εμβαδόν 5 - 1000 m².';

    const yearVal = parseInt(formData.year_built, 10);
    if (!formData.year_built || isNaN(yearVal)) errors.year_built = 'Συμπληρώστε έτος.';
    else if (yearVal < 1850 || yearVal > currentYear) errors.year_built = `1850 - ${currentYear}.`;

    const bedsVal = parseInt(formData.bedrooms, 10);
    if (formData.bedrooms === '' || isNaN(bedsVal)) errors.bedrooms = 'Συμπληρώστε beds.';

    const bathsVal = parseInt(formData.bathrooms, 10);
    if (formData.bathrooms === '' || isNaN(bathsVal)) errors.bathrooms = 'Συμπληρώστε μπάνια.';

    const floorVal = parseInt(formData.floor, 10);
    if (formData.floor === '' || isNaN(floorVal)) errors.floor = 'Συμπληρώστε όροφο.';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAnalyzeVision = (estimatedPrice) => {
    if (images.length === 0) return;
    setVisionLoading(true);

    const bodyData = new FormData();
    bodyData.append("suburb", formData.suburb);
    bodyData.append("sqm", formData.sqm);
    bodyData.append("estimated_price", estimatedPrice);
    images.forEach((file) => bodyData.append("images", file));

    fetch("http://127.0.0.1:8000/api/analyze-images", {
      method: "POST",
      body: bodyData,
    })
      .then((res) => {
        if (!res.ok) throw new Error("Vision API Error");
        return res.json();
      })
      .then((data) => {
        setVisionResult(data.analysis);
        setVisionLoading(false);

        if (data.analysis && data.analysis.score) {
          const payload = {
            suburb: formData.suburb,
            sqm: parseFloat(formData.sqm),
            bedrooms: parseInt(formData.bedrooms, 10),
            bathrooms: parseInt(formData.bathrooms, 10),
            floor: parseInt(formData.floor, 10),
            year_built: parseInt(formData.year_built, 10),
            metro_walk_time: formData.metro_walk_time || 'auto',
            elevator: !!formData.elevator,
            renovated: !!formData.renovated,
            furnished: !!formData.furnished,
            parking: !!formData.parking,
            user_asking_price: formData.user_asking_price ? parseFloat(formData.user_asking_price) : null,
            vision_score: parseFloat(data.analysis.score)
          };

          fetch('http://127.0.0.1:8000/api/predict', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          })
            .then((r) => r.json())
            .then((updatedRes) => {
              setResult(updatedRes);
            })
            .catch((e) => console.error("Vision recalculate error:", e));
        }
      })
      .catch((err) => {
        console.error("Error analyzing images:", err);
        setVisionLoading(false);
      });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError(null);
    setVisionResult(null);

    if (!validateForm()) {
      setError('Παρακαλώ διορθώστε τα σφάλματα στη φόρμα πριν συνεχίσετε.');
      return;
    }

    setLoading(true);
    if (images.length > 0) setVisionLoading(true);

    const payload = {
      suburb: formData.suburb,
      sqm: parseFloat(formData.sqm),
      bedrooms: parseInt(formData.bedrooms, 10),
      bathrooms: parseInt(formData.bathrooms, 10),
      floor: parseInt(formData.floor, 10),
      year_built: parseInt(formData.year_built, 10),
      metro_walk_time: formData.metro_walk_time || 'auto',
      elevator: !!formData.elevator,
      renovated: !!formData.renovated,
      furnished: !!formData.furnished,
      parking: !!formData.parking,
      user_asking_price: formData.user_asking_price ? parseFloat(formData.user_asking_price) : null,
    };

    fetch('http://127.0.0.1:8000/api/predict', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
      .then((res) => {
        if (!res.ok) throw new Error(`Σφάλμα API (${res.status})`);
        return res.json();
      })
      .then((data) => {
        setResult(data);
        setLoading(false);

        if (images.length > 0) {
          handleAnalyzeVision(data.estimated_price);
        }
      })
      .catch((err) => {
        setError('Κάτι πήγε στραβά κατά τον υπολογισμό. ' + err.message);
        setLoading(false);
        setVisionLoading(false);
      });
  };

  const askingPrice = formData.user_asking_price && !isNaN(parseFloat(formData.user_asking_price))
    ? parseFloat(formData.user_asking_price)
    : null;

  const askingDelta =
    result && askingPrice
      ? Math.round(((askingPrice - result.estimated_price) / result.estimated_price) * 100)
      : null;

  return (
    <div style={styles.pageContainer}>
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .spin {
          animation: spin 1s linear infinite;
        }
        input[type=number]::-webkit-inner-spin-button, 
        input[type=number]::-webkit-outer-spin-button { 
          -webkit-appearance: none; 
          margin: 0; 
        }
        input[type=number] {
          -moz-appearance: textfield;
        }
      `}</style>

      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.title}>Fair Rent Estimator</h1>
        <p style={styles.subtitle}>
          Υπολόγισε τη δίκαιη τιμή ενοικίου με βάση πραγματικά δεδομένα 4.100+ αγγελιών στην Αθήνα.
        </p>
      </div>

      {error && (
        <div style={styles.errorBanner}>
          <AlertCircle size={18} color="#B33F30" style={{ flexShrink: 0 }} />
          <span>{error}</span>
        </div>
      )}

      {/* Main Layout */}
      <div style={styles.mainLayout}>
        {/* Φόρμα */}
        <form onSubmit={handleSubmit} style={styles.formCard} noValidate>
          <div style={styles.sectionBlock}>
            <div style={styles.sectionHeader}>
              <MapPin size={18} color="#0F766E" />
              <h3 style={styles.sectionTitle}>Τοποθεσία</h3>
            </div>
            <div style={styles.field}>
              <label style={styles.label}>Περιοχή / Γειτονιά *</label>
              <select
                name="suburb"
                value={formData.suburb}
                onChange={handleChange}
                style={{
                  ...styles.selectInput,
                  ...(formErrors.suburb ? styles.inputError : {}),
                }}
              >
                <option value="">-- Επιλέξτε γειτονιά --</option>
                {suburbs.map((sub, idx) => (
                  <option key={idx} value={sub}>
                    {cleanName(sub)}
                  </option>
                ))}
              </select>
              {formErrors.suburb && <span style={styles.errorText}>{formErrors.suburb}</span>}
            </div>

            <div style={{ ...styles.field, marginTop: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.35rem' }}>
                <TrainFront size={16} color="#0F766E" />
                <label style={{ ...styles.label, marginBottom: 0 }}>
                  Απόσταση από Μετρό / ΗΣΑΠ (με τα πόδια)
                </label>
              </div>
              <select
                name="metro_walk_time"
                value={formData.metro_walk_time}
                onChange={handleChange}
                style={styles.selectInput}
              >
                <option value="auto">Αυτόματος υπολογισμός βάσει γειτονιάς</option>
                <option value="under_5">Έως 5 λεπτά (&lt; 400m) — Δίπλα σε σταθμό</option>
                <option value="5_10">5 - 10 λεπτά (400m - 800m) — Άμεση πρόσβαση</option>
                <option value="10_15">10 - 15 λεπτά (800m - 1.2km) — Μέτρια απόσταση</option>
                <option value="over_15">Πάνω από 15 λεπτά / Χωρίς άμεσο Μετρό (&gt; 1.2km)</option>
              </select>
            </div>
          </div>

          <hr style={styles.divider} />

          <div style={styles.sectionBlock}>
            <div style={styles.sectionHeader}>
              <Home size={18} color="#0F766E" />
              <h3 style={styles.sectionTitle}>Χαρακτηριστικά Ακινήτου</h3>
            </div>

            <div style={styles.grid2}>
              <div style={styles.field}>
                <label style={styles.label}>Εμβαδόν (m²) *</label>
                <input
                  type="number"
                  name="sqm"
                  placeholder="π.χ. 75"
                  value={formData.sqm}
                  onChange={handleChange}
                  onWheel={(e) => e.target.blur()}
                  style={{
                    ...styles.input,
                    ...(formErrors.sqm ? styles.inputError : {}),
                  }}
                />
                {formErrors.sqm && <span style={styles.errorText}>{formErrors.sqm}</span>}
              </div>

              <div style={styles.field}>
                <label style={styles.label}>Έτος κατασκευής *</label>
                <input
                  type="number"
                  name="year_built"
                  placeholder="π.χ. 1998"
                  value={formData.year_built}
                  onChange={handleChange}
                  onWheel={(e) => e.target.blur()}
                  style={{
                    ...styles.input,
                    ...(formErrors.year_built ? styles.inputError : {}),
                  }}
                />
                {formErrors.year_built && <span style={styles.errorText}>{formErrors.year_built}</span>}
              </div>
            </div>

            <div style={styles.grid3}>
              <div style={styles.field}>
                <label style={styles.label}>Υπνοδωμάτια *</label>
                <input
                  type="number"
                  name="bedrooms"
                  placeholder="π.χ. 2"
                  value={formData.bedrooms}
                  onChange={handleChange}
                  onWheel={(e) => e.target.blur()}
                  style={{
                    ...styles.input,
                    ...(formErrors.bedrooms ? styles.inputError : {}),
                  }}
                />
                {formErrors.bedrooms && <span style={styles.errorText}>{formErrors.bedrooms}</span>}
              </div>

              <div style={styles.field}>
                <label style={styles.label}>Μπάνια *</label>
                <input
                  type="number"
                  name="bathrooms"
                  placeholder="π.χ. 1"
                  value={formData.bathrooms}
                  onChange={handleChange}
                  onWheel={(e) => e.target.blur()}
                  style={{
                    ...styles.input,
                    ...(formErrors.bathrooms ? styles.inputError : {}),
                  }}
                />
                {formErrors.bathrooms && <span style={styles.errorText}>{formErrors.bathrooms}</span>}
              </div>

              <div style={styles.field}>
                <label style={styles.label}>Όροφος *</label>
                <input
                  type="number"
                  name="floor"
                  placeholder="π.χ. 3"
                  value={formData.floor}
                  onChange={handleChange}
                  onWheel={(e) => e.target.blur()}
                  style={{
                    ...styles.input,
                    ...(formErrors.floor ? styles.inputError : {}),
                  }}
                />
                {formErrors.floor && <span style={styles.errorText}>{formErrors.floor}</span>}
              </div>
            </div>
          </div>

          <hr style={styles.divider} />

          <div style={styles.sectionBlock}>
            <div style={styles.sectionHeader}>
              <Building size={18} color="#0F766E" />
              <h3 style={styles.sectionTitle}>Παροχές & Ανακαινίσεις</h3>
            </div>

            <div style={styles.pillsGrid}>
              <div
                onClick={() => toggleCheckbox('elevator')}
                style={{ ...styles.pill, ...(formData.elevator ? styles.pillActive : {}) }}
              >
                <ArrowUpFromLine size={16} />
                <span>Ασανσέρ</span>
              </div>
              <div
                onClick={() => toggleCheckbox('renovated')}
                style={{ ...styles.pill, ...(formData.renovated ? styles.pillActive : {}) }}
              >
                <Wrench size={16} />
                <span>Ανακαινισμένο</span>
              </div>
              <div
                onClick={() => toggleCheckbox('furnished')}
                style={{ ...styles.pill, ...(formData.furnished ? styles.pillActive : {}) }}
              >
                <Sofa size={16} />
                <span>Επιπλωμένο</span>
              </div>
              <div
                onClick={() => toggleCheckbox('parking')}
                style={{ ...styles.pill, ...(formData.parking ? styles.pillActive : {}) }}
              >
                <Car size={16} />
                <span>Parking</span>
              </div>
            </div>
          </div>

          <hr style={styles.divider} />

          {/* Drag & Drop Φωτογραφιών */}
          <div style={styles.sectionBlock}>
            <div style={styles.sectionHeader}>
              <ImageIcon size={18} color="#0F766E" />
              <h3 style={styles.sectionTitle}>Φωτογραφίες Ακινήτου (AI Vision)</h3>
            </div>

            <ImageDropzone
              images={images}
              previews={previews}
              onFilesAdded={handleFilesAdded}
              onRemoveImage={handleRemoveImage}
            />
          </div>

          <hr style={styles.divider} />

          <div style={styles.field}>
            <label style={styles.label}>Ζητούμενο Ενοίκιο (€) — Προαιρετικό</label>
            <input
              type="number"
              name="user_asking_price"
              placeholder="π.χ. 650 (για σύγκριση deal)"
              value={formData.user_asking_price}
              onChange={handleChange}
              onWheel={(e) => e.target.blur()}
              style={{
                ...styles.input,
                ...(formErrors.user_asking_price ? styles.inputError : {}),
              }}
            />
          </div>

          <div style={styles.actionsRow}>
            <button type="submit" disabled={loading} style={styles.submitBtn}>
              {loading ? (
                <><Loader2 size={18} className="spin" /> Υπολογισμός...</>
              ) : (
                <><Calculator size={18} /> Υπολόγισε Fair Rent</>
              )}
            </button>
            <button type="button" onClick={handleClear} style={styles.clearBtn} title="Επαναφορά φόρμας">
              <RotateCcw size={16} />
              <span>Clear</span>
            </button>
          </div>
        </form>

        {/* Δεξιά Στήλη: Onboarding Panel */}
        {!result && (
          <div style={styles.previewColumn}>
            <div style={styles.previewHeroCard}>
              <h3 style={styles.previewHeroTitle}>Πώς λειτουργεί η AI Εκτίμηση;</h3>
              <p style={styles.previewHeroText}>
                Συνδυάζουμε αλγοριθμική μηχανική μάθηση (Machine Learning) με πραγματικά δεδομένα 4.100+ αγγελιών και προηγμένη όραση AI για να προσφέρουμε αντικειμενική εικόνα αγοράς.
              </p>

              <div style={styles.statsMiniRow}>
                <div style={styles.statBoxGreen}>
                  <span style={styles.statLabelColored}>Δείγμα Αγγελιών</span>
                  <span style={styles.statValueColored}>{modelStats.dataset_size}</span>
                </div>
                <div style={styles.statBoxGreen}>
                  <span style={styles.statLabelColored}>Μέση Ακρίβεια</span>
                  <span style={styles.statValueColored}>{modelStats.model_accuracy}</span>
                </div>
              </div>

              <div style={styles.featureCardsList}>
                <div style={styles.featureCardItem}>
                  <div style={styles.featureCardIcon}>
                    <BrainCircuit size={18} color="#0F766E" />
                  </div>
                  <div>
                    <div style={styles.featureCardTitle}>1. Machine Learning Valuation</div>
                    <p style={styles.featureCardDesc}>
                      Υπολογισμός δίκαιης τιμής & εύρους βάσει m², ορόφου, έτους και παροχών.
                    </p>
                  </div>
                </div>

                <div style={styles.featureCardItem}>
                  <div style={styles.featureCardIcon}>
                    <TrainFront size={18} color="#0F766E" />
                  </div>
                  <div>
                    <div style={styles.featureCardTitle}>2. Real-time POI Proximity</div>
                    <p style={styles.featureCardDesc}>
                      Αυτόματος υπολογισμός απόστασης από Μετρό, Πανεπιστήμια, Νοσοκομεία και Πάρκα.
                    </p>
                  </div>
                </div>

                <div style={styles.featureCardItem}>
                  <div style={styles.featureCardIcon}>
                    <Sparkles size={18} color="#0F766E" />
                  </div>
                  <div>
                    <div style={styles.featureCardTitle}>3. Multimodal Vision Analysis</div>
                    <p style={styles.featureCardDesc}>
                      Οπτική αξιολόγηση φωτογραφιών για εντοπισμό ποιότητας υλικών και αναγκών ανακαίνισης.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Αποτελέσματα */}
        {result && (
          <div style={styles.resultsColumn}>
            <div style={styles.resultsWrapper}>
              {/* Premium Main Estimate Card */}
              <div style={styles.mainEstimateCard}>
                <div style={styles.cardHeaderRow}>
                  <span style={styles.mainEstimateLabel}>
                    <ShieldCheck size={14} style={{ marginRight: '4px' }} /> AI FAIR RENT ESTIMATE
                  </span>
                  <span style={styles.accuracyTag}>{modelStats.model_accuracy} Confidence</span>
                </div>

                <div style={styles.priceContainer}>
                  <span style={styles.currencySymbol}>€</span>
                  <span style={styles.mainEstimateNumber}>{result.estimated_price}</span>
                  <span style={styles.perMonthLabel}>/ μήνα</span>
                </div>

                <div style={styles.rangeRow}>
                  <div style={styles.rangePill}>
                    Εύρος: <strong>€{result.price_min} – €{result.price_max}</strong>
                  </div>
                  <div style={styles.sqmPill}>
                    <strong>€{result.price_per_sqm}</strong> / m²
                  </div>
                </div>

                {askingPrice && askingDelta !== null && (
                  <div
                    style={{
                      ...styles.askingComparisonBox,
                      backgroundColor:
                        askingDelta > 5
                          ? 'rgba(179, 63, 48, 0.15)'
                          : askingDelta < -5
                          ? 'rgba(76, 122, 109, 0.2)'
                          : 'rgba(201, 138, 62, 0.2)',
                      borderColor:
                        askingDelta > 5
                          ? '#B33F30'
                          : askingDelta < -5
                          ? '#4C7A6D'
                          : '#C98A3E',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      {askingDelta > 0 ? (
                        <TrendingUp size={18} color={askingDelta > 5 ? '#B33F30' : '#C98A3E'} />
                      ) : (
                        <TrendingDown size={18} color="#4C7A6D" />
                      )}
                      <span style={{ fontWeight: '600', fontSize: '0.85rem' }}>
                        {askingDelta > 0 ? `+${askingDelta}% Υπερτιμημένο` : `${askingDelta}% Ευκαιρία`}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.78rem', opacity: 0.9, marginTop: '2px' }}>
                      Ζητούμενο (€{askingPrice}) vs AI Εκτίμηση (€{result.estimated_price})
                    </div>
                  </div>
                )}
              </div>

              {/* AI Vision Modular Card */}
              <VisionAnalysisCard
                imagesCount={images.length}
                visionLoading={visionLoading}
                visionResult={visionResult}
              />

              {/* Deal Value Score Card */}
              <div style={styles.valueScoreCard}>
                <div style={styles.valueScoreHeader}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Star size={20} color="#C98A3E" fill="#C98A3E" />
                    <span style={styles.valueScoreTitle}>Deal Value Rating</span>
                  </div>
                  <div style={styles.valueScoreBadge}>
                    {result.value_score} <span style={{ fontSize: '0.75rem', color: '#7A7264' }}>/ 10</span>
                  </div>
                </div>

                <div style={styles.progressBarTrack}>
                  <div
                    style={{
                      ...styles.progressBarFill,
                      width: `${(result.value_score / 10) * 100}%`,
                      backgroundColor:
                        result.value_score >= 7.5
                          ? '#0F766E'
                          : result.value_score >= 5
                          ? '#C98A3E'
                          : '#B33F30',
                    }}
                  />
                </div>

                <div style={styles.dealTypeLabel}>
                  Κατάσταση:{' '}
                  <strong
                    style={{
                      color: result.value_score >= 7.5 ? '#0F766E' : '#C98A3E',
                    }}
                  >
                    {result.deal_type}
                  </strong>
                </div>
              </div>

              {/* Κοντινές Υποδομές & POIs */}
              <PoiDistanceList poiDistances={result.poi_distances} />

              {/* Μέσες Τιμές Περιοχής */}
              {result.suburb_stats && (
                <div style={styles.infoCard}>
                  <div style={styles.cardHeaderFlex}>
                    <Building2 size={16} color="#0F766E" />
                    <h4 style={styles.infoCardTitle}>
                      Μέσες Τιμές περιοχής ({cleanName(formData.suburb)})
                    </h4>
                  </div>
                  <div style={styles.statsGrid}>
                    <div style={styles.statBox}>
                      <span style={styles.statLabel}>Μέσο ενοίκιο</span>
                      <span style={styles.statValue}>€{result.suburb_stats.avg_price}</span>
                    </div>
                    <div style={styles.statBox}>
                      <span style={styles.statLabel}>Μέση τιμή / m²</span>
                      <span style={styles.statValue}>
                        €{result.suburb_stats.avg_price_per_sqm}/m²
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Παράγοντες Διάμορφωσης Τιμής */}
              {result.reasons && result.reasons.length > 0 && (
                <div style={styles.infoCard}>
                  <h4 style={styles.infoCardTitle}>Παράγοντες Διάμορφωσης Τιμής</h4>
                  <div style={styles.reasonsWrapper}>
                    {result.reasons.map((r, idx) => (
                      <div
                        key={idx}
                        style={{
                          ...styles.reasonTag,
                          backgroundColor: r.type === 'positive' ? '#EAF2F1' : '#FBEAE7',
                          color: r.type === 'positive' ? '#0F766E' : '#B33F30',
                        }}
                      >
                        {r.type === 'positive' ? (
                          <CheckCircle2 size={15} style={{ flexShrink: 0 }} />
                        ) : (
                          <XCircle size={15} style={{ flexShrink: 0 }} />
                        )}
                        <span>{r.text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}