from backend.database import get_supabase
import os

def check_types():
    try:
        sb = get_supabase()
        print("--- Database Type Check ---")
        
        # Test Menu
        res = sb.table("menu").select("*").limit(1).execute()
        if res.data:
            print("\nTable: menu")
            for k, v in res.data[0].items():
                print(f"  {k}: {v} ({type(v).__name__})")
        else:
            print("\nTable: menu (Empty)")
            
        # Test Transaksi
        res = sb.table("transaksi").select("*").limit(1).execute()
        if res.data:
            print("\nTable: transaksi")
            for k, v in res.data[0].items():
                print(f"  {k}: {v} ({type(v).__name__})")
        else:
            print("\nTable: transaksi (Empty)")
            
    except Exception as e:
        print(f"ERROR: {e}")

if __name__ == "__main__":
    check_types()
