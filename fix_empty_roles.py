from backend.database import get_supabase

def fix_roles():
    sb = get_supabase()
    try:
        # Cari user dengan role kosong atau null
        res = sb.table("users").select("id, email, role").execute()
        for u in res.data:
            if not u['role'] or u['role'].strip() == "":
                # Default ke 'Staff' jika emailnya Dino (untuk tes) atau Pelanggan untuk lainnya
                new_role = "Staff" if "Dino" in u['email'] else "Pelanggan"
                print(f"Fixing user {u['email']}: role set to {new_role}")
                sb.table("users").update({"role": new_role}).eq("id", u['id']).execute()
        print("Success: All empty roles fixed.")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    fix_roles()
