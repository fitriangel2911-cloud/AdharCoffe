import os
from dotenv import load_dotenv
from supabase import create_client

load_dotenv()

url = os.environ.get("SUPABASE_URL")
key = os.environ.get("SUPABASE_KEY")
supabase = create_client(url, key)

try:
    # Try to fetch one row or just the schema info if possible
    # A simple select will return columns in the data if a row exists
    res = supabase.table("transaksi").select("*").limit(1).execute()
    print("Columns found in 'transaksi':")
    if res.data and len(res.data) > 0:
        print(list(res.data[0].keys()))
    else:
        print("No data in table, cannot determine columns via SELECT *")
        # Try to insert a dummy row with an empty dict to see if it gives a better error or use a different method
        # But usually we can't easily list columns without raw SQL in some Supabase setups
except Exception as e:
    print(f"Error checking columns: {e}")
