# Housing Platform — Frontend

Το frontend της πλατφόρμας αξιολόγησης ακινήτων για την Αθήνα. Βοηθά τους ενοικιαστές να δουν αν πληρώνουν δίκαιο ενοίκιο και τους ιδιοκτήτες να αποφασίσουν αν αξίζει να ανακαινίσουν ή να πουλήσουν.

Είναι εφαρμογή React (Create React App) που μιλά με το FastAPI backend στο [`../backend`](../backend).

## Σελίδες

| Διαδρομή | Σελίδα | Περιγραφή |
|---|---|---|
| `/` | [LandingPage](src/pages/LandingPage.jsx) | Αρχική σελίδα με heatmap τιμών και παρουσίαση των εργαλείων |
| `/estimator` | [EstimatorPage](src/pages/EstimatorPage.jsx) | Εκτίμηση ενοικίου με ML μοντέλο, ανάλυση φωτογραφιών και αποστάσεις από σημεία ενδιαφέροντος |
| `/renovation` | [RenovationPage](src/pages/RenovationPage.jsx) | ROI ανακαίνισης: διάγνωση από φωτογραφίες, σενάρια, κόστη και ταμειακές ροές |
| `/map`, `/prices`, `/heatmap` | [PriceMapPage](src/pages/PriceMapPage.jsx) | Διαδραστικός χάρτης τιμών, κατάταξη και σύγκριση περιοχών |

## Τεχνολογίες

- React 19, React Router 7
- Leaflet / react-leaflet για τους χάρτες
- lucide-react για τα εικονίδια

## Εκκίνηση

Χρειάζεσαι Node.js (18+) και το backend να τρέχει στο `http://127.0.0.1:8000`.

### 1. Backend

Από τη ρίζα του repo:

```bash
uv sync
uv run uvicorn backend.app.main:app --reload
```

Για την ανάλυση φωτογραφιών χρειάζεται `OPENAI_API_KEY` στο αρχείο `.env` στη ρίζα του repo:

```
OPENAI_API_KEY=sk-...
```

Προαιρετικές ρυθμίσεις στο ίδιο `.env`:

| Μεταβλητή | Προεπιλογή | Περιγραφή |
|---|---|---|
| `CORS_ORIGINS` | `http://localhost:3000,http://127.0.0.1:3000` | Origins του frontend που επιτρέπονται, χωρισμένα με κόμμα. Σε production βάλτε μόνο το domain του frontend. |
| `AI_ATTEMPT_TIMEOUT_S` | `30` | Όριο αναμονής για κάθε προσπάθεια κλήσης στο vision μοντέλο |
| `AI_MAX_RETRIES` | `1` | Επαναλήψεις σε σφάλματα δικτύου, timeouts, 408/409/429 και 5xx |
| `AI_TOTAL_DEADLINE_S` | `60` | Απόλυτο όριο αναμονής του χρήστη, μαζί με τις επαναλήψεις |
| `VISION_MODEL` | `gpt-4o` | Μοντέλο για την ανάλυση φωτογραφιών |
| `AI_PER_IP_LIMIT` / `AI_PER_IP_WINDOW_S` | `5` / `600` | Αναλύσεις φωτογραφιών ανά IP μέσα στο χρονικό παράθυρο |
| `AI_DAILY_LIMIT` | `200` | Συνολικές αναλύσεις φωτογραφιών ανά ημέρα (φρένο στο κόστος) |
| `DATA_PATH` | `backend/data/cleaned_properties.csv` | Το dataset αγγελιών |

Τα όρια χρήσης κρατιούνται στη μνήμη κάθε process. Με πολλούς workers ή servers χρειάζεται κοινός χώρος (π.χ. Redis). Πίσω από reverse proxy τρέξτε τον uvicorn με `--proxy-headers --forwarded-allow-ips=<IP του proxy>`, αλλιώς όλοι οι χρήστες μετρούν ως μία IP. Βάλτε επίσης όριο χρέωσης στον λογαριασμό OpenAI.

Όρια φωτογραφιών (ελέγχονται πριν από την κλήση AI): έως 6 εικόνες JPEG/PNG/WEBP, έως 8 MB η καθεμία, έως 25 MB συνολικά, διαστάσεις 64–8000 px. Σε production το ίδιο όριο μεγέθους request πρέπει να μπει και στον reverse proxy (π.χ. `client_max_body_size 26m` στο nginx).

### Δεδομένα, μοντέλο και metrics

Ο server **δεν ξεκινά** αν λείπει κάποιο από τα:

- `backend/data/cleaned_properties.csv`: αγγελίες από το Spitogatos. **Δεν μπαίνει στο git και δεν σερβίρεται στον browser.** Ανεβαίνει χωριστά στον server. Το frontend παίρνει μόνο συγκεντρωτικά στοιχεία από το API (`/api/city-stats`, `/api/heatmap-areas`, `/api/suburbs-stats`).
- `backend/models/price_model.pkl`
- `backend/models/model_metrics.json`

Το `model_metrics.json` περιέχει την ακρίβεια που εμφανίζει η εφαρμογή (μέσο σφάλμα, εύρος τιμής), μετρημένη σε αγγελίες που το μοντέλο δεν είδε στην εκπαίδευση. Ξαναδημιουργείται όταν αλλάζει το μοντέλο, τα δεδομένα ή η λογική της εκτίμησης:

```bash
uv run python -m backend.scripts.evaluate_model
```

Tests του backend:

```bash
uv run pytest
```

Η τεκμηρίωση του API είναι διαθέσιμη στο http://127.0.0.1:8000/docs.

### 2. Frontend

```bash
cd frontend
npm install
npm start
```

Η εφαρμογή ανοίγει στο http://localhost:3000.

## Endpoints που χρησιμοποιεί

| Μέθοδος | Endpoint | Σελίδα |
|---|---|---|
| `GET` | `/api/model-stats` | Estimator |
| `POST` | `/api/predict` | Estimator |
| `POST` | `/api/analyze-images` | Estimator |
| `GET` | `/api/suburbs-stats` | Price map |
| `POST` | `/api/renovation-roi` | Renovation |

Η διεύθυνση του backend ορίζεται στο [`src/api.js`](src/api.js) από τη μεταβλητή `REACT_APP_API_URL` (προεπιλογή `http://127.0.0.1:8000`).

Σε αποτυχία το backend απαντά με HTTP 4xx/5xx και σώμα `{"error": {"code", "message", "details"?, "request_id"}}`. Το `message` εμφανίζεται στον χρήστη, το `code` είναι σταθερό για χειρισμό στον κώδικα, και το `request_id` αντιστοιχεί στην εγγραφή του log στο backend.

## Δομή

```
src/
├── App.js                # Routing
├── pages/                # Μία σελίδα ανά διαδρομή
└── components/
    ├── Navbar.jsx
    ├── landing/          # Hero, Features, Heatmap, Footer και φόρτωση δεδομένων
    ├── estimator/        # Dropzone φωτογραφιών, ανάλυση εικόνων, αποστάσεις POI
    ├── pricemap/         # Χάρτης, κατάταξη, σύγκριση και πίνακας περιοχών
    └── renovation/       # Διάγνωση, σενάρια, ανάλυση κόστους, γράφημα ταμειακών ροών
```

## Scripts

| Εντολή | Περιγραφή |
|---|---|
| `npm start` | Development server με hot reload |
| `npm test` | Tests σε watch mode |
| `npm run build` | Production build στον φάκελο `build/` |
