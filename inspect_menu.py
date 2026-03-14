from backend.database import get_supabase

def inspect_menu():
    try:
        sb = get_supabase()
        res = sb.table("menu").select("*").limit(1).execute()
        if res.data:
            print("Columns in 'menu':")
            for key in res.data[0].keys():
                print(f" - {key}")
        else:
            print("Table 'menu' is empty.")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    inspect_menu()
