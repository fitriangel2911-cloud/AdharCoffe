import os
from dotenv import load_dotenv
from supabase import create_client

load_dotenv()

url = os.environ.get("SUPABASE_URL")
key = os.environ.get("SUPABASE_KEY")
supabase = create_client(url, key)

try:
    res = supabase.table("menu").select("*").limit(1).execute()
    print("Columns found in 'menu':")
    if res.data and len(res.data) > 0:
        print(list(res.data[0].keys()))
    else:
        print("No data in 'menu' table.")
except Exception as e:
    print(f"Error checking menu columns: {e}")
