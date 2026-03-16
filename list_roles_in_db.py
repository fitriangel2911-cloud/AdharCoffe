from backend.database import get_supabase

def list_enum_values():
    sb = get_supabase()
    try:
        # PostgreSQL query to list enum values
        query = "SELECT enumlabel FROM pg_enum JOIN pg_type ON pg_enum.enumtypid = pg_type.oid WHERE typname = 'user_role';"
        # Supabase doesn't easily allow raw SQL via the client without RPC or similar
        # But we can try to find all roles exists in the users table
        res = sb.table("users").select("role").execute()
        roles = set(r['role'] for r in res.data)
        print(f"Existing roles in users table: {roles}")
        
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    list_enum_values()
