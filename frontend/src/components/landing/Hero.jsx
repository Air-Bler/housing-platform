import { Link } from "react-router-dom";
import { Calculator, Hammer } from "lucide-react";

export default function Hero() {
  return (
    <section style={styles.hero}>
      <div style={styles.left}>

        <div style={styles.badge}>
          Live δεδομένα αγοράς • Αθήνα
        </div>

        <h1 style={styles.title}>
          Βρες το
          <br />
          πραγματικά
          <br />
          δίκαιο ενοίκιο.
        </h1>

        <p style={styles.text}>
          Το StegiAthens χρησιμοποιεί πραγματικά δεδομένα
          αγγελιών και χαρακτηριστικών της γειτονιάς ώστε να
          υπολογίζει την πραγματική αξία ενός ενοικίου.
        </p>

        <div style={styles.buttons}>

          <Link to="/estimator" style={styles.primary}>
            <Calculator size={18}/>
            Υπολογισμός Ενοικίου
          </Link>

          <Link to="/renovation" style={styles.secondary}>
            <Hammer size={18}/>
            ROI Ανακαίνισης
          </Link>

        </div>

      </div>

      <div style={styles.right}>

        <img
          src="/athens-map.png"
          alt="Athens"
          style={styles.image}
        />

      </div>

    </section>
  );
}

const styles = {

hero:{
display:"grid",
gridTemplateColumns:"1fr 1fr",
gap:"60px",
alignItems:"center",
maxWidth:"1250px",
margin:"0 auto",
padding:"90px 30px"
},

left:{
display:"flex",
flexDirection:"column"
},

badge:{
display:"inline-block",
background:"#EEF5FF",
padding:"8px 16px",
borderRadius:"30px",
fontWeight:600,
marginBottom:"25px",
width:"fit-content"
},

title:{
fontSize:"64px",
fontWeight:800,
lineHeight:1.05,
marginBottom:"25px"
},

text:{
fontSize:"19px",
lineHeight:1.8,
color:"#555",
maxWidth:"520px"
},

buttons:{
display:"flex",
gap:"15px",
marginTop:"40px"
},

primary:{
display:"flex",
alignItems:"center",
gap:"8px",
background:"#0F766E",
color:"white",
padding:"16px 28px",
borderRadius:"12px",
textDecoration:"none"
},

secondary:{
display:"flex",
alignItems:"center",
gap:"8px",
background:"white",
color:"#222",
padding:"16px 28px",
borderRadius:"12px",
border:"1px solid #ddd",
textDecoration:"none"
},

right:{
display:"flex",
justifyContent:"center"
},

image:{
width:"100%",
maxWidth:"520px",
borderRadius:"20px",
boxShadow:"0 20px 60px rgba(0,0,0,.12)"
}

};