import os
from dotenv import load_dotenv
from supabase import create_client, Client

supabase = None

def get_supabase():
    global supabase
    if supabase is None:
        load_dotenv()
        url = os.environ.get("SUPABASE_URL")
        key = os.environ.get("SUPABASE_KEY")
        
        if not url or not key:
            print("ERROR: SUPABASE_URL or SUPABASE_KEY missing in .env")
            raise ValueError("Supabase credentials missing")
            
        try:
            print(f"Connecting to Supabase at {url[:20]}...")
            supabase = create_client(url, key)
            print("Supabase client created successfully.")
        except Exception as e:
            print(f"CRITICAL: Failed to create Supabase client: {str(e)}")
            raise
    return supabase
