from backend.database import get_supabase

def test_role_insertion():
    sb = get_supabase()
    # Try to insert a dummy user with role 'Staff' and then delete it
    temp_email = "temp_staff_test@example.com"
    try:
        print(f"Testing role 'Staff'...")
        res = sb.table("users").insert({
            "nama": "Test Staff",
            "email": temp_email,
            "password": "testing123",
            "role": "Staff"
        }).execute()
        print(f"  SUCCESS: Role 'Staff' is valid!")
        sb.table("users").delete().eq("email", temp_email).execute()
    except Exception as e:
        print(f"  FAILED: Role 'Staff' error: {e}")

    try:
        print(f"Testing role 'staf'...")
        res = sb.table("users").insert({
            "nama": "Test staf",
            "email": temp_email,
            "password": "testing123",
            "role": "staf"
        }).execute()
        print(f"  SUCCESS: Role 'staf' is valid!")
        sb.table("users").delete().eq("email", temp_email).execute()
    except Exception as e:
        print(f"  FAILED: Role 'staf' error: {e}")

if __name__ == "__main__":
    test_role_insertion()
