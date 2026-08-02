import pandas as pd
import numpy as np


df = pd.read_csv("data/processed/cleaned_properties.csv")

print(" --- ΕΛΕΓΧΟΣ ΟΡΘΟΤΗΤΑΣ ΑΠΟΣΤΑΣΕΩΝ ΜΕΤΡΟ --- \n")


print(" ΣΤΑΤΙΣΤΙΚΑ ΑΠΟΣΤΑΣΗΣ (σε μέτρα):")
print(f" Ελάχιστη απόσταση: {df['metro_distance_m'].min()}m")
print(f" Διάμεσος (Median): {df['metro_distance_m'].median():.0f}m")
print(f" Μέση τιμή (Mean):   {df['metro_distance_m'].mean():.0f}m")
print(f" Μέγιστη απόσταση: {df['metro_distance_m'].max()}m")


negative_dist = df[df['metro_distance_m'] < 0]
too_far = df[df['metro_distance_m'] > 15000] 

print("\n ΕΛΕΓΧΟΣ ΑΚΡΑΙΩΝ ΤΙΜΩΝ:")
if len(negative_dist) == 0:
    print(" Καμία αρνητική απόσταση.")
else:
    print(f" Βρέθηκαν {len(negative_dist)} αρνητικές τιμές!")

if len(too_far) == 0:
    print("Όλες οι αποστάσεις είναι εντός λογικών ορίων Αττικής (<15km).")
else:
    print(f" Βρέθηκαν {len(too_far)} ακίνητα με απόσταση >15km από Μετρό.")


print("\n ΜΕΣΗ ΑΠΟΣΤΑΣΗ ΜΕΤΡΟ ΑΝΑ ΠΕΡΙΟΧΗ (Δείγμα):")
sample_suburbs = df.groupby('suburb')['metro_distance_m'].mean().round().astype(int).reset_index()
print(sample_suburbs.sort_values(by='metro_distance_m').head(10).to_string(index=False))