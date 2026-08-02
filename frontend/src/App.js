import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [suburbs, setSuburbs] = useState([]);
  const [formData, setFormData] = useState({
    sqm: 60,
    bedrooms: 1,
    bathrooms: 1,
    floor: 2,
    year_built: 1995,
    suburb: '',
    elevator: true,
    renovated: false,
    furnished: false,
    parking: false,
    user_asking_price: ''
  });

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch('http://127.0.0.1:8000/api/suburbs')
      .then((res) => res.json())
      .then((data) => {
        if (data.suburbs && data.suburbs.length > 0) {
          setSuburbs(data.suburbs);
          setFormData((prev) => ({ ...prev, suburb: data.suburbs[0] }));
        }
      })
      .catch((err) => console.error("Error fetching suburbs:", err));
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      ...formData,
      sqm: parseFloat(formData.sqm),
      bedrooms: parseInt(formData.bedrooms),
      bathrooms: parseInt(formData.bathrooms),
      floor: parseInt(formData.floor),
      year_built: parseInt(formData.year_built),
      user_asking_price: formData.user_asking_price ? parseFloat(formData.user_asking_price) : null
    };

    fetch('http://127.0.0.1:8000/api/predict', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
      .then((res) => res.json())
      .then((data) => {
        setResult(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Prediction error:", err);
        setLoading(false);
      });
  };

  return (
    <div style={{ maxWidth: '900px', margin: '30px auto', fontFamily: 'Arial, sans-serif', padding: '0 20px' }}>
      <h2>🏡 Real Estate Rent Estimator & Analytics AI</h2>
      <p style={{ color: '#666' }}>Υπολογισμός εμπορικής αξίας, Value Score & Ανάλυση Ακινήτου</p>

      {/* ΦΟΡΜΑ ΕΙΣΑΓΩΓΗΣ */}
      <form onSubmit={handleSubmit} style={{ background: '#f8f9fa', padding: '25px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
        <div style={{ marginBottom: '15px' }}>
          <label><b>Περιοχή:</b></label>
          <select name="suburb" value={formData.suburb} onChange={handleChange} style={{ width: '100%', padding: '10px', marginTop: '5px', borderRadius: '6px' }}>
            {suburbs.map((sub, idx) => (
              <option key={idx} value={sub}>{sub}</option>
            ))}
          </select>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px', marginBottom: '15px' }}>
          <div>
            <label>Τετραγωνικά (m²):</label>
            <input type="number" name="sqm" value={formData.sqm} onChange={handleChange} style={{ width: '100%', padding: '8px', marginTop: '5px' }} />
          </div>
          <div>
            <label>Υπνοδωμάτια:</label>
            <input type="number" name="bedrooms" value={formData.bedrooms} onChange={handleChange} style={{ width: '100%', padding: '8px', marginTop: '5px' }} />
          </div>
          <div>
            <label>Μπάνια:</label>
            <input type="number" name="bathrooms" value={formData.bathrooms} onChange={handleChange} style={{ width: '100%', padding: '8px', marginTop: '5px' }} />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px', marginBottom: '15px' }}>
          <div>
            <label>Όροφος:</label>
            <input type="number" name="floor" value={formData.floor} onChange={handleChange} style={{ width: '100%', padding: '8px', marginTop: '5px' }} />
          </div>
          <div>
            <label>Έτος Κατασκευής:</label>
            <input type="number" name="year_built" value={formData.year_built} onChange={handleChange} style={{ width: '100%', padding: '8px', marginTop: '5px' }} />
          </div>
          <div>
            <label>Ζητούμενο Ενοίκιο (€) - Optional:</label>
            <input type="number" name="user_asking_price" placeholder="π.χ. 650" value={formData.user_asking_price} onChange={handleChange} style={{ width: '100%', padding: '8px', marginTop: '5px', borderColor: '#007bff' }} />
          </div>
        </div>

        {/* CHECKBOXES */}
        <div style={{ display: 'flex', gap: '20px', margin: '20px 0', flexWrap: 'wrap' }}>
          <label><input type="checkbox" name="elevator" checked={formData.elevator} onChange={handleChange} />  Ασανσέρ</label>
          <label><input type="checkbox" name="renovated" checked={formData.renovated} onChange={handleChange} />  Ανακαινισμένο</label>
          <label><input type="checkbox" name="furnished" checked={formData.furnished} onChange={handleChange} />  Επιπλωμένο</label>
          <label><input type="checkbox" name="parking" checked={formData.parking} onChange={handleChange} />  Parking</label>
        </div>

        <button type="submit" disabled={loading} style={{ background: '#007bff', color: '#fff', border: 'none', padding: '12px 25px', borderRadius: '6px', fontSize: '16px', cursor: 'pointer', width: '100%' }}>
          {loading ? ' Υπολογισμός...' : ' Υπολογισμός Εκτίμησης & Analytics'}
        </button>
      </form>

      {/* ΑΠΟΤΕΛΕΣΜΑΤΑ & ANALYTICS */}
      {result && (
        <div style={{ marginTop: '30px', background: '#eef7ff', padding: '25px', borderRadius: '12px', border: '1px solid #bce0fd' }}>
          <h3> Εκτιμώμενο Ενοίκιο: €{result.estimated_price} / μήνα</h3>
          <p> <b>Εύρος τιμής (±MAE):</b> €{result.price_min} - €{result.price_max}</p>
          <p> <b>Τιμή ανά τ.μ.:</b> €{result.price_per_sqm} / m²</p>
          <p>Απόσταση από πλησιέστερο Μετρό: ~{result.poi_distances?.metro_m} μέτρα</p> 

          <hr style={{ margin: '20px 0', borderColor: '#bce0fd' }} />

          {/* VALUE SCORE CARD */}
          <div style={{ background: '#fff', padding: '15px', borderRadius: '8px', marginBottom: '15px' }}>
            <h4>⭐ Value Score: {result.value_score} / 10</h4>
            <p style={{ fontWeight: 'bold', color: result.value_score >= 7.5 ? 'green' : 'orange' }}>{result.deal_type}</p>
          </div>

          {/* ΣΤΑΤΙΣΤΙΚΑ ΠΕΡΙΟΧΗΣ */}
          <div style={{ background: '#fff', padding: '15px', borderRadius: '8px', marginBottom: '15px' }}>
            <h4>Στατιστικά Περιοχής ({formData.suburb})</h4>
            <ul>
              <li>Μέσο Ενοίκιο Περιοχής: <b>€{result.suburb_stats.avg_price}</b></li>
              <li>Μέση Τιμή/τ.μ. Περιοχής: <b>€{result.suburb_stats.avg_price_per_sqm} / m²</b></li>
            </ul>
          </div>

         {/* 📍ΚΟΝΤΙΝΕΣ ΥΠΟΔΟΜΕΣ  */}
      {result.poi_distances && (
        <div style={{ background: '#f8f9fa', padding: '15px', borderRadius: '8px', marginBottom: '15px' }}>
          <h4>📍 Κοντινές Υποδομές & Αποστάσεις Περιοχής:</h4>
          <ul style={{ listStyleType: 'none', paddingLeft: 0 }}>
            <li>🚇 <strong>Μετρό / ΗΣΑΠ:</strong> ~{result.poi_distances.metro_m} μέτρα</li>
            <li>🎓 <strong>Πανεπιστήμια / Σχολές:</strong> ~{result.poi_distances.uni_m} μέτρα</li>
            <li>🏥 <strong>Νοσοκομεία / Υγεία:</strong> ~{result.poi_distances.hospital_m} μέτρα</li>
            <li>🌳 <strong>Πάρκα / Πράσινο:</strong> ~{result.poi_distances.park_m} μέτρα</li>
          </ul>
        </div>
      )}

      {/*   FAIR RENT EXPLAINABILITY */}
      {result.reasons && result.reasons.length > 0 && (
        <div style={{ background: '#fff', padding: '15px', borderRadius: '8px', border: '1px solid #e0e0e0' }}>
          <h4> Παράγοντες Διαμόρφωσης Τιμής (Fair Rent Logic)</h4>
          <ul style={{ listStyleType: 'none', paddingLeft: 0 }}>
            {result.reasons.map((r, idx) => (
              <li key={idx} style={{ color: r.type === 'positive' ? 'green' : 'red', marginBottom: '8px', fontWeight: '500' }}>
                {r.type === 'positive' ? '🟢 ' : '🔴 '}
                {r.text}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )}
</div>
);
}

export default App;