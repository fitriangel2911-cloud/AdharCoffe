from backend.database import get_supabase
import json

try:
    sb = get_supabase()
    res = sb.table("transaksi").select("*").execute()
    data = res.data or []
    print(f"Total rows: {len(data)}")
    if data:
        print("Columns in first row:", data[0].keys())
        # Sample first 5 rows' created_at
        for i, row in enumerate(data[:10]):
            print(f"Row {i} - ID: {row.get('id')}, created_at: {row.get('created_at')}, Harga: {row.get('harga')}")
    else:
        print("Table is empty")
except Exception as e:
    print(f"Error: {e}")
