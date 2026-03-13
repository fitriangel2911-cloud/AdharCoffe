from backend.database import get_supabase

def check_tables():
    sb = get_supabase()
    print("Checking tables and columns...")
    
    tables = ["pengeluaran", "biaya_operasional"]
    for table in tables:
        try:
            res = sb.table(table).select("*").limit(1).execute()
            print(f"\nTable: {table}")
            if res.data:
                print(f"Columns: {list(res.data[0].keys())}")
            else:
                print("Table exists but is empty.")
        except Exception as e:
            print(f"Table: {table} - Error: {e}")

if __name__ == "__main__":
    check_tables()
