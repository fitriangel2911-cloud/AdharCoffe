from fastapi import FastAPI, HTTPException, Request, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
import io
import csv
from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from backend.database import get_supabase
from datetime import datetime
import time
import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

app = FastAPI(title="SmartPOS API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Middleware removed to avoid proxy interference issues

class UserRegister(BaseModel):
    nama: str
    email: EmailStr
    password: str
    role: Optional[str] = "Pelanggan"

class UserLogin(BaseModel):
    email: EmailStr
    password: str

from typing import Optional

class Menu(BaseModel):
    id: Optional[int] = None
    nama_menu: str
    harga: int
    hpp: Optional[int] = None
    kategori: str
    stok: Optional[int] = 0
    min_stok: Optional[int] = 5

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
    kuantitas_menu: int
    hpp: int
    harga: int
    nama_pembeli: Optional[str] = "Umum"
    no_meja: Optional[int] = None
    metode_pembayaran: Optional[str] = "Tunai"
    
    # Config removed to keep it simple as we renamed the field directly
    tipe_pesanan: Optional[str] = "Makan Ditempat"
    kontak: Optional[str] = ""
    status: Optional[str] = "waiting"
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
            "password": user.password,
            "role": user.role
        }).execute()
        return {"message": "User registered successfully", "user": res.data[0]}
    except Exception as e:
        error_msg = str(e)
        print(f"INSERT ERROR: {error_msg}")
        if "column \"role\" of relation \"users\" does not exist" in error_msg.lower():
            raise HTTPException(
                status_code=500, 
                detail="Kolom 'role' belum ada di tabel 'users' di Supabase. Silakan tambahkan kolom 'role' (text) terlebih dahulu di Dashboard Supabase."
            )
        if "invalid input value for enum" in error_msg.lower():
            raise HTTPException(
                status_code=500,
                detail=f"Registrasi gagal: Role '{user.role}' belum ditambahkan di database. Silakan jalankan SQL di Supabase: ALTER TYPE role ADD VALUE '{user.role}';"
            )
        raise HTTPException(status_code=500, detail=error_msg)

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

@app.put("/api/menu/{item_id}/stok")
async def update_menu_stok(item_id: int, data: dict):
    sb = get_supabase()
    new_stok = data.get("stok")
    if new_stok is None:
        raise HTTPException(status_code=400, detail="Stok is required")
        
    res = sb.table("menu").update({"stok": new_stok}).eq("id", item_id).execute()
    return res.data[0]

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

def send_receipt_email_task(to_email: str, order_summary: dict, total_bayar: int, nama_pembeli: str):
    sender_email = os.environ.get("SMTP_EMAIL")
    sender_password = os.environ.get("SMTP_PASSWORD")
    
    if not sender_email or not sender_password or not to_email or "@" not in to_email:
        print("DEBUG: Skipping email sending, invalid credentials or email.")
        return
        
    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = "Struk Pesanan - Adhar Coffe"
        msg["From"] = f"Adhar Coffe <{sender_email}>"
        msg["To"] = to_email

        html_content = f"""
        <html>
          <body style="font-family: Arial, sans-serif; color: #333;">
            <div style="max-width: 400px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
                <h2 style="color: #0ea5e9; text-align: center;">ADHAR COFFE</h2>
                <h3 style="text-align: center;">Terima kasih atas pesanan Anda, {nama_pembeli}!</h3>
                <p>Berikut adalah rincian pesanan Anda:</p>
                <div style="border-top: 1px dashed #ccc; border-bottom: 1px dashed #ccc; padding: 10px 0;">
                    <ul style="list-style: none; padding: 0; margin: 0;">
        """
        for name, data in order_summary.items():
            html_content += f"""
                        <li style="margin-bottom: 10px; display: flex; justify-content: space-between;">
                            <div><strong>{name}</strong><br><small>{data['qty']} x Rp{data['price']:,}</small></div>
                            <div style="font-weight: bold;">Rp{data['subtotal']:,}</div>
                        </li>
            """
        
        infaq = int(total_bayar * 0.025)
        html_content += f"""
                    </ul>
                </div>
                <div style="margin-top: 15px; display: flex; justify-content: space-between;">
                    <span>Subtotal</span><span>Rp{total_bayar:,}</span>
                </div>
                <div style="margin-top: 5px; display: flex; justify-content: space-between; color: #db2777;">
                    <span>Infaq/Sedekah (2.5%)</span><span>Rp{infaq:,}</span>
                </div>
                <div style="margin-top: 15px; padding: 10px; background: #e0f2fe; border-radius: 8px; font-size: 18px; font-weight: bold; text-align: center;">
                    Total: Rp{total_bayar:,}
                </div>
                <p style="text-align: center; font-size: 12px; color: #777; margin-top: 20px;">Email ini dihasilkan secara otomatis oleh sistem SmartPOS.</p>
            </div>
          </body>
        </html>
        """
        
        part = MIMEText(html_content, "html")
        msg.attach(part)
        
        server = smtplib.SMTP_SSL('smtp.gmail.com', 465)
        server.login(sender_email, sender_password)
        server.sendmail(sender_email, to_email, msg.as_string())
        server.quit()
        print(f"DEBUG: Email receipt sent to {to_email}")
    except Exception as e:
        print(f"EMAIL ERROR: {str(e)}")

