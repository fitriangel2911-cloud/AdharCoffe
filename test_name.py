import os
from dotenv import load_dotenv
from supabase import create_client

load_dotenv()

url = os.environ.get("SUPABASE_URL")
key = os.environ.get("SUPABASE_KEY")
supabase = create_client(url, key)

print("Testing nama_pembeli column...")
try:
    res = supabase.table("transaksi").insert({"id_menu": 1, "hpp": 0, "harga": 0, "nama_pembeli": "Test"}).execute()
    print("Success with nama_pembeli!")
except Exception as e:
    print(f"Failed with nama_pembeli: {e}")
