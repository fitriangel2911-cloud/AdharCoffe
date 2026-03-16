from backend.database import get_supabase

def test_role_validity():
    sb = get_supabase()
    test_roles = ["Staff", "staf", "Staff Dapur", "Dapur", "Kasir", "kasir"]
    
    # We'll try to update a non-existent user to see if it triggers an enum error
    # PostgreSQL validates the enum even if the row doesn't exist in some cases, 
    # but let's use a real dummy user to be sure.
    
    email = "role_test_v2@adhar.com"
    # Create dummy if not exists
    sb.table("users").upsert({"email": email, "password": "x", "nama": "Test", "role": "Pelanggan"}).execute()
    
    for role in test_roles:
        try:
            print(f"Testing validity of role: '{role}'...")
            sb.table("users").update({"role": role}).eq("email", email).execute()
            print(f"  Result: '{role}' is VALID")
        except Exception as e:
            print(f"  Result: '{role}' is INVALID. Error: {e}")
            
    # Cleanup
    sb.table("users").delete().eq("email", email).execute()

if __name__ == "__main__":
    test_role_validity()
