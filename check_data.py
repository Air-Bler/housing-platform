import pandas as pd

csv_path = "frontend/public/data/cleaned_properties.csv"

try:
    df = pd.read_csv(csv_path)

    #  Καθαρισμός ονόματος γειτονιάς 
    df['clean_suburb'] = df['suburb'].astype(str).str.split('(').str[0].str.split('-').str[0].str.strip()

    #  Υπολογισμός price_per_sqm 
    if 'price_per_sqm' not in df.columns:
        df['price_per_sqm'] = df['price'] / df['sqm']


    valid_df = df[
        (df['clean_suburb'].notnull()) & 
        (df['price_per_sqm'] > 2) & 
        (df['price_per_sqm'] < 50)
    ]

    #  Ομαδοποίηση ανά γειτονιά: Πλήθος αγγελιών & Μέσος Όρος €/m²
    stats = valid_df.groupby('clean_suburb').agg(
        αγγελίες=('price_per_sqm', 'count'),
        μέσο_ενοίκιο_sqm=('price_per_sqm', 'mean')
    ).reset_index()

    # Στρογγυλοποίηση μέσου όρου σε 1 δεκαδικό
    stats['μέσο_ενοίκιο_sqm'] = stats['μέσο_ενοίκιο_sqm'].round(1)

    # Ταξινόμηση κατά φθίνουσα σειρά μέσου ενοικίου
    stats = stats.sort_values(by='μέσο_ενοίκιο_sqm', ascending=False)

    print("\n" + "="*65)
    print(f"  ΣΥΝΟΛΙΚΗ ΑΝΑΛΥΣΗ {len(stats)} ΓΕΙΤΟΝΙΩΝ ΑΘΗΝΑΣ & ΑΤΤΙΚΗΣ")
    print("="*65)
    
    
    pd.set_option('display.max_rows', None)
    pd.set_option('display.width', 1000)

    print(stats.to_string(index=False, header=['Γειτονιά', 'Αγγελίες', 'Μέσο €/m²']))
    print("="*65 + "\n")

except FileNotFoundError:
    print(f"\n Σφάλμα: Δεν βρέθηκε το αρχείο στη διαδρομή '{csv_path}'.")