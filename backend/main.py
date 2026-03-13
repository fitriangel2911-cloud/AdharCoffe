from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from typing import Optional, List
from backend.database import get_supabase
from datetime import datetime
import time

app = FastAPI(title="SmartPOS API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.middleware("http")
async def log_requests(request: Request, call_next):
    start_time = time.time()
    try:
        response = await call_next(request)
        process_time = (time.time() - start_time) * 1000
        print(f"DEBUG: {request.method} {request.url.path} - Status: {response.status_code} - Time: {process_time:.2f}ms")
        return response
    except Exception as e:
        print(f"DEBUG ERROR: Request failed: {str(e)}")
        return await call_next(request) # Fallback to original behavior

class UserRegister(BaseModel):
    nama: str
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

from typing import Optional

class Menu(BaseModel):
    id: Optional[int] = None
    nama_menu: str
    harga: str
    hpp: Optional[int] = None
    kategori: str

class Kategori(BaseModel):
    id: Optional[int] = None
    nama_kategori: str

class Transaction(BaseModel):
    items: List[dict]
    total_bayar: int
    metode_bayar: str
    admin_id: int
    customer_name: Optional[str] = ""
    no_meja: Optional[str] = ""

class Pengeluaran(BaseModel):
    akun: str
    nominal: int
    tanggal: str # YYYY-MM-DD

class Transaksi(BaseModel):
    id: Optional[int] = None
    id_menu: int
    hpp: int
    harga: int
    nama_pembeli: Optional[str] = "Umum"
    no_meja: Optional[int] = None
    metode_pembayaran: Optional[str] = "Tunai"
    kontak: Optional[str] = ""
    created_at: Optional[str] = None

@app.post("/api/auth/register")
async def register(user: UserRegister):
    sb = get_supabase()
    # Check if user exists
    existing = sb.table("users").select("*").eq("email", user.email).execute()
    if existing.data:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Insert user
    # Note: If id is int (not auto-increment), this might fail. 
    # Let's hope the user set it to auto-increment/identity.
    try:
        res = sb.table("users").insert({
            "nama": user.nama,
            "email": user.email,
            "password": user.password
        }).execute()
        return {"message": "User registered successfully", "user": res.data[0]}
    except Exception as e:
        print(f"INSERT ERROR: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/auth/login")
async def login(credentials: UserLogin):
    sb = get_supabase()
    res = sb.table("users").select("*").eq("email", credentials.email).eq("password", credentials.password).execute()
    
    if not res.data:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    return {"message": "Login successful", "user": res.data[0]}

@app.get("/api/db-check")
async def db_check():
    try:
        print("Checking database connection...")
        sb = get_supabase()
        return {"status": "connected", "details": "Supabase client initialized"}
    except Exception as e:
        print(f"DATABASE ERROR: {str(e)}")
        return {"status": "error", "message": str(e)}

@app.get("/")
async def root():
    return {"message": "Welcome to SmartPOS API", "status": "online"}

# --- MENU ENDPOINTS ---
@app.get("/api/menu")
async def get_all_menu():
    sb = get_supabase()
    res = sb.table("menu").select("*").execute()
    return res.data

@app.post("/api/menu")
async def create_menu(item: Menu):
    sb = get_supabase()
    data = item.dict(exclude_none=True)
    res = sb.table("menu").insert(data).execute()
    return res.data[0]

@app.put("/api/menu/{item_id}")
async def update_menu(item_id: int, item: Menu):
    sb = get_supabase()
    data = item.dict(exclude_none=True)
    res = sb.table("menu").update(data).eq("id", item_id).execute()
    return res.data[0]

@app.delete("/api/menu/{item_id}")
async def delete_menu(item_id: int):
    sb = get_supabase()
    sb.table("menu").delete().eq("id", item_id).execute()
    return {"message": "Menu deleted"}

# --- KATEGORI ENDPOINTS ---
@app.get("/api/kategori")
async def get_all_kategori():
    sb = get_supabase()
    res = sb.table("kategori").select("*").execute()
    return res.data

@app.post("/api/kategori")
async def create_kategori(item: Kategori):
    sb = get_supabase()
    data = item.dict(exclude_none=True)
    try:
        res = sb.table("kategori").insert(data).execute()
        if not res.data:
            raise HTTPException(status_code=500, detail="Failed to insert kategori")
        return res.data[0]
    except Exception as e:
        print(f"KATEGORI INSERT ERROR: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.put("/api/kategori/{item_id}")
async def update_kategori(item_id: int, item: Kategori):
    sb = get_supabase()
    data = item.dict(exclude_none=True)
    try:
        res = sb.table("kategori").update(data).eq("id", item_id).execute()
        if not res.data:
            raise HTTPException(status_code=500, detail="Failed to update kategori")
        return res.data[0]
    except Exception as e:
        print(f"KATEGORI UPDATE ERROR: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/api/kategori/{item_id}")
async def delete_kategori(item_id: int):
    sb = get_supabase()
    try:
        sb.table("kategori").delete().eq("id", item_id).execute()
        return {"message": "Kategori deleted"}
    except Exception as e:
        print(f"KATEGORI DELETE ERROR: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/ping")
async def ping():
    return {"message": "pong"}

@app.post("/api/checkout")
async def checkout(items: List[Transaksi]):
    sb = get_supabase()
    try:
        data = [item.dict(exclude_none=True) for item in items]
        res = sb.table("transaksi").insert(data).execute()
        return {"message": "Transaksi berhasil disimpan", "data": res.data}
    except Exception as e:
        print(f"CHECKOUT ERROR: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# --- Pengeluaran Operasional ---
@app.get("/api/pengeluaran")
async def get_pengeluaran():
    try:
        sb = get_supabase()
        res = sb.table("biaya_operasional").select("*").order("tanggal", desc=True).execute()
        return res.data or []
    except Exception as e:
        print(f"GET PENGELUARAN ERROR: {e}")
        # Return empty list instead of 500 if table doesn't exist yet
        return []

@app.post("/api/pengeluaran")
async def add_pengeluaran(data: Pengeluaran):
    try:
        sb = get_supabase()
        res = sb.table("biaya_operasional").insert({
            "akun": data.akun,
            "nominal": data.nominal,
            "tanggal": data.tanggal
        }).execute()
        return res.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/api/pengeluaran/{id}")
async def delete_pengeluaran(id: int):
    try:
        sb = get_supabase()
        sb.table("pengeluaran").delete().eq("id", id).execute()
        return {"status": "success"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/stats")
async def get_stats():
    sb = get_supabase()
    try:
        # Fetch transactions
        res = sb.table("transaksi").select("*").execute()
        data = res.data or []

        # Fetch All Menus for Category mapping
        res_menu = sb.table("menu").select("id, nama_menu, kategori").execute()
        menu_lookup = {m['id']: m for m in (res_menu.data or [])}

        # Fetch operational expenses (resilient)
        exp_data = []
        try:
            res_exp = sb.table("biaya_operasional").select("*").execute()
            exp_data = res_exp.data or []
        except Exception as e:
            print(f"STATS: Table 'biaya_operasional' not found or inaccessible: {e}")

        total_sales = sum(int(row.get('harga') or 0) for row in data)
        total_hpp = sum(int(row.get('hpp') or 0) for row in data)
        total_orders = len(data)
        total_operasional = sum(int(e.get("nominal", 0)) for e in exp_data)

        daily_stats = {}
        menu_counts = {} # {id_menu: count}
        for row in data:
            id_menu = row.get("id_menu")
            if id_menu:
                menu_counts[id_menu] = menu_counts.get(id_menu, 0) + 1

            created_at = row.get('created_at')
            date_str = str(created_at)[:10] if created_at else datetime.now().strftime("%Y-%m-%d")
            
            if date_str not in daily_stats:
                daily_stats[date_str] = {"sales": 0, "profit": 0, "expense": 0, "operational_expense": 0}
            
            harga = int(row.get("harga", 0))
            hpp = int(row.get("hpp", 0))
            daily_stats[date_str]["sales"] += harga
            daily_stats[date_str]["profit"] += (harga - hpp)
            daily_stats[date_str]["expense"] += hpp

        for expense_item in exp_data:
            expense_date = expense_item.get("tanggal")
            if expense_date:
                if expense_date not in daily_stats:
                    daily_stats[expense_date] = {"sales": 0, "profit": 0, "expense": 0, "operational_expense": 0}
                daily_stats[expense_date]["operational_expense"] += int(expense_item.get("nominal", 0))
        
        chart_data = []
        sorted_dates = sorted(list(daily_stats.keys()))[-7:]
        for date in sorted_dates:
            chart_data.append({
                "name": date[-5:], # MM-DD
                "sales": daily_stats[date]["sales"],
                "profit": daily_stats[date]["profit"] - daily_stats[date]["operational_expense"], # Daily profit adjusted for operational expenses
                "expense": daily_stats[date]["expense"] + daily_stats[date]["operational_expense"] # Total expenses (HPP + Operational)
            })

        # Final Profit = (Sales - HPP) - Operational Expenses
        total_profit = (total_sales - total_hpp) - total_operasional

        efficiency = round((total_profit/total_sales*100),1) if total_sales > 0 else 0
        
        # Aggregate Top Menu
        top_makanan = []
        top_minuman = []
        
        for mid, count in menu_counts.items():
            menu_info = menu_lookup.get(mid)
            if menu_info:
                item = {"name": menu_info["nama_menu"], "value": count}
                if menu_info["kategori"] == "Makanan":
                    top_makanan.append(item)
                else:
                    top_minuman.append(item)
                    
        # Sort and slice
        top_makanan = sorted(top_makanan, key=lambda x: x["value"], reverse=True)[:5]
        top_minuman = sorted(top_minuman, key=lambda x: x["value"], reverse=True)[:5]

        return {
            "total_sales": total_sales,
            "total_hpp": total_hpp,
            "total_operasional": total_operasional,
            "total_profit": total_profit,
            "efficiency": efficiency,
            "top_makanan": top_makanan,
            "top_minuman": top_minuman,
            "summary": [
                { "label": 'Total Penjualan', "value": f"Rp {total_sales:,}", "trend": "+0%" },
                { "label": 'Total Laba', "value": f"Rp {total_profit:,}", "trend": "+0%" },
                { "label": 'Menu Terjual', "value": str(total_orders), "trend": "+0%" },
                { "label": 'Efisiensi', "value": f"{efficiency}%", "trend": "+0%" },
            ],
            "chart_data": chart_data
        }
    except Exception as e:
        print(f"STATS ERROR: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
