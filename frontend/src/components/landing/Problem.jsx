import React from "react";

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

          {/* PROBLEM CARD */}

          <div style={styles.problemCard}>

            <div style={styles.problemLine}></div>

            <div>
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

          </div>


          {/* SOLUTION CARD */}

          <div style={styles.solutionCard}>

            <div style={styles.solutionLine}></div>

            <div>
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
    marginBottom: "38px",
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
    gap: "20px",
  },

  /* ΚΟΚΚΙΝΟ CARD */

  problemCard: {
    position: "relative",
    display: "flex",
    gap: "18px",
    padding: "28px",
    paddingLeft: "33px",
    background: "#FFFDFC",
    border: "1px solid #E9D9D4",
    borderRadius: "20px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.04)",
    overflow: "hidden",
  },

  problemLine: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: "5px",
    background: "#E8AAA3",
  },

  /* ΠΡΑΣΙΝΟ CARD */

  solutionCard: {
    position: "relative",
    display: "flex",
    gap: "18px",
    padding: "28px",
    paddingLeft: "33px",
    background: "#FFFFFF",
    border: "1px solid #D5E5E1",
    borderRadius: "20px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.04)",
    overflow: "hidden",
  },

  solutionLine: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: "5px",
    background: "#9BC7B5",
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
    fontSize: "22px",
    lineHeight: 1.25,
    fontWeight: 800,
    color: "#16212B",
    margin: "0 0 14px 0",
  },

  cardText: {
    fontSize: "15px",
    lineHeight: 1.6,
    color: "#667085",
    margin: "0 0 9px 0",
  },
};