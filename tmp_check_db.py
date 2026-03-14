
import asyncio
from backend.database import get_supabase

async def check_users_table():
    sb = get_supabase()
    try:
        # Check table columns by attempting a select with an empty limit
        res = sb.table("users").select("*").limit(0).execute()
        print("Successfully connected to 'users' table.")
        # Try to find what columns exist
        if res.data is not None:
             print("Table exists.")
        
        # Test a dry-run insert to see if 'role' is accepted
        # Note: We won't actually commit if we use rollback or just catch the error
    except Exception as e:
        print(f"Error checking users table: {e}")

if __name__ == "__main__":
    asyncio.run(check_users_table())
