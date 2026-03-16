from backend.database import get_supabase
import os

def test_role_validity():
    sb = get_supabase()
    test_roles = ["Staff", "staf", "Dapur", "dapur", "Kasir", "kasir"]
    
    email = "role_test_v3@adhar.com"
    # Create dummy if not exists
    sb.table("users").upsert({"email": email, "password": "x", "nama": "Test", "role": "Pelanggan"}).execute()
    
    results = []
    for role in test_roles:
        try:
            print(f"Testing validity of role: '{role}'...")
            sb.table("users").update({"role": role}).eq("email", email).execute()
            results.append(f"'{role}' is VALID")
        except Exception as e:
            results.append(f"'{role}' is INVALID")
            
    # Cleanup
    sb.table("users").delete().eq("email", email).execute()
    
    with open("valid_roles.txt", "w") as f:
        f.write("\n".join(results))

if __name__ == "__main__":
    test_role_validity()
