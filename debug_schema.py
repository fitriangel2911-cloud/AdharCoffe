from backend.database import get_supabase
import sys

def debug_users_schema():
    sb = get_supabase()
    try:
        print("Testing with 'INVALID_ROLE'...")
        res = sb.table("users").insert({
            "nama": "Test",
            "email": "test_err@example.com",
            "password": "x",
            "role": "INVALID_ROLE"
        }).execute()
    except Exception as e:
        print("\n--- ERROR CAUGHT ---")
        print(type(e))
        print(e)
        if hasattr(e, 'message'): print(f"Message: {e.message}")
        if hasattr(e, 'details'): print(f"Details: {e.details}")
        if hasattr(e, 'hint'): print(f"Hint: {e.hint}")

if __name__ == "__main__":
    debug_users_schema()
