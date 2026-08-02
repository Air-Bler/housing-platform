import pandas as pd


df = pd.read_csv("data/processed/cleaned_properties.csv")

print("==========================================")
print(f" ΣΥΝΟΛΙΚΕΣ ΕΓΓΡΑΦΕΣ: {len(df)}")
print("==========================================\n")

#  Αναλυτικός πίνακας ανά περιοχή (Πλήθος, Μέση Τιμή, Μέση Τιμή/τ.μ.)
area_stats = df.groupby('suburb').agg(
    Πλήθος_Αγγελιών=('price', 'count'),
    Μέσο_Ενοίκιο=('price', lambda x: f"€{round(x.mean()):,}"),
    Μέση_Τιμή_τμ=('price_per_sqm', lambda x: f"€{round(x.mean(), 1)}")
).reset_index()

# Ταξινόμηση κατά πλήθος αγγελιών 
area_stats = area_stats.sort_values(by='Πλήθος_Αγγελιών', ascending=False)

print(" ΚΑΤΑΝΟΜΗ ΑΓΓΕΛΙΩΝ ΑΝΑ ΠΕΡΙΟΧΗ:")
print(area_stats.to_string(index=False))

print("\n------------------------------------------")
print(f" Συνολικά καλύπτονται {df['suburb'].nunique()} διαφορετικές περιοχές.")