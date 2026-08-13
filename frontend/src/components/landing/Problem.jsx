import React from "react";
import { TriangleAlert, Compass } from "lucide-react";

export default function Problem() {
  return (
    <section style={styles.section}>
      <div style={styles.container}>

        <div style={styles.header}>
          <span style={styles.eyebrow}>
            ΤΟ ΠΡΟΒΛΗΜΑ
          </span>

          <h2 style={styles.title}>
            Η στεγαστική κρίση της Αθήνας
            <br />
            δεν είναι μόνο θέμα τιμών.
          </h2>

          <p style={styles.subtitle}>
            Χιλιάδες κατοικίες παραμένουν κλειστές, ενώ η ζήτηση
            για διαθέσιμα σπίτια αυξάνεται. Το αποτέλεσμα είναι
            μια αγορά που γίνεται όλο και πιο δύσκολη για όσους
            ψάχνουν σπίτι.
          </p>
        </div>

        <div style={styles.grid}>

          {/* Η ΠΡΟΚΛΗΣΗ */}

          <div style={styles.column}>
            <TriangleAlert size={26} color="#B33F30" strokeWidth={2} style={styles.icon} />

            <div style={styles.label}>
              Η ΠΡΟΚΛΗΣΗ
            </div>

            <h3 style={styles.cardTitle}>
              Πολλά σπίτια μένουν εκτός αγοράς.
            </h3>

            <p style={styles.cardText}>
              Κλειστές και αναξιοποίητες κατοικίες συνυπάρχουν
              με μια αυξανόμενη ανάγκη για διαθέσιμη στέγαση.
            </p>

            <p style={styles.cardText}>
              Παράλληλα, η εικόνα της αγοράς διαφέρει σημαντικά
              από γειτονιά σε γειτονιά και δεν είναι πάντα εύκολο
              να γίνει κατανοητή.
            </p>
          </div>

          {/* Η ΠΡΟΣΕΓΓΙΣΗ ΜΑΣ */}

          <div style={{ ...styles.column, ...styles.columnDivider }}>
            <Compass size={26} color="#0F766E" strokeWidth={2} style={styles.icon} />

            <div style={styles.labelSolution}>
              Η ΠΡΟΣΕΓΓΙΣΗ ΜΑΣ
            </div>

            <h3 style={styles.cardTitle}>
              Κάνουμε την αγορά πιο κατανοητή.
            </h3>

            <p style={styles.cardText}>
              Συγκεντρώνουμε πραγματικά δεδομένα από την αγορά
              ακινήτων και τα μετατρέπουμε σε χρήσιμη πληροφορία
              για κάθε γειτονιά.
            </p>

            <p style={styles.cardText}>
              Έτσι βοηθάμε ενοικιαστές και ιδιοκτήτες να βλέπουν
              την πραγματική εικόνα της αγοράς και να παίρνουν
              πιο ενημερωμένες αποφάσεις.
            </p>
          </div>

        </div>

      </div>
    </section>
  );
}

const styles = {
  section: {
    background: "#F2F7F8",
    padding: "75px 30px",
  },

  container: {
    maxWidth: "1150px",
    margin: "0 auto",
  },

  header: {
    maxWidth: "760px",
    marginBottom: "48px",
  },

  eyebrow: {
    display: "inline-block",
    color: "#0F766E",
    fontSize: "12px",
    fontWeight: 800,
    letterSpacing: "0.12em",
    marginBottom: "12px",
  },

  title: {
    fontFamily: "'Fraunces', Georgia, serif",
    fontSize: "38px",
    lineHeight: 1.15,
    fontWeight: 800,
    color: "#16212B",
    margin: "0 0 16px 0",
  },

  subtitle: {
    fontSize: "17px",
    lineHeight: 1.65,
    color: "#667085",
    margin: 0,
    maxWidth: "700px",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 0,
  },

  column: {
    paddingRight: "44px",
  },

  columnDivider: {
    paddingRight: 0,
    paddingLeft: "44px",
    borderLeft: "1px solid #D9E2E0",
  },

  icon: {
    marginBottom: "16px",
  },

  label: {
    color: "#B33F30",
    fontSize: "11px",
    fontWeight: 800,
    letterSpacing: "0.1em",
    marginBottom: "8px",
  },

  labelSolution: {
    color: "#0F766E",
    fontSize: "11px",
    fontWeight: 800,
    letterSpacing: "0.1em",
    marginBottom: "8px",
  },

  cardTitle: {
    fontFamily: "'Fraunces', Georgia, serif",
    fontSize: "24px",
    lineHeight: 1.25,
    fontWeight: 700,
    color: "#16212B",
    margin: "0 0 14px 0",
  },

  cardText: {
    fontSize: "15px",
    lineHeight: 1.65,
    color: "#667085",
    margin: "0 0 12px 0",
  },
};