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
- PapaParse για ανάγνωση του [`public/data/cleaned_properties.csv`](public/data/cleaned_properties.csv)
- lucide-react για τα εικονίδια

## Εκκίνηση

Χρειάζεσαι Node.js (18+) και το backend να τρέχει στο `http://127.0.0.1:8000`.

### 1. Backend

Από τη ρίζα του repo:

```bash
uv sync
uv add python-dotenv openai pandas numpy joblib scikit-learn python-multipart   
uvicorn backend.app.main:app --reload
```

Για την ανάλυση φωτογραφιών χρειάζεται `OPENAI_API_KEY` στο αρχείο `.env` στη ρίζα του repo:

```
OPENAI_API_KEY=sk-...
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

Η διεύθυνση του backend (`http://127.0.0.1:8000`) είναι γραμμένη απευθείας στα αρχεία των σελίδων.

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
