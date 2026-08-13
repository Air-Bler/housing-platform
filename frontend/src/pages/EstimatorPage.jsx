import React, { useState, useEffect } from 'react';
import { loadCityStats } from '../components/landing/data/loadcitystats';
import {
  Calculator,
  Star,
  TrainFront,
  GraduationCap,
  HeartPulse,
  Trees,
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
  Upload,
  X,
  Eye,
  ArrowRight
} from 'lucide-react';

export default function FairRentEstimator() {
  const initialForm = {
    sqm: '',
    bedrooms: '',
    bathrooms: '',
    floor: '',
    year_built: '',
    suburb: '',
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

  
  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [visionResult, setVisionResult] = useState(null);
  const [visionLoading, setVisionLoading] = useState(false);

  const cleanName = (raw) => (raw ? raw.split('(')[0].split('-')[0].split('–')[0].trim() : '');

  useEffect(() => {
    fetch('http://127.0.0.1:8000/api/suburbs')
      .then((res) => {
        if (!res.ok) throw new Error("API Offline");
        return res.json();
      })
      .then((data) => {
        if (data.suburbs && data.suburbs.length > 0) {
          setSuburbs(data.suburbs);
        }
      })
      .catch(() => {
        loadCityStats()
          .then((stats) => {
            const list = stats.chartData.map((n) => n.name).sort();
            setSuburbs(list);
          })
          .catch(() => setError('Δεν μπορέσαμε να φορτώσουμε τις γειτονιές.'));
      });
  }, []);

  const handleFilesAdded = (newFiles) => {
    const validFiles = Array.from(newFiles).filter((file) => file.type.startsWith('image/'));
    if (validFiles.length === 0) return;

    const updatedImages = [...images, ...validFiles];
    setImages(updatedImages);

    const updatedPreviews = updatedImages.map((file) => URL.createObjectURL(file));
    setPreviews(updatedPreviews);
  };

  const handleRemoveImage = (index) => {
    const updatedImages = images.filter((_, i) => i !== index);
    const updatedPreviews = previews.filter((_, i) => i !== index);
    setImages(updatedImages);
    setPreviews(updatedPreviews);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFilesAdded(e.dataTransfer.files);
    }
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

    const payload = {
      ...formData,
      sqm: parseFloat(formData.sqm),
      bedrooms: parseInt(formData.bedrooms, 10),
      bathrooms: parseInt(formData.bathrooms, 10),
      floor: parseInt(formData.floor, 10),
      year_built: parseInt(formData.year_built, 10),
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
      });
  };

  const askingPrice = formData.user_asking_price ? parseFloat(formData.user_asking_price) : null;
  const askingDelta =
    result && askingPrice
      ? Math.round(((askingPrice - result.estimated_price) / result.estimated_price) * 100)
      : null;

  const getProximityPercentage = (meters) => {
    if (!meters || meters <= 0) return 0;
    if (meters <= 300) return 100;
    if (meters >= 3000) return 10;
    return Math.max(10, Math.round(100 - ((meters - 300) / 2700) * 90));
  };

  const getProximityColor = (meters) => {
    if (meters <= 600) return '#0F766E';
    if (meters <= 1500) return '#C98A3E';
    return '#7A7264';
  };

  

  return (
    <div style={styles.pageContainer}>
      <style>{`
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
        <span style={styles.badge}>
          <Sparkles size={14} style={{ marginRight: '6px' }} />
          AI Rental Engine
        </span>
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
                <option value="" disabled>
                  -- Επιλέξτε γειτονιά --
                </option>
                {suburbs.map((sub, idx) => (
                  <option key={idx} value={sub}>
                    {cleanName(sub)}
                  </option>
                ))}
              </select>
              {formErrors.suburb && <span style={styles.errorText}>{formErrors.suburb}</span>}
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
                style={{
                  ...styles.pill,
                  ...(formData.elevator ? styles.pillActive : {}),
                }}
              >
                <ArrowUpFromLine size={16} />
                <span>Ασανσέρ</span>
              </div>

              <div
                onClick={() => toggleCheckbox('renovated')}
                style={{
                  ...styles.pill,
                  ...(formData.renovated ? styles.pillActive : {}),
                }}
              >
                <Wrench size={16} />
                <span>Ανακαινισμένο</span>
              </div>

              <div
                onClick={() => toggleCheckbox('furnished')}
                style={{
                  ...styles.pill,
                  ...(formData.furnished ? styles.pillActive : {}),
                }}
              >
                <Sofa size={16} />
                <span>Επιπλωμένο</span>
              </div>

              <div
                onClick={() => toggleCheckbox('parking')}
                style={{
                  ...styles.pill,
                  ...(formData.parking ? styles.pillActive : {}),
                }}
              >
                <Car size={16} />
                <span>Parking</span>
              </div>
            </div>
          </div>

          <hr style={styles.divider} />

          {/*  DRAG & DROP SECTION */}
          <div style={styles.sectionBlock}>
            <div style={styles.sectionHeader}>
              <ImageIcon size={18} color="#0F766E" />
              <h3 style={styles.sectionTitle}>Φωτογραφίες Ακινήτου (AI Vision)</h3>
            </div>

            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              style={{
                ...styles.dropZone,
                ...(isDragging ? styles.dropZoneActive : {}),
              }}
            >
              <input
                type="file"
                id="file-upload"
                multiple
                accept="image/*"
                onChange={(e) => handleFilesAdded(e.target.files)}
                style={{ display: 'none' }}
              />
              <label htmlFor="file-upload" style={styles.uploadLabel}>
                <div style={styles.uploadIconCircle}>
                  <Upload size={22} color="#0F766E" />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                  <span style={{ fontSize: '0.88rem', fontWeight: '600', color: '#16212B' }}>
                    Σύρε (Drag & Drop) εδώ τις φωτογραφίες σου
                  </span>
                  <span style={{ fontSize: '0.78rem', color: '#7A7264' }}>
                    ή κάνε κλικ για να επιλέξεις αρχεία από τη συσκευή σου
                  </span>
                </div>
              </label>
            </div>

            {previews.length > 0 && (
              <div style={styles.previewsGrid}>
                {previews.map((src, index) => (
                  <div key={index} style={styles.previewThumbWrapper}>
                    <img src={src} alt={`upload-${index}`} style={styles.previewThumb} />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index)}
                      style={styles.removeBtn}
                      title="Αφαίρεση φωτογραφίας"
                    >
                      <X size={12} color="#FFFFFF" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <span style={{ fontSize: '0.75rem', color: '#7A7264' }}>
              Προαιρετικό: Το AI θα αναλύσει οπτικά την ποιότητα ανακαίνισης και φωτεινότητας για ±15% προσαρμογή.
            </span>
          </div>

          <hr style={styles.divider} />

          <div style={styles.field}>
            <label style={styles.label}>Ζητούμενο Ενοίκιο (€) — Προαιρετικό</label>
            <input
              type="number"
              name="user_asking_price"
              placeholder="π.χ. 650 (για σύγκριση)"
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
                <>
                  <Loader2 size={18} className="spin" /> Υπολογισμός...
                </>
              ) : (
                <>
                  <Calculator size={18} /> Υπολόγισε Fair Rent
                </>
              )}
            </button>

            <button type="button" onClick={handleClear} style={styles.clearBtn} title="Επαναφορά φόρμας">
              <RotateCcw size={16} />
              <span>Clear</span>
            </button>
          </div>
        </form>

       
        <div style={styles.resultsColumn}>
          {!result && !loading && (
            <div style={styles.emptyStateCard}>
              <div style={styles.emptyIconCircle}>
                <Sparkles size={32} color="#0F766E" />
              </div>
              <h3 style={styles.emptyTitle}>Έτοιμος για την εκτίμηση;</h3>
              <p style={styles.emptyText}>
                Συμπλήρωσε τα χαρακτηριστικά του ακινήτου αριστερά και πάτα <strong>«Υπολόγισε Fair Rent»</strong> για να λάβεις την AI αναφορά τιμής.
              </p>
            </div>
          )}

          {result && (
            <div style={styles.resultsWrapper}>
              
              <div style={styles.mainEstimateCard}>
                <div style={styles.cardHeaderRow}>
                  <span style={styles.mainEstimateLabel}>
                    <ShieldCheck size={14} style={{ marginRight: '4px' }} /> AI FAIR RENT ESTIMATE
                  </span>
                  <span style={styles.accuracyTag}>98.4% Confidence</span>
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

                {askingPrice !== null && askingDelta !== null && (
                  <div
                    style={{
                      ...styles.askingComparisonBox,
                      backgroundColor: askingDelta > 5 ? 'rgba(179, 63, 48, 0.15)' : askingDelta < -5 ? 'rgba(76, 122, 109, 0.2)' : 'rgba(201, 138, 62, 0.2)',
                      borderColor: askingDelta > 5 ? '#B33F30' : askingDelta < -5 ? '#4C7A6D' : '#C98A3E',
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

             {/* ✨ ΠΛΟΥΣΙΑ ΚΑΡΤΑ AI VISION ANALYSIS REPORT */}
{(visionLoading || visionResult) && (
  <div style={styles.prettyVisionCard}>
    <div style={styles.visionCardHeader}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Eye size={18} color="#0F766E" />
        <h4 style={styles.visionTitle}>Αναλυτική AI Οπτική Αξιολόγηση</h4>
      </div>
      {visionResult && visionResult.score && (
        <div style={styles.visionScoreBadge}>
          <Star size={14} color="#C98A3E" fill="#C98A3E" />
          <span>{visionResult.score} / 10</span>
        </div>
      )}
    </div>

    {visionLoading && (
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#0F766E', fontSize: '0.88rem', padding: '1.2rem 0' }}>
        <Loader2 size={18} className="spin" />
        <span>Αναλύουμε λεπτομερώς κάθε χώρο του ακινήτου...</span>
      </div>
    )}

    {visionResult && !visionLoading && (
      <div style={styles.parsedVisionWrapper}>
        {/* Ετυμηγορία AI */}
        {visionResult.summary_quote && (
          <div style={styles.summaryQuoteBox}>
            <Sparkles size={16} color="#0F766E" style={{ flexShrink: 0 }} />
            <span style={{ fontSize: '0.85rem', fontStyle: 'italic', color: '#16212B', fontWeight: '500' }}>
              "{visionResult.summary_quote}"
            </span>
          </div>
        )}

        {/* 📊 Αναλυτικός Πίνακας: Τι πληρώνεις / Τι γλιτώνεις */}
        {visionResult.breakdown && visionResult.breakdown.length > 0 && (
          <div style={styles.breakdownList}>
            <span style={{ fontSize: '0.8rem', fontWeight: '700', color: '#52606B', marginBottom: '0.2rem', display: 'block' }}>
              ΑΝΑΛΥΣΗ ΑΞΙΑΣ ΑΝΑ ΧΩΡΟ (ΤΙ ΠΛΗΡΩΝΕΙΣ / ΓΛΙΤΩΝΕΙΣ):
            </span>

            {visionResult.breakdown.map((item, idx) => (
              <div key={idx} style={styles.breakdownItem}>
                <div style={{ flex: 1 }}>
                  <span style={styles.breakdownCategory}>{item.category}</span>
                  <p style={styles.breakdownDetails}>{item.details}</p>
                </div>
                <div
                  style={{
                    ...styles.impactBadge,
                    backgroundColor: item.impact_euro > 0 ? '#EAF2F1' : item.impact_euro < 0 ? '#FBEAE7' : '#F3EFE6',
                    color: item.impact_euro > 0 ? '#0F766E' : item.impact_euro < 0 ? '#B33F30' : '#52606B',
                  }}
                >
                  {item.impact_euro > 0 ? `+€${item.impact_euro}/μήνα` : item.impact_euro < 0 ? `-€${Math.abs(item.impact_euro)}/μήνα` : '€0'}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 💳 Τελικό Summary Κάρτας */}
        <div style={styles.adjustmentSummaryCard}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.1rem' }}>
            <span style={{ fontSize: '0.75rem', color: '#52606B' }}>Συνολική Οπτική Προσαρμογή</span>
            <span style={{ fontSize: '1rem', fontWeight: '700', color: visionResult.total_adjustment_euro >= 0 ? '#0F766E' : '#B33F30' }}>
              {visionResult.total_adjustment_euro >= 0 ? `+€${visionResult.total_adjustment_euro}/μήνα` : `-€${Math.abs(visionResult.total_adjustment_euro)}/μήνα`}
            </span>
          </div>
          <ArrowRight size={18} color="#0F766E" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.1rem', textAlign: 'right' }}>
            <span style={{ fontSize: '0.75rem', color: '#52606B' }}>Τελικό Προσαρμοσμένο Ενοίκιο</span>
            <span style={{ fontSize: '1.15rem', fontWeight: '800', color: '#16212B' }}>
              €{visionResult.adjusted_price || result.estimated_price}
            </span>
          </div>
        </div>
      </div>
    )}
  </div>
)}

              {/*  Deal Value Score Card */}
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
                      backgroundColor: result.value_score >= 7.5 ? '#0F766E' : result.value_score >= 5 ? '#C98A3E' : '#B33F30',
                    }}
                  />
                </div>

                <div style={styles.dealTypeLabel}>
                  Κατάσταση: <strong style={{ color: result.value_score >= 7.5 ? '#0F766E' : '#C98A3E' }}>{result.deal_type}</strong>
                </div>
              </div>

              {/*  Κοντινές Υποδομές */}
              {result.poi_distances && (
                <div style={styles.infoCard}>
                  <div style={styles.cardHeaderFlex}>
                    <MapPin size={16} color="#0F766E" />
                    <h4 style={styles.infoCardTitle}>Κοντινές Υποδομές & Προσβασιμότητα</h4>
                  </div>

                  <div style={styles.poiBarsContainer}>
                    <PoiBarItem
                      icon={<TrainFront size={16} color="#0F766E" />}
                      title="Μετρό / ΗΣΑΠ"
                      name={result.poi_distances.metro_name || "Σταθμός Μετρό"}
                      distanceMeters={result.poi_distances.metro_m}
                      getPercentage={getProximityPercentage}
                      getColor={getProximityColor}
                    />

                    <PoiBarItem
                      icon={<GraduationCap size={16} color="#0F766E" />}
                      title="Πανεπιστήμιο"
                      name={result.poi_distances.uni_name || "Πανεπιστημιούπολη"}
                      distanceMeters={result.poi_distances.uni_m}
                      getPercentage={getProximityPercentage}
                      getColor={getProximityColor}
                    />

                    <PoiBarItem
                      icon={<HeartPulse size={16} color="#0F766E" />}
                      title="Νοσοκομείο"
                      name={result.poi_distances.hospital_name || "Νοσοκομειακή Μονάδα"}
                      distanceMeters={result.poi_distances.hospital_m}
                      getPercentage={getProximityPercentage}
                      getColor={getProximityColor}
                    />

                    <PoiBarItem
                      icon={<Trees size={16} color="#0F766E" />}
                      title="Πάρκο"
                      name={result.poi_distances.park_name || "Πάρκο / Άλσος"}
                      distanceMeters={result.poi_distances.park_m}
                      getPercentage={getProximityPercentage}
                      getColor={getProximityColor}
                    />
                  </div>
                </div>
              )}

              {/*  Μέσες Τιμές Περιοχής */}
              {result.suburb_stats && (
                <div style={styles.infoCard}>
                  <div style={styles.cardHeaderFlex}>
                    <Building2 size={16} color="#0F766E" />
                    <h4 style={styles.infoCardTitle}>Μέσες Τιμές περιοχής ({cleanName(formData.suburb)})</h4>
                  </div>
                  <div style={styles.statsGrid}>
                    <div style={styles.statBox}>
                      <span style={styles.statLabel}>Μέσο ενοίκιο</span>
                      <span style={styles.statValue}>€{result.suburb_stats.avg_price}</span>
                    </div>
                    <div style={styles.statBox}>
                      <span style={styles.statLabel}>Μέση τιμή / m²</span>
                      <span style={styles.statValue}>€{result.suburb_stats.avg_price_per_sqm}/m²</span>
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
          )}
        </div>
      </div>
    </div>
  );
}

function PoiBarItem({ icon, title, name, distanceMeters, getPercentage, getColor }) {
  const pct = getPercentage(distanceMeters);
  const color = getColor(distanceMeters);

  return (
    <div style={poiStyles.itemContainer}>
      <div style={poiStyles.headerRow}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          {icon}
          <span style={poiStyles.titleText}>{title}</span>
          <span style={poiStyles.nameText}>({name})</span>
        </div>
        <span style={{ ...poiStyles.distanceText, color: color }}>
          ~{distanceMeters >= 1000 ? `${(distanceMeters / 1000).toFixed(1)}km` : `${distanceMeters}m`}
        </span>
      </div>

      <div style={poiStyles.track}>
        <div
          style={{
            ...poiStyles.fill,
            width: `${pct}%`,
            backgroundColor: color,
          }}
        />
      </div>
    </div>
  );
}

const poiStyles = {
  itemContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.35rem',
    marginBottom: '0.85rem',
  },
  headerRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '0.82rem',
  },
  titleText: {
    fontWeight: '600',
    color: '#16212B',
  },
  nameText: {
    fontSize: '0.78rem',
    color: '#52606B',
  },
  distanceText: {
    fontWeight: '700',
    fontSize: '0.82rem',
  },
  track: {
    width: '100%',
    height: '6px',
    backgroundColor: '#E5E7EB',
    borderRadius: '999px',
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: '999px',
    transition: 'width 0.4s ease',
  },
};

const styles = {
  pageContainer: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '2.5rem 1.5rem 5rem',
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    color: '#16212B',
  },
  header: {
    textAlign: 'center',
    marginBottom: '2.5rem',
  },
  badge: {
    display: 'inline-flex',
    alignItems: 'center',
    backgroundColor: '#EAF2F1',
    color: '#0F766E',
    padding: '0.4rem 0.9rem',
    borderRadius: '999px',
    fontSize: '0.82rem',
    fontWeight: '600',
    marginBottom: '0.75rem',
  },
  title: {
    fontFamily: "'Fraunces', Georgia, serif",
    fontSize: '2.2rem',
    fontWeight: '600',
    color: '#16212B',
    marginBottom: '0.5rem',
  },
  subtitle: {
    fontSize: '0.98rem',
    color: '#52606B',
    maxWidth: '560px',
    margin: '0 auto',
    lineHeight: '1.5',
  },
  errorBanner: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    backgroundColor: '#FBEAE7',
    border: '1px solid #F1DAD3',
    color: '#8A3226',
    padding: '0.85rem 1.25rem',
    borderRadius: '10px',
    fontSize: '0.88rem',
    marginBottom: '1.5rem',
  },
  mainLayout: {
    display: 'grid',
    gridTemplateColumns: '1.1fr 0.9fr',
    gap: '2rem',
    alignItems: 'stretch',
  },
  formCard: {
    backgroundColor: '#FFFDF9',
    border: '1px solid #E7DFCD',
    borderRadius: '16px',
    padding: '2rem',
    boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
    boxSizing: 'border-box',
    width: '100%',
  },
  sectionBlock: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  sectionTitle: {
    fontFamily: "'Fraunces', Georgia, serif",
    fontSize: '1.05rem',
    fontWeight: '600',
    color: '#16212B',
    margin: 0,
  },
  divider: {
    border: 'none',
    borderTop: '1px solid #E7DFCD',
    margin: '1.25rem 0',
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.35rem',
    width: '100%',
    boxSizing: 'border-box',
  },
  label: {
    fontSize: '0.8rem',
    fontWeight: '600',
    color: '#52606B',
  },
  input: {
    width: '100%',
    boxSizing: 'border-box',
    padding: '0.65rem 0.85rem',
    borderRadius: '8px',
    border: '1px solid #D8CDB8',
    fontSize: '0.92rem',
    color: '#16212B',
    backgroundColor: '#FFFFFF',
    outline: 'none',
  },
  selectInput: {
    width: '100%',
    boxSizing: 'border-box',
    padding: '0.7rem 0.85rem',
    borderRadius: '8px',
    border: '1px solid #D8CDB8',
    fontSize: '0.92rem',
    fontWeight: '500',
    color: '#16212B',
    backgroundColor: '#FFFFFF',
    outline: 'none',
    cursor: 'pointer',
  },
  inputError: {
    borderColor: '#B33F30 !important',
  },
  errorText: {
    fontSize: '0.75rem',
    color: '#B33F30',
  },
  grid2: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1rem',
  },
  grid3: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 1fr',
    gap: '1rem',
  },
  pillsGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '0.75rem',
  },
  pill: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    padding: '0.7rem',
    borderRadius: '10px',
    border: '1px solid #E7DFCD',
    backgroundColor: '#F9F6EE',
    color: '#52606B',
    fontSize: '0.85rem',
    fontWeight: '500',
    cursor: 'pointer',
    userSelect: 'none',
  },
  pillActive: {
    backgroundColor: '#EAF2F1',
    borderColor: '#0F766E',
    color: '#0F766E',
    fontWeight: '600',
  },
  dropZone: {
    border: '2px dashed #D8CDB8',
    borderRadius: '12px',
    padding: '1.25rem',
    backgroundColor: '#FAF8F5',
    textAlign: 'center',
    transition: 'all 0.2s ease',
    cursor: 'pointer',
  },
  dropZoneActive: {
    borderColor: '#0F766E',
    backgroundColor: '#EAF2F1',
  },
  uploadLabel: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '1rem',
    cursor: 'pointer',
  },
  uploadIconCircle: {
    width: '42px',
    height: '42px',
    borderRadius: '50%',
    backgroundColor: '#EAF2F1',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  previewsGrid: {
    display: 'flex',
    gap: '0.6rem',
    flexWrap: 'wrap',
    marginTop: '0.5rem',
  },
  previewThumbWrapper: {
    position: 'relative',
    width: '64px',
    height: '64px',
    borderRadius: '8px',
    overflow: 'hidden',
    border: '1px solid #D8CDB8',
  },
  previewThumb: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  removeBtn: {
    position: 'absolute',
    top: '3px',
    right: '3px',
    backgroundColor: 'rgba(179, 63, 48, 0.85)',
    border: 'none',
    borderRadius: '50%',
    width: '18px',
    height: '18px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    padding: 0,
  },

  /* 🌟 Pretty Vision Card Styles */
  prettyVisionCard: {
    backgroundColor: '#FFFDF9',
    border: '1px solid #C5E0DC',
    borderRadius: '16px',
    padding: '1.25rem',
    boxShadow: '0 4px 15px rgba(15, 118, 110, 0.05)',
  },
  visionCardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '0.85rem',
    borderBottom: '1px solid #E7DFCD',
    paddingBottom: '0.65rem',
  },
  visionTitle: {
    fontFamily: "'Fraunces', Georgia, serif",
    fontSize: '0.98rem',
    fontWeight: '600',
    color: '#16212B',
    margin: 0,
  },
  visionScoreBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.3rem',
    backgroundColor: '#FBF3E8',
    color: '#8A5D20',
    padding: '0.3rem 0.65rem',
    borderRadius: '999px',
    fontSize: '0.82rem',
    fontWeight: '700',
  },
  parsedVisionWrapper: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  summaryQuoteBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    backgroundColor: '#F3EFE6',
    borderRadius: '10px',
    padding: '0.65rem 0.85rem',
  },
  breakdownList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.6rem',
    marginTop: '0.25rem',
  },
  breakdownItem: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '0.8rem',
    backgroundColor: '#FAF8F5',
    border: '1px solid #E7DFCD',
    borderRadius: '10px',
    padding: '0.65rem 0.85rem',
  },
  breakdownCategory: {
    display: 'block',
    fontSize: '0.8rem',
    fontWeight: '700',
    color: '#16212B',
  },
  breakdownDetails: {
    fontSize: '0.78rem',
    color: '#52606B',
    margin: 0,
    lineHeight: '1.3',
  },
  impactBadge: {
    fontSize: '0.78rem',
    fontWeight: '700',
    padding: '0.35rem 0.65rem',
    borderRadius: '8px',
    whiteSpace: 'nowrap',
  },
  adjustmentSummaryCard: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F3EFE6',
    borderRadius: '10px',
    padding: '0.75rem 1rem',
    marginTop: '0.25rem',
  },

  actionsRow: {
    display: 'flex',
    gap: '0.75rem',
    marginTop: '1.75rem',
  },
  submitBtn: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    backgroundColor: '#0F766E',
    color: '#FFFFFF',
    border: 'none',
    padding: '0.9rem',
    borderRadius: '10px',
    fontSize: '0.95rem',
    fontWeight: '600',
    cursor: 'pointer',
  },
  clearBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
    backgroundColor: '#F3EFE6',
    color: '#52606B',
    border: '1px solid #E7DFCD',
    padding: '0.9rem 1.25rem',
    borderRadius: '10px',
    fontSize: '0.88rem',
    fontWeight: '600',
    cursor: 'pointer',
  },
  resultsColumn: {
    height: '100%',
  },
  emptyStateCard: {
    height: '100%',
    minHeight: '400px',
    backgroundColor: '#FFFDF9',
    border: '2px dashed #E7DFCD',
    borderRadius: '16px',
    padding: '3rem 2rem',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    boxSizing: 'border-box',
  },
  emptyIconCircle: {
    width: '64px',
    height: '64px',
    borderRadius: '50%',
    backgroundColor: '#EAF2F1',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '1.25rem',
  },
  emptyTitle: {
    fontFamily: "'Fraunces', Georgia, serif",
    fontSize: '1.25rem',
    fontWeight: '600',
    color: '#16212B',
    marginBottom: '0.5rem',
  },
  emptyText: {
    fontSize: '0.9rem',
    color: '#7A7264',
    lineHeight: '1.5',
    maxWidth: '320px',
    margin: 0,
  },
  resultsWrapper: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.1rem',
  },
  mainEstimateCard: {
    backgroundColor: '#0F766E',
    backgroundImage: 'linear-gradient(135deg, #0F766E 0%, #163846 100%)',
    color: '#FFFFFF',
    borderRadius: '18px',
    padding: '1.75rem',
    boxShadow: '0 12px 30px rgba(15,118,110,0.22)',
  },
  cardHeaderRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1rem',
  },
  mainEstimateLabel: {
    display: 'flex',
    alignItems: 'center',
    fontSize: '0.75rem',
    fontWeight: '700',
    letterSpacing: '1px',
    color: '#A7F3D0',
  },
  accuracyTag: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    padding: '0.2rem 0.6rem',
    borderRadius: '999px',
    fontSize: '0.72rem',
    fontWeight: '600',
  },
  priceContainer: {
    display: 'flex',
    alignItems: 'baseline',
    justifyContent: 'center',
    gap: '0.2rem',
    margin: '0.5rem 0 1rem',
  },
  currencySymbol: {
    fontSize: '1.8rem',
    fontWeight: '600',
    color: '#A7F3D0',
  },
  mainEstimateNumber: {
    fontFamily: "'Fraunces', Georgia, serif",
    fontSize: '3.2rem',
    fontWeight: '700',
    lineHeight: 1,
  },
  perMonthLabel: {
    fontSize: '0.95rem',
    opacity: 0.8,
    marginLeft: '0.3rem',
  },
  rangeRow: {
    display: 'flex',
    justifyContent: 'center',
    gap: '0.75rem',
    flexWrap: 'wrap',
  },
  rangePill: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    padding: '0.4rem 0.85rem',
    borderRadius: '8px',
    fontSize: '0.8rem',
  },
  sqmPill: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    padding: '0.4rem 0.85rem',
    borderRadius: '8px',
    fontSize: '0.8rem',
  },
  askingComparisonBox: {
    marginTop: '1.25rem',
    padding: '0.75rem 1rem',
    borderRadius: '12px',
    border: '1px solid',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
  },
  valueScoreCard: {
    backgroundColor: '#FFFDF9',
    border: '1px solid #E7DFCD',
    borderRadius: '14px',
    padding: '1.25rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.65rem',
  },
  valueScoreHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  valueScoreTitle: {
    fontFamily: "'Fraunces', Georgia, serif",
    fontSize: '0.95rem',
    fontWeight: '600',
    color: '#16212B',
  },
  valueScoreBadge: {
    fontFamily: "'Fraunces', Georgia, serif",
    fontSize: '1.2rem',
    fontWeight: '700',
    color: '#16212B',
  },
  progressBarTrack: {
    width: '100%',
    height: '8px',
    backgroundColor: '#E5E7EB',
    borderRadius: '999px',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: '999px',
    transition: 'width 0.5s ease',
  },
  dealTypeLabel: {
    fontSize: '0.82rem',
    color: '#52606B',
  },
  infoCard: {
    backgroundColor: '#FFFDF9',
    border: '1px solid #E7DFCD',
    borderRadius: '14px',
    padding: '1.1rem 1.25rem',
  },
  cardHeaderFlex: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
    marginBottom: '0.85rem',
  },
  infoCardTitle: {
    fontFamily: "'Fraunces', Georgia, serif",
    fontSize: '0.92rem',
    fontWeight: '600',
    color: '#16212B',
    margin: 0,
  },
  poiBarsContainer: {
    display: 'flex',
    flexDirection: 'column',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '0.75rem',
  },
  statBox: {
    backgroundColor: '#F9F6EE',
    padding: '0.7rem 0.85rem',
    borderRadius: '10px',
    border: '1px solid #E7DFCD',
  },
  statLabel: {
    display: 'block',
    fontSize: '0.72rem',
    color: '#7A7264',
    marginBottom: '0.15rem',
  },
  statValue: {
    fontSize: '1.05rem',
    fontWeight: '700',
    color: '#16212B',
  },
  reasonsWrapper: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  reasonTag: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.6rem 0.85rem',
    borderRadius: '8px',
    fontSize: '0.82rem',
    fontWeight: '500',
  },
};