import os
import sys
from dotenv import load_dotenv

def diagnose():
    print("--- Environment Diagnosis ---")
    print(f"CWD: {os.getcwd()}")
    
    # Check .env file existence
    env_path = os.path.join(os.getcwd(), ".env")
    print(f".env path: {env_path}")
    print(f".env exists: {os.path.exists(env_path)}")
    
    if os.path.exists(env_path):
        with open(env_path, 'r') as f:
            lines = f.readlines()
            print(f".env line count: {len(lines)}")
            for line in lines:
                if "=" in line:
                    key = line.split('=')[0].strip()
                    print(f"Found key in .env: {key}")

    load_dotenv()
    print(f"SUPABASE_URL in env: {'Found' if os.environ.get('SUPABASE_URL') else 'Missing'}")
    print(f"SUPABASE_KEY in env: {'Found' if os.environ.get('SUPABASE_KEY') else 'Missing'}")

    print("\n--- Module Import Test ---")
    try:
        # Add backend to path if needed
        sys.path.append(os.getcwd())
        from backend.database import get_supabase
        print("Import backend.database: SUCCESS")
        sb = get_supabase()
        print("get_supabase(): SUCCESS")
        
        from backend.main import app
        print("Import backend.main: SUCCESS")
    except Exception as e:
        print(f"IMPORT FAILED: {type(e).__name__}: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    diagnose()
