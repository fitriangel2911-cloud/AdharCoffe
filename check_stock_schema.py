from backend.database import get_supabase

def check_stock_table():
    sb = get_supabase()
    print("Checking for stock/inventory tables...")
    
    potential_tables = ["stok", "stock", "inventory", "bahan_baku", "menu"]
    for table in potential_tables:
        try:
            res = sb.table(table).select("*").limit(1).execute()
            print(f"\nTable Found: '{table}'")
            if res.data:
                print(f"  Columns: {list(res.data[0].keys())}")
                print(f"  Sample: {res.data[0]}")
            else:
                print("  Table exists but is empty.")
        except Exception as e:
            if "does not exist" in str(e).lower() or "404" in str(e):
                print(f"Table '{table}' does not exist.")
            else:
                print(f"Error checking '{table}': {e}")

if __name__ == "__main__":
    check_stock_table()
