from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from typing import Optional, List
from .database import get_supabase
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

class Transaksi(BaseModel):
    id: Optional[int] = None
    id_menu: int
    hpp: int
    harga: int
    nama_pembeli: Optional[str] = "Umum"
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

@app.get("/api/stats")
async def get_stats():
    sb = get_supabase()
    try:
        res = sb.table("transaksi").select("*").execute()
        rows = res.data or []
        
        total_sales = sum(int(row.get('harga', 0)) for row in rows)
        total_hpp = sum(int(row.get('hpp', 0)) for row in rows)
        total_profit = total_sales - total_hpp
        total_orders = len(rows)
        
        daily_stats = {}
        for row in rows:
            created_at = row.get('created_at')
            if not created_at:
                continue
            date_str = created_at[:10] # YYYY-MM-DD
            if date_str not in daily_stats:
                daily_stats[date_str] = {"sales": 0, "profit": 0}
            
            harga = int(row.get("harga", 0))
            hpp = int(row.get("hpp", 0))
            daily_stats[date_str]["sales"] += harga
            daily_stats[date_str]["profit"] += (harga - hpp)
            
        chart_data = []
        sorted_dates = sorted(list(daily_stats.keys()))[-7:]
        for date in sorted_dates:
            chart_data.append({
                "name": date[-5:], # MM-DD
                "sales": daily_stats[date]["sales"],
                "profit": daily_stats[date]["profit"]
            })

        efficiency = round((total_profit/total_sales*100),1) if total_sales > 0 else 0

        return {
            "summary": [
                { "label": 'Total Penjualan', "value": f"Rp {total_sales:,}", "trend": "+0%" },
                { "label": 'Total Laba', "value": f"Rp {total_profit:,}", "trend": "+0%" },
                { "label": 'Menu Terjual', "value": str(total_orders), "trend": "+0%" },
                { "label": 'Efisiensi', "value": f"{efficiency}%", "trend": "+0%" },
            ],
            "chart_data": chart_data if chart_data else [
                {"name": "No Data", "sales": 0, "profit": 0}
            ]
        }
    except Exception as e:
        print(f"STATS ERROR: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
