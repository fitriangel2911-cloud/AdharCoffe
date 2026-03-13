from backend.database import get_supabase
import json

def check():
    try:
        sb = get_supabase()
        print("Checking tables...")
        
        # Check transaksi
        try:
            res = sb.table("transaksi").select("*").limit(1).execute()
            print("Table 'transaksi' exists.")
        except Exception as e:
            print(f"Table 'transaksi' error: {e}")
            
        # Check pengeluaran
        try:
            res = sb.table("pengeluaran").select("*").limit(1).execute()
            print("Table 'pengeluaran' exists.")
            if res.data:
                print(f"Data sample: {json.dumps(res.data[0])}")
            else:
                print("Table 'pengeluaran' is empty.")
        except Exception as e:
            print(f"Table 'pengeluaran' error: {e}")
            
    except Exception as e:
        print(f"General error: {e}")

if __name__ == "__main__":
    check()
