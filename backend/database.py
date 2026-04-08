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
            print("CRITICAL ERROR: SUPABASE_URL or SUPABASE_KEY missing in environment!")
            print("To fix this on Vercel: Go to Settings > Environment Variables and add these keys.")
            raise ValueError("Supabase credentials missing in environment variables")
            
        try:
            print(f"DEBUG: Connecting to Supabase at {url[:15]}...")
            supabase = create_client(url, key)
            print("DEBUG: Supabase client created successfully.")
        except Exception as e:
            print(f"CRITICAL ERROR: Failed to create Supabase client: {str(e)}")
            raise
    return supabase
