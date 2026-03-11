import os
from dotenv import load_dotenv
from supabase import create_client

load_dotenv()

url = os.environ.get("SUPABASE_URL")
key = os.environ.get("SUPABASE_KEY")
supabase = create_client(url, key)

print("Attempting insert with id_menu...")
try:
    res = supabase.table("transaksi").insert({"id_menu": 1, "hpp": 0, "harga": 0}).execute()
    print("Success with id_menu!")
except Exception as e:
    print(f"Failed with id_menu: {e}")

print("\nAttempting insert with idmenu...")
try:
    res = supabase.table("transaksi").insert({"idmenu": 1, "hpp": 0, "harga": 0}).execute()
    print("Success with idmenu!")
except Exception as e:
    print(f"Failed with idmenu: {e}")
