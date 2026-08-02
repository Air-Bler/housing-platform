import pandas as pd
import glob
import os


RAW_DATA_PATH = "data/raw"
OUTPUT_FILE = os.path.join(RAW_DATA_PATH, "properties.csv")

def merge_csv_files():
    
    csv_files = glob.glob(f"{RAW_DATA_PATH}/*.csv")
    
    
    csv_files = [
        f for f in csv_files 
        if not f.endswith("properties.csv") and not f.endswith("metro.csv")
    ]
    
    if not csv_files:
        print(" Δεν βρέθηκαν αρχεία CSV στον φάκελο data/raw/")
        return

    print(f" Βρέθηκαν {len(csv_files)} CSV αρχεία. Έναρξη ένωσης...")

    df_list = []
    for file in csv_files:
        try:
            df = pd.read_csv(file)
            df_list.append(df)
            print(f"  └─ Φορτώθηκε το {os.path.basename(file)} ({len(df)} εγγραφές)")
        except Exception as e:
            print(f"  └─ Σφάλμα στην ανάγνωση του {file}: {e}")

    
    merged_df = pd.concat(df_list, ignore_index=True)
    initial_count = len(merged_df)

    # Αφαίρεση διπλότυπων βάσει του μοναδικού ID της αγγελίας 
    if 'id' in merged_df.columns:
        merged_df = merged_df.drop_duplicates(subset=['id'])
    else:
        merged_df = merged_df.drop_duplicates()

    final_count = len(merged_df)

   
    merged_df.to_csv(OUTPUT_FILE, index=False)
    
    print("\n Η διαδικασία ολοκληρώθηκε!")
    print(f" Αρχικές εγγραφές: {initial_count}")
    print(f" Μετά την αφαίρεση διπλότυπων: {final_count}")
    print(f"Το τελικό αρχείο αποθηκεύτηκε στο: {OUTPUT_FILE}")

if __name__ == "__main__":
    merge_csv_files()