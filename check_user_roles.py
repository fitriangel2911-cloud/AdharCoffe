from backend.database import get_supabase

def check_users():
    sb = get_supabase()
    try:
        res = sb.table("users").select("id, email, role").execute()
        print("Existing Users:")
        for u in res.data:
            print(f"ID: {u['id']}, Email: {u['email']}, Role: {u['role']}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    check_users()
