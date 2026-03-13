from backend.database import get_supabase
import json

def check():
    try:
        sb = get_supabase()
        print("Checking tables...")
        
        # Try to list all tables or common names
        tester = ["pengeluaran", "pengeluaran_operasional", "operasional", "expenses"]
        for t in tester:
            try:
                res = sb.table(t).select("*").limit(1).execute()
                print(f"Table '{t}' EXISTS!")
            except Exception as e:
                print(f"Table '{t}' NOT found.")
                
    except Exception as e:
        print(f"General error: {e}")

if __name__ == "__main__":
    check()
