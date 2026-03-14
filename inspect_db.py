from backend.database import get_supabase

def inspect_transaksi():
    try:
        sb = get_supabase()
        # Fetch one row to see columns
        res = sb.table("transaksi").select("*").limit(1).execute()
        if res.data:
            print("Columns in 'transaksi':")
            for key in res.data[0].keys():
                print(f" - {key}")
        else:
            print("Table 'transaksi' is empty. Trying to guess from an error...")
            # If empty, we can try to insert a wrong column to see what it expects? 
            # Or just check if we can get schema info.
            # Usually select('*') on empty table still returns empty list, not keys.
            
            # Let's try to fetch a record that definitely doesn't exist but see if we can get some metadata
            # Supabase-py doesn't expose easy metadata. 
            # Let's try to select specific common names.
            possible_columns = ['id_menu', 'menu_id', 'id_barang', 'barang_id']
            for col in possible_columns:
                try:
                    sb.table("transaksi").select(col).limit(1).execute()
                    print(f"Column '{col}' EXISTS.")
                except Exception as e:
                    print(f"Column '{col}' DOES NOT EXIST or error: {e}")
                    
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    inspect_transaksi()
