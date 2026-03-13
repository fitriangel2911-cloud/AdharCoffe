from backend.database import get_supabase
import sys

def check_tables():
    try:
        sb = get_supabase()
        print("--- Database Table Connectivity Check ---")
        
        tables = ["pengeluaran", "biaya_operasional"]
        for table in tables:
            print(f"\nChecking table: '{table}'...")
            try:
                res = sb.table(table).select("*").limit(1).execute()
                print(f"  SUCCESS: Table '{table}' exists.")
                if res.data and len(res.data) > 0:
                    print(f"  SAMPLE RECORD: {res.data[0]}")
                    print(f"  COLUMNS: {list(res.data[0].keys())}")
                else:
                    print(f"  INFO: Table exists but is empty. Cannot determine column names automatically.")
            except Exception as e:
                print(f"  FAILED: {str(e)}")
    except Exception as e:
        print(f"CRITICAL ERROR: {str(e)}")

if __name__ == "__main__":
    check_tables()
