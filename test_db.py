import os
from dotenv import load_dotenv
from supabase import create_client

def test_connection():
    load_dotenv()
    url = os.environ.get("SUPABASE_URL")
    key = os.environ.get("SUPABASE_KEY")
    
    print(f"URL found: {'Yes' if url else 'No'}")
    print(f"Key found: {'Yes' if key else 'No'}")
    
    if not url or not key:
        print("ERROR: Environment variables missing!")
        return

    try:
        supabase = create_client(url, key)
        print("Successfully created Supabase client!")
        # Test a simple query
        res = supabase.table("users").select("count", count="exact").execute()
        print(f"Connection test success! Found {res.count} users.")
    except Exception as e:
        print(f"Connection test failed: {str(e)}")

if __name__ == "__main__":
    test_connection()
