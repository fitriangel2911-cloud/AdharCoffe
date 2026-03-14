from backend.database import get_supabase
import json

def check_types():
    sb = get_supabase()
    print("Checking 'menu' table...")
    res_menu = sb.table("menu").select("*").limit(1).execute()
    if res_menu.data:
        for k, v in res_menu.data[0].items():
            print(f"  Column '{k}': value={v}, type={type(v)}")
    else:
        print("  Table 'menu' is empty.")

    print("\nChecking 'transaksi' table...")
    res_tx = sb.table("transaksi").select("*").limit(1).execute()
    if res_tx.data:
        for k, v in res_tx.data[0].items():
            print(f"  Column '{k}': value={v}, type={type(v)}")
    else:
        print("  Table 'transaksi' is empty.")

if __name__ == "__main__":
    check_types()
