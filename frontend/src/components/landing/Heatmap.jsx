export default function Heatmap() {

return(

<div style={styles.card}>

<div style={styles.header}>

Χάρτης Τιμών Αθήνας

</div>

<div style={styles.map}>

<p style={styles.text}>

Εδώ θα εμφανιστεί ο διαδραστικός χάρτης
με τις τιμές των ενοικίων.

</p>

</div>

</div>

)

}

const styles={

card:{

width:"100%",

maxWidth:"500px",

background:"white",

borderRadius:"18px",

overflow:"hidden",

boxShadow:"0 15px 35px rgba(0,0,0,.08)"

},

header:{

padding:"18px",

fontWeight:"700",

borderBottom:"1px solid #eee"

},

map:{

height:"420px",

display:"flex",

justifyContent:"center",

alignItems:"center",

background:"#EDF6F9"

},

text:{

color:"#555",

padding:"40px",

textAlign:"center"

}

}