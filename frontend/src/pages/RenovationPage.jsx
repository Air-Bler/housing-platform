import React, { useState, useEffect } from 'react';
import { loadCityStats } from '../components/landing/data/loadcitystats';
import { styles } from '../components/estimator/estimator.styles';
import ImageDropzone from '../components/estimator/ImageDropzone';
import ScenarioCard from '../components/renovation/ScenarioCard';
import CashflowChart from '../components/renovation/CashflowChart';
import CostBreakdown from '../components/renovation/CostBreakdown';
import RenovationDiagnosisCard from '../components/renovation/RenovationDiagnosisCard';
import { renovationStyles as rs, formatEuro, formatYears } from '../components/renovation/renovation.styles';

import {
  Hammer,
  Loader2,
  AlertCircle,
  Home,
  MapPin,
  Building,
  Car,
  ArrowUpFromLine,
  RotateCcw,
  Image as ImageIcon,
  Wallet,
  Hourglass,
  Landmark,
  TrendingUp,
  Info,
  KeyRound,
} from 'lucide-react';

const CONDITIONS = [
  { value: 'light', title: 'Θέλει φρεσκάρισμα', desc: 'Κατοικήσιμο, φθορές από τον χρόνο' },
  { value: 'medium', title: 'Εμφανείς φθορές', desc: 'Παλιά κουφώματα, δάπεδα ή κουζίνα' },
  { value: 'heavy', title: 'Ριζική ανακαίνιση', desc: 'Υγρασίες, παλιές εγκαταστάσεις, δεν μένεται' },
];

const TAX_RATES = [
  { value: '0.15', label: '15% — έως €12.000 ετήσια ενοίκια' },
  { value: '0.35', label: '35% — €12.001 έως €35.000' },
  { value: '0.45', label: '45% — πάνω από €35.000' },
];

const initialForm = {
  suburb: '',
  sqm: '',
  bedrooms: '',
  bathrooms: '',
  floor: '',
  year_built: '',
  condition: 'medium',
  elevator: false,
  parking: false,
  budget: '',
  years_vacant: '',
  tax_rate: '0.15',
  use_subsidy: false,
};

export default function RenovationPage() {
  const [suburbs, setSuburbs] = useState([]);
  const [formData, setFormData] = useState(initialForm);
  const [formErrors, setFormErrors] = useState({});
  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [result, setResult] = useState(null);
  const [selectedKey, setSelectedKey] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const cleanName = (raw) => (raw ? raw.split('(')[0].split('-')[0].split('–')[0].trim() : '');

  useEffect(() => {
    loadCityStats()
      .then((stats) => {
        if (stats && stats.chartData) {
          setSuburbs(stats.chartData.map((n) => n.name).sort((a, b) => a.localeCompare(b, 'el')));
        }
      })
      .catch(() => setError('Δεν μπορέσαμε να φορτώσουμε τα δεδομένα των γειτονιών.'));
  }, []);

  const handleFilesAdded = (newFiles) => {
    const validFiles = Array.from(newFiles).filter((file) => file.type.startsWith('image/'));
    if (validFiles.length === 0) return;
    const updatedImages = [...images, ...validFiles].slice(0, 10);
    setImages(updatedImages);
    setPreviews(updatedImages.map((file) => URL.createObjectURL(file)));
  };

  const handleRemoveImage = (index) => {
    setImages(images.filter((_, i) => i !== index));
    setPreviews(previews.filter((_, i) => i !== index));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) setFormErrors((prev) => ({ ...prev, [name]: null }));
  };

  const setField = (name, value) => setFormData((prev) => ({ ...prev, [name]: value }));

  const handleClear = () => {
    setFormData(initialForm);
    setFormErrors({});
    setImages([]);
    setPreviews([]);
    setResult(null);
    setSelectedKey(null);
    setError(null);
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

    ['bedrooms', 'bathrooms', 'floor'].forEach((f) => {
      if (formData[f] === '' || isNaN(parseInt(formData[f], 10))) errors[f] = 'Υποχρεωτικό.';
    });

    if (formData.budget !== '' && !(parseFloat(formData.budget) > 0)) errors.budget = 'Μη έγκυρο ποσό.';
    if (formData.years_vacant !== '' && !(parseFloat(formData.years_vacant) >= 0)) errors.years_vacant = 'Μη έγκυρη τιμή.';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) {
      setError('Παρακαλώ διορθώστε τα σφάλματα στη φόρμα πριν συνεχίσετε.');
      return;
    }

    setLoading(true);

    const body = new FormData();
    ['suburb', 'sqm', 'bedrooms', 'bathrooms', 'floor', 'year_built', 'condition', 'tax_rate'].forEach((f) =>
      body.append(f, formData[f])
    );
    body.append('elevator', formData.elevator);
    body.append('parking', formData.parking);
    body.append('use_subsidy', formData.use_subsidy);
    if (formData.budget !== '') body.append('budget', formData.budget);
    if (formData.years_vacant !== '') body.append('years_vacant', formData.years_vacant);
    images.forEach((file) => body.append('images', file));

    fetch('http://127.0.0.1:8000/api/renovation-roi', { method: 'POST', body })
      .then((res) => {
        if (!res.ok) throw new Error(`Σφάλμα API (${res.status})`);
        return res.json();
      })
      .then((data) => {
        setResult(data);
        setSelectedKey(data.recommended_key);
        setLoading(false);
      })
      .catch((err) => {
        setError('Κάτι πήγε στραβά κατά τον υπολογισμό. ' + err.message);
        setLoading(false);
      });
  };

  const recommended = result && result.scenarios.find((s) => s.key === result.recommended_key);
  const selected = result && result.scenarios.find((s) => s.key === selectedKey);

  const inputStyle = (name) => ({ ...styles.input, ...(formErrors[name] ? styles.inputError : {}) });

  const numberField = (name, label, placeholder) => (
    <div style={styles.field}>
      <label style={styles.label}>{label}</label>
      <input
        type="number"
        name={name}
        placeholder={placeholder}
        value={formData[name]}
        onChange={handleChange}
        onWheel={(e) => e.target.blur()}
        style={inputStyle(name)}
      />
      {formErrors[name] && <span style={styles.errorText}>{formErrors[name]}</span>}
    </div>
  );

  return (
    <div style={styles.pageContainer}>
      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .spin { animation: spin 1s linear infinite; }
        input[type=number]::-webkit-inner-spin-button,
        input[type=number]::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
        input[type=number] { -moz-appearance: textfield; }
        @media (max-width: 900px) {
          .reno-main, .reno-scenarios, .reno-twocol { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 560px) {
          .reno-conditions, .reno-hero-stats, .reno-grid3 { grid-template-columns: 1fr !important; }
        }
      `}</style>

      <div style={styles.header}>
        <h1 style={styles.title}>Renovation ROI</h1>
        <p style={styles.subtitle}>
          Έχετε κλειστό ή παρατημένο ακίνητο; Δείτε πόσο κοστίζει να το ανακαινίσετε, πόσο θα νοικιάζεται
          και σε πόσο καιρό θα σας έχει αποπληρώσει.
        </p>
      </div>

      {error && (
        <div style={styles.errorBanner}>
          <AlertCircle size={18} color="#B33F30" style={{ flexShrink: 0 }} />
          <span>{error}</span>
        </div>
      )}

      <div className="reno-main" style={styles.mainLayout}>
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
                style={{ ...styles.selectInput, ...(formErrors.suburb ? styles.inputError : {}) }}
              >
                <option value="">-- Επιλέξτε γειτονιά --</option>
                {suburbs.map((sub) => (
                  <option key={sub} value={sub}>{cleanName(sub)}</option>
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
              {numberField('sqm', 'Εμβαδόν (m²) *', 'π.χ. 75')}
              {numberField('year_built', 'Έτος κατασκευής *', 'π.χ. 1972')}
            </div>
            <div className="reno-grid3" style={styles.grid3}>
              {numberField('bedrooms', 'Υπνοδωμάτια *', 'π.χ. 2')}
              {numberField('bathrooms', 'Μπάνια *', 'π.χ. 1')}
              {numberField('floor', 'Όροφος *', 'π.χ. 3')}
            </div>
            <div style={styles.pillsGrid}>
              <div
                onClick={() => setField('elevator', !formData.elevator)}
                style={{ ...styles.pill, ...(formData.elevator ? styles.pillActive : {}) }}
              >
                <ArrowUpFromLine size={16} />
                <span>Ασανσέρ</span>
              </div>
              <div
                onClick={() => setField('parking', !formData.parking)}
                style={{ ...styles.pill, ...(formData.parking ? styles.pillActive : {}) }}
              >
                <Car size={16} />
                <span>Parking</span>
              </div>
            </div>
          </div>

          <hr style={styles.divider} />

          <div style={styles.sectionBlock}>
            <div style={styles.sectionHeader}>
              <Building size={18} color="#0F766E" />
              <h3 style={styles.sectionTitle}>Τωρινή Κατάσταση</h3>
            </div>
            <div className="reno-conditions" style={rs.conditionGrid}>
              {CONDITIONS.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  aria-pressed={formData.condition === c.value}
                  onClick={() => setField('condition', c.value)}
                  style={{ ...rs.conditionCard, ...(formData.condition === c.value ? rs.conditionCardActive : {}) }}
                >
                  <span style={rs.conditionTitle}>{c.title}</span>
                  <span style={rs.conditionDesc}>{c.desc}</span>
                </button>
              ))}
            </div>
          </div>

          <hr style={styles.divider} />

          <div style={styles.sectionBlock}>
            <div style={styles.sectionHeader}>
              <ImageIcon size={18} color="#0F766E" />
              <h3 style={styles.sectionTitle}>Φωτογραφίες (AI Διάγνωση)</h3>
            </div>
            <ImageDropzone
              images={images}
              previews={previews}
              onFilesAdded={handleFilesAdded}
              onRemoveImage={handleRemoveImage}
            />
            <span style={rs.hint}>
              Με φωτογραφίες, το AI εντοπίζει τις εργασίες που χρειάζονται και υπερισχύει της κατάστασης που δηλώσατε. Έως 10 εικόνες.
            </span>
          </div>

          <hr style={styles.divider} />

          <div style={styles.sectionBlock}>
            <div style={styles.sectionHeader}>
              <Wallet size={18} color="#0F766E" />
              <h3 style={styles.sectionTitle}>Οικονομικά (προαιρετικά)</h3>
            </div>
            <div style={styles.grid2}>
              {numberField('budget', 'Διαθέσιμος προϋπολογισμός (€)', 'π.χ. 25000')}
              {numberField('years_vacant', 'Χρόνια που είναι κλειστό', 'π.χ. 5')}
            </div>
            <div style={styles.field}>
              <label style={styles.label}>Φορολογικός συντελεστής ενοικίων</label>
              <select name="tax_rate" value={formData.tax_rate} onChange={handleChange} style={styles.selectInput}>
                {TAX_RATES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
            <div
              onClick={() => setField('use_subsidy', !formData.use_subsidy)}
              style={{ ...styles.pill, justifyContent: 'flex-start', ...(formData.use_subsidy ? styles.pillActive : {}) }}
            >
              <Landmark size={16} />
              <span>Υπολογισμός με επιδότηση ανακαίνισης (40%, έως €10.000)</span>
            </div>
          </div>

          <div style={styles.actionsRow}>
            <button type="submit" disabled={loading} style={styles.submitBtn}>
              {loading ? (
                <><Loader2 size={18} className="spin" /> {images.length > 0 ? 'Ανάλυση φωτογραφιών...' : 'Υπολογισμός...'}</>
              ) : (
                <><Hammer size={18} /> Υπολόγισε το ROI</>
              )}
            </button>
            <button type="button" onClick={handleClear} style={styles.clearBtn} title="Επαναφορά φόρμας">
              <RotateCcw size={16} />
              <span>Clear</span>
            </button>
          </div>
        </form>

        {!result && (
          <div style={styles.previewColumn}>
            <div style={styles.previewHeroCard}>
              <h3 style={styles.previewHeroTitle}>Τι θα μάθετε</h3>
              <p style={styles.previewHeroText}>
                Συγκρίνουμε τρία σενάρια ανακαίνισης με βάση το κόστος εργασιών στην Αθήνα και τα πραγματικά
                ενοίκια της γειτονιάς σας.
              </p>
              <div style={styles.featureCardsList}>
                <div style={styles.featureCardItem}>
                  <div style={styles.featureCardIcon}><Wallet size={18} color="#0F766E" /></div>
                  <div>
                    <div style={styles.featureCardTitle}>Κόστος & ενοίκιο ανά σενάριο</div>
                    <p style={styles.featureCardDesc}>Από στοχευμένες επεμβάσεις έως premium επιπλωμένο, με αναλυτικό κόστος ανά εργασία.</p>
                  </div>
                </div>
                <div style={styles.featureCardItem}>
                  <div style={styles.featureCardIcon}><TrendingUp size={18} color="#0F766E" /></div>
                  <div>
                    <div style={styles.featureCardTitle}>Απόσβεση & αύξηση αξίας</div>
                    <p style={styles.featureCardDesc}>Σε πόσο καιρό γυρίζουν πίσω τα χρήματα και πόσο ανεβαίνει η αξία του ακινήτου.</p>
                  </div>
                </div>
                <div style={styles.featureCardItem}>
                  <div style={styles.featureCardIcon}><Hourglass size={18} color="#0F766E" /></div>
                  <div>
                    <div style={styles.featureCardTitle}>Κόστος αδράνειας</div>
                    <p style={styles.featureCardDesc}>Πόσα χάνετε κάθε μήνα που το ακίνητο μένει κλειστό.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {result && recommended && (
          <div style={styles.resultsColumn}>
            <div style={styles.resultsWrapper}>
              <div style={styles.mainEstimateCard}>
                <div style={styles.cardHeaderRow}>
                  <span style={styles.mainEstimateLabel}>
                    <KeyRound size={14} style={{ marginRight: '4px' }} /> ΠΡΟΤΕΙΝΟΜΕΝΟ ΣΕΝΑΡΙΟ
                  </span>
                  <span style={styles.accuracyTag}>{recommended.name}</span>
                </div>
                <p style={rs.heroSentence}>
                  Με <span style={rs.heroHighlight}>{formatEuro(recommended.net_cost)}</span> ανακαίνιση, το ακίνητο
                  νοικιάζεται <span style={rs.heroHighlight}>{formatEuro(recommended.monthly_rent)}/μήνα</span> και
                  αποσβένεται σε <span style={rs.heroHighlight}>{formatYears(recommended.payback_years)}</span>.
                </p>
                <div className="reno-hero-stats" style={rs.heroStatsRow}>
                  <div style={rs.heroStat}>
                    <span style={rs.heroStatLabel}>ΚΑΘΑΡΑ / ΜΗΝΑ</span>
                    <span style={rs.heroStatValue}>{formatEuro(recommended.monthly_net)}</span>
                  </div>
                  <div style={rs.heroStat}>
                    <span style={rs.heroStatLabel}>ΚΕΡΔΟΣ 10ΕΤΙΑΣ</span>
                    <span style={rs.heroStatValue}>{formatEuro(recommended.profit_10y)}</span>
                  </div>
                  <div style={rs.heroStat}>
                    <span style={rs.heroStatLabel}>ΑΥΞΗΣΗ ΑΞΙΑΣ</span>
                    <span style={rs.heroStatValue}>+{formatEuro(recommended.value_uplift)}</span>
                  </div>
                </div>
              </div>

              <div style={rs.inactionCard}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.4rem' }}>
                  <Hourglass size={16} />
                  <strong style={{ fontSize: '0.88rem' }}>Το κόστος του να μένει κλειστό</strong>
                </div>
                <div style={rs.inactionNumber}>{formatEuro(result.inaction.monthly_lost)} / μήνα</div>
                <p style={{ fontSize: '0.82rem', margin: '0.35rem 0 0', lineHeight: 1.45 }}>
                  Τόσο καθαρό εισόδημα χάνετε κάθε μήνα, ακόμα και με τις πιο απλές επεμβάσεις.
                  {result.inaction.lost_so_far ? (
                    <> Στα {result.inaction.years_vacant} χρόνια που είναι κλειστό, αυτό αντιστοιχεί σε περίπου{' '}
                      <strong>{formatEuro(result.inaction.lost_so_far)}</strong> χαμένα έσοδα.</>
                  ) : null}
                </p>
              </div>

              <RenovationDiagnosisCard
                vision={result.vision}
                conditionLabel={result.condition_label}
                detectedNeeds={result.detected_needs}
              />

              <div style={styles.infoCard}>
                <div style={styles.cardHeaderFlex}>
                  <Home size={16} color="#0F766E" />
                  <h4 style={styles.infoCardTitle}>Αν το νοικιάζατε όπως είναι</h4>
                </div>
                <p style={{ fontSize: '0.84rem', color: '#52606B', margin: 0, lineHeight: 1.5 }}>
                  {result.as_is.rentable ? (
                    <>Εκτιμώμενο ενοίκιο <strong>{formatEuro(result.as_is.monthly_rent)}/μήνα</strong>. Η προτεινόμενη
                      ανακαίνιση το ανεβάζει κατά <strong>{formatEuro(recommended.rent_uplift_vs_as_is)}/μήνα</strong>.</>
                  ) : (
                    <>Στην τωρινή του κατάσταση το ακίνητο <strong>δεν είναι ρεαλιστικά νοικιάσιμο</strong> — χρειάζεται
                      τουλάχιστον τις απαραίτητες εργασίες.</>
                  )}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {result && selected && (
        <div style={rs.fullWidthSection}>
          <div>
            <h2 style={rs.sectionHeading}>Σύγκριση σεναρίων</h2>
            <p style={rs.sectionSub}>Επιλέξτε σενάριο για να δείτε την αναλυτική κοστολόγηση.</p>
          </div>

          <div className="reno-scenarios" style={rs.scenarioGrid}>
            {result.scenarios.map((s) => (
              <ScenarioCard key={s.key} scenario={s} selected={s.key === selectedKey} onSelect={setSelectedKey} />
            ))}
          </div>

          <CashflowChart scenarios={result.scenarios} />

          <div className="reno-twocol" style={rs.twoCol}>
            <CostBreakdown scenario={selected} />

            <div style={styles.infoCard}>
              <div style={styles.cardHeaderFlex}>
                <Info size={16} color="#0F766E" />
                <h4 style={styles.infoCardTitle}>Πώς υπολογίστηκε</h4>
              </div>
              <ul style={rs.assumptionList}>
                <li>Ενοίκιο βάσης από το ML μοντέλο μας για {cleanName(formData.suburb) || 'την περιοχή'}.</li>
                <li>
                  Ανακαινισμένα ακίνητα σε παλιά κτίρια νοικιάζονται +{result.assumptions.renovation_premium_pct}% και
                  τα επιπλωμένα επιπλέον +{result.assumptions.furnished_premium_pct}% (διάμεσοι από τις αγγελίες).
                </li>
                <li>
                  {result.assumptions.vacancy_months} μήνας κενός τον χρόνο, {result.assumptions.maintenance_pct}% συντήρηση,
                  φόρος {result.assumptions.tax_rate_pct}%, αύξηση ενοικίων {result.assumptions.rent_growth_pct}% τον χρόνο.
                </li>
                <li>Απρόβλεπτα {result.assumptions.contingency_pct}% πάνω στο κόστος εργασιών.</li>
                <li>
                  Αύξηση αξίας: η επιπλέον ετήσια μίσθωση κεφαλαιοποιημένη με απόδοση {result.assumptions.gross_yield_pct.toLocaleString('el-GR')}%
                  (η επίπλωση εξαιρείται).
                </li>
                {result.assumptions.subsidy.enabled && (
                  <li>
                    Επιδότηση {result.assumptions.subsidy.rate_pct}% έως {formatEuro(result.assumptions.subsidy.cap)} —
                    ελέγξτε την επιλεξιμότητα στα τρέχοντα προγράμματα (π.χ. «Ανακαινίζω – Νοικιάζω»).
                  </li>
                )}
              </ul>
              <p style={{ ...rs.hint, marginTop: '0.75rem', marginBottom: 0 }}>
                Οι τιμές είναι ενδεικτικές. Για ακριβές κόστος ζητήστε προσφορές από συνεργεία.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