@app.post("/api/checkout")
async def checkout(items: List[Transaksi], background_tasks: BackgroundTasks):
    print(f"DEBUG: Received checkout request with {len(items)} items")
    sb = get_supabase()
    try:
        # 1. Cek Ketersediaan Stok
        id_menus = [item.kuantitas_menu for item in items]
        res_menu = sb.table("menu").select("id, nama_menu, stok").in_("id", id_menus).execute()
        menu_lookup = {m['id']: m for m in (res_menu.data or [])}
        
        required_qty = {}
        for item in items:
            m_id = int(item.kuantitas_menu)
            required_qty[m_id] = required_qty.get(m_id, 0) + 1
            
        # Validasi stok
        for menu_id, qty in required_qty.items():
            menu = menu_lookup.get(menu_id)
            if not menu:
                raise HTTPException(status_code=404, detail=f"Menu dengan ID {menu_id} tidak ditemukan")
            
            try:
                current_stok = int(menu.get('stok', 0))
            except (ValueError, TypeError):
                current_stok = 0
                
            if int(current_stok) < int(qty):
                raise HTTPException(status_code=400, detail=f"Stok tidak mencukupi untuk {menu['nama_menu']}. Sisa: {current_stok}")

        # 2. Simpan Transaksi
        try:
            # We renamed the field to kuantitas_menu, so it matches DB by default
            data = [item.dict(exclude_none=True) for item in items]
            print(f"DEBUG: Inserting data to Supabase: {data}")
            res = sb.table("transaksi").insert(data).execute()
        except Exception as insert_err:
            print(f"INSERT TRANSACTION ERROR: {insert_err}")
            raise HTTPException(status_code=500, detail=f"Database insert failed: {str(insert_err)}")
        
        # 3. Kurangi Stok
        for menu_id, qty in required_qty.items():
            try:
                current_stok = int(menu_lookup[menu_id].get('stok', 0))
            except (ValueError, TypeError):
                current_stok = 0
            new_stok = current_stok - qty
            sb.table("menu").update({"stok": max(0, new_stok)}).eq("id", menu_id).execute()
        
        # Format Data for Email Receipt
        to_email = None
        nama_pembeli = "Pelanggan"
        total_bayar = 0
        
        if items:
            to_email = items[0].kontak
            nama_pembeli = items[0].nama_pembeli
            for item in items:
                total_bayar += item.harga
                
        if to_email and "@" in to_email:
            # Map item IDs to names
            try:
                # Re-use menu_lookup content but maybe we need names if we didn't fetch them all
                order_summary = {}
                for item in items:
                    name = menu_lookup.get(item.kuantitas_menu, {}).get('nama_menu', f"Item #{item.kuantitas_menu}")
                    if name not in order_summary:
                        order_summary[name] = {"qty": 0, "price": item.harga, "subtotal": 0}
                    order_summary[name]["qty"] += 1
                    order_summary[name]["subtotal"] += item.harga
                
                background_tasks.add_task(send_receipt_email_task, to_email, order_summary, total_bayar, nama_pembeli)
            except Exception as email_prep_error:
                print(f"EMAIL PREP ERROR: {email_prep_error}")
                
        return {"message": "Transaksi berhasil disimpan dan stok telah diperbarui", "data": res.data}
    except HTTPException:
        raise
    except Exception as e:
        print(f"CHECKOUT ERROR: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# --- Pengeluaran Operasional ---
@app.get("/api/pengeluaran")
async def get_pengeluaran():
    try:
        sb = get_supabase()
        res = sb.table("pengeluaran_operasional").select("*").order("tanggal", desc=True).execute()
        return res.data or []
    except Exception as e:
        print(f"GET PENGELUARAN ERROR: {e}")
        # Return empty list instead of 500 if table doesn't exist yet
        return []

@app.post("/api/pengeluaran")
async def add_pengeluaran(data: Pengeluaran):
    try:
        sb = get_supabase()
        res = sb.table("pengeluaran_operasional").insert({
            "akun": data.akun,
            "nominal": data.nominal,
            "tanggal": data.tanggal
        }).execute()
        return res.data[0]
    except Exception as e:
        error_msg = str(e)
        if "relation \"public.pengeluaran_operasional\" does not exist" in error_msg or "Could not find relation" in error_msg:
            raise HTTPException(
                status_code=500, 
                detail="Tabel 'pengeluaran_operasional' belum ada di Supabase database Anda. Tolong buat tabelnya."
            )
        raise HTTPException(status_code=500, detail=error_msg)

@app.delete("/api/pengeluaran/{id}")
async def delete_pengeluaran(id: int):
    try:
        sb = get_supabase()
        sb.table("pengeluaran_operasional").delete().eq("id", id).execute()
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
            res_exp = sb.table("pengeluaran_operasional").select("*").execute()
            exp_data = res_exp.data or []
        except Exception as e:
            print(f"STATS: Table 'pengeluaran_operasional' not found or inaccessible: {e}")

        total_sales = sum(int(row.get('harga') or 0) for row in data)
        total_hpp = sum(int(row.get('hpp') or 0) for row in data)
        total_orders = len(data)
        total_operasional = sum(int(e.get("nominal", 0)) for e in exp_data)

        daily_stats = {}
        menu_counts = {} # {id_menu: count}
        for row in data:
            id_menu = row.get("kuantitas_menu")
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

@app.get("/api/export/transactions")
async def export_transactions():
    sb = get_supabase()
    try:
        res = sb.table("transaksi").select("*").order("created_at", desc=True).execute()
        data = res.data or []
        
        output = io.StringIO()
        writer = csv.writer(output)
        
        # Header
        if data:
            writer.writerow(data[0].keys())
            for row in data:
                writer.writerow(row.values())
        
        output.seek(0)
        return StreamingResponse(
            output,
            media_type="text/csv",
            headers={"Content-Disposition": f"attachment; filename=transaksi_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"}
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/export/financials")
async def export_financials():
    stats = await get_stats()
    try:
        output = io.StringIO()
        writer = csv.writer(output)
        
        writer.writerow(["Parameter", "Nilai"])
        writer.writerow(["Total Penjualan", stats["total_sales"]])
        writer.writerow(["Total HPP", stats["total_hpp"]])
        writer.writerow(["Total Operasional", stats["total_operasional"]])
        writer.writerow(["Total Laba Bersih", stats["total_profit"]])
        writer.writerow(["Efisiensi", f"{stats['efficiency']}%"])
        writer.writerow([])
        writer.writerow(["Data Harian (7 Hari Terakhir)"])
        writer.writerow(["Tanggal", "Penjualan", "Pengeluaran", "Laba"])
        
        for day in stats["chart_data"]:
            writer.writerow([day["name"], day["sales"], day["expense"], day["profit"]])
            
        output.seek(0)
        return StreamingResponse(
            output,
            media_type="text/csv",
            headers={"Content-Disposition": f"attachment; filename=laporan_keuangan_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"}
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# --- ORDER MANAGEMENT ENDPOINTS ---
@app.get("/api/orders/active")
async def get_active_orders():
    sb = get_supabase()
    try:
        # Get orders that are not completed
        res = sb.table("transaksi").select("*").neq("status", "completed").order("created_at", desc=False).execute()
        return res.data or []
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/orders/public")
async def get_public_queue():
    sb = get_supabase()
    try:
        # For public display, just name and status
        res = sb.table("transaksi").select("id, nama_pembeli, no_meja, status, created_at").neq("status", "completed").order("created_at", desc=False).execute()
        return res.data or []
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.put("/api/orders/{order_id}/status")
async def update_order_status(order_id: int, data: dict):
    sb = get_supabase()
    new_status = data.get("status")
    if not new_status:
        raise HTTPException(status_code=400, detail="Status is required")
        
    try:
        res = sb.table("transaksi").update({"status": new_status}).eq("id", order_id).execute()
        return res.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
