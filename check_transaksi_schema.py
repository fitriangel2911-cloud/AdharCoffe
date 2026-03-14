from backend.database import get_supabase

def check_transaksi_cols():
    sb = get_supabase()
    res = sb.table("transaksi").select("*").limit(1).execute()
    if res.data:
        print(f"Kolom tabel transaksi: {list(res.data[0].keys())}")
    else:
        print("Tabel transaksi kosong, tidak bisa cek kolom.")

if __name__ == "__main__":
    check_transaksi_cols()
