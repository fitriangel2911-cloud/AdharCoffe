from backend.database import get_supabase
import json

try:
    sb = get_supabase()
    res = sb.table("transaksi").select("*").limit(5).execute()
    with open("schema_output.json", "w") as f:
        json.dump(res.data, f, indent=2)
    print("Output saved to schema_output.json")
except Exception as e:
    with open("schema_error.txt", "w") as f:
        f.write(str(e))
    print(f"Error: {e}")
