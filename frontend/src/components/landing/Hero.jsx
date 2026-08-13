import { Link } from "react-router-dom";
import { Calculator, Hammer } from "lucide-react";
import Heatmap from "./Heatmap";

export default function Hero() {
  return (
    <section style={styles.hero}>
      <div style={styles.left}>
        <h1 style={styles.title}>
          Ό,τι χρειάζεσαι
          <br />
          για να πάρεις σωστές αποφάσεις για τα
          <br />
         ακίνητα στην Αθήνα.
        </h1>

        <p style={styles.text}>
          Η ραγδαία αύξηση των ενοικίων και τα χιλιάδες κλειστά ακίνητα έχουν δημιουργήσει αδιέξοδο στην Αθήνα.
          Φτιάξαμε ένα εργαλείο το οποίο δείχνει στους ενοικιαστές αν πληρώνουν όσο πρέπει, και στους ιδιοκτήτες
          αν αξίζει να ανακαινίσουν ή να πουλήσουν.
        </p>

        <div style={styles.buttons}>
          <Link to="/estimator" style={styles.primary}>
            <Calculator size={18} />
            Υπολογισμός Ενοικίου
          </Link>

          <Link to="/renovation" style={styles.secondary}>
            <Hammer size={18} />
            ROI Ανακαίνισης
          </Link>
        </div>
      </div>

      <div style={styles.right}>
        <Heatmap />
      </div>
    </section>
  );
}

const styles = {
  hero: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "60px",
    alignItems: "center",
    maxWidth: "1250px",
    margin: "0 auto",
    padding: "36px 30px 50px",
  },

  left: {
    display: "flex",
    flexDirection: "column",
  },

  badge: {
    display: "inline-block",
    background: "#EEF5FF",
    padding: "8px 16px",
    borderRadius: "30px",
    fontWeight: 600,
    marginBottom: "18px",
    width: "fit-content",
  },

  title: {
    fontFamily: "'Fraunces', Georgia, serif",
    fontSize: "50px",
    fontWeight: 800,
    lineHeight: 1.08,
    marginBottom: "18px",
  },

  text: {
    fontSize: "18px",
    lineHeight: 1.65,
    color: "#555",
    maxWidth: "520px",
  },

  buttons: {
    display: "flex",
    gap: "15px",
    marginTop: "24px",
    flexWrap: "wrap",
  },

  primary: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    background: "#0F766E",
    color: "white",
    padding: "16px 28px",
    borderRadius: "12px",
    textDecoration: "none",
  },

  secondary: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    background: "white",
    color: "#222",
    padding: "16px 28px",
    borderRadius: "12px",
    border: "1px solid #ddd",
    textDecoration: "none",
  },

  right: {
    width: "100%",
  },
};