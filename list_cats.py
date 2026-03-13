from backend.database import get_supabase

try:
    sb = get_supabase()
    res = sb.table("menu").select("kategori").execute()
    cats = sorted(list(set(r['kategori'] for r in res.data)))
    print("Categories:", cats)
except Exception as e:
    print(f"Error: {e}")
