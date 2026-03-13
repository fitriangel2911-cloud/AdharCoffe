from backend.database import get_supabase
import json

try:
    sb = get_supabase()
    res = sb.table("menu").select("*").execute()
    data = res.data or []
    print(json.dumps(data[:10], indent=2))
except Exception as e:
    print(f"Error: {e}")
