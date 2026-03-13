from backend.database import get_supabase
import json

try:
    sb = get_supabase()
    # Fetch one row to see all columns
    res = sb.table("transaksi").select("*").limit(5).execute()
    if res.data:
        print("COLUMNS_FOUND:", list(res.data[0].keys()))
        for i, row in enumerate(res.data):
            print(f"Row {i} created_at: {row.get('created_at')}")
    else:
        print("No data in 'transaksi' table.")
except Exception as e:
    print(f"Error: {e}")
