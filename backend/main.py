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
from dotenv import load_dotenv
load_dotenv()  # load SMTP_EMAIL, SMTP_PASSWORD, etc. from .env
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse

app = FastAPI(title="SmartPOS API")

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    print(f"VALIDATION ERROR for {request.url}: {exc.errors()}")
    return JSONResponse(
        status_code=422,
        content={"detail": exc.errors()},
    )

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
    akun_id_debit: int
    akun_id_kredit: int
    nominal: int
    tanggal: str # YYYY-MM-DD
    keterangan: Optional[str] = ""

class PenyaluranInfaq(BaseModel):
    id: Optional[int] = None
    nominal: int
    tanggal: str
    keterangan: Optional[str] = ""
    penerima: Optional[str] = ""

class Aset(BaseModel):
    nama_aset: str
    kategori_aset: str
    nominal: int
    tanggal: str
    keterangan: Optional[str] = None

class Ekuitas(BaseModel):
    nama_modal: str
    nominal: int
    tanggal: str
    keterangan: Optional[str] = None

class JurnalDetailRequest(BaseModel):
    akun_id: int
    tipe: str # 'Debit' or 'Kredit'
    nominal: int

class JurnalRequest(BaseModel):
    tanggal: str
    keterangan: str
    items: List[JurnalDetailRequest]

class InventoryPurchase(BaseModel):
    item_id: int
    qty: int
    total_nominal: int
    metode_pembayaran: str # 'Tunai' or 'Transfer'

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
    infaq: Optional[int] = 0
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
            # Extract the actual error details to be helpful
            raise HTTPException(
                status_code=500,
                detail=f"Registrasi gagal: Role '{user.role}' belum didukung di database. Silakan jalankan SQL di Supabase: ALTER TYPE role ADD VALUE '{user.role}';"
            )
        raise HTTPException(status_code=500, detail=error_msg)

# --- ADMIN USER MANAGEMENT ---
@app.get("/api/admin/users")
async def get_all_users():
    sb = get_supabase()
    try:
        res = sb.table("users").select("id, nama, email, role").execute()
        return res.data
    except Exception as e:
        print(f"GET USERS ERROR: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.put("/api/admin/users/{user_id}/role")
async def update_user_role(user_id: int, data: dict):
    sb = get_supabase()
    new_role = data.get("role")
    if not new_role:
        raise HTTPException(status_code=400, detail="Role is required")
    
    try:
        res = sb.table("users").update({"role": new_role}).eq("id", user_id).execute()
        if not res.data:
            raise HTTPException(status_code=404, detail="User not found")
        return res.data[0]
    except Exception as e:
        error_msg = str(e)
        print(f"UPDATE ROLE ERROR: {error_msg}")
        if "invalid input value for enum" in error_msg.lower():
            raise HTTPException(
                status_code=500,
                detail=f"Gagal update role: '{new_role}' belum didukung database. Gunakan SQL: ALTER TYPE role ADD VALUE '{new_role}';"
            )
        raise HTTPException(status_code=500, detail=error_msg)

@app.post("/api/auth/login")
async def login(credentials: UserLogin, request: Request):
    print(f"DEBUG LOGIN ATTEMPT: {credentials.email} | Method: {request.method} | IP: {request.client.host}")
    sb = get_supabase()
    res = sb.table("users").select("*").eq("email", credentials.email).eq("password", credentials.password).execute()
    
    if not res.data:
        print(f"DEBUG LOGIN FAILED for {credentials.email}")
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    print(f"DEBUG LOGIN SUCCESS for {credentials.email}")
    return {"message": "Login successful", "user": res.data[0]}

@app.get("/api/db-check")
async def db_check():
    try:
        # Diagnostic ping to supabase
        sb = get_supabase()
        # Just check if we can reach the table definition (very fast)
        start_time = time.time()
        sb.table("users").select("count", count="exact").limit(1).execute()
        latency = (time.time() - start_time) * 1000
        print(f"HEALTH CHECK: DB Connected. Latency: {latency:.2f}ms")
        return {"status": "connected", "latency_ms": round(latency, 2)}
    except Exception as e:
        print(f"HEALTH CHECK FAILED: {str(e)}")
        return JSONResponse(
            status_code=503,
            content={"status": "error", "message": "Database unreachable"}
        )

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

@app.post("/api/inventory/purchase")
async def record_purchase(data: InventoryPurchase):
    sb = get_supabase()
    try:
        # 1. Update Stok
        menu_res = sb.table("menu").select("nama_menu, stok").eq("id", data.item_id).execute()
        if not menu_res.data:
            raise HTTPException(status_code=404, detail="Item tidak ditemukan")
        
        current_stok = int(menu_res.data[0].get("stok") or 0)
        nama_item = menu_res.data[0].get("nama_menu")
        new_stok = current_stok + data.qty
        
        sb.table("menu").update({"stok": new_stok}).eq("id", data.item_id).execute()

        # 2. Buat Jurnal Otomatis
        tanggal_skrg = datetime.now().strftime("%Y-%m-%d")
        
        # Fetch accounts
        res_akun = sb.table("akun").select("id, nama_akun").execute()
        akun_list = res_akun.data or []

        def find_akun(*keywords):
            for kw in keywords:
                for a in akun_list:
                    if kw.lower() in a['nama_akun'].lower():
                        return a['id']
            return None

        # Determine accounts
        id_persediaan = find_akun("persediaan", "inventory", "stok")
        if "transfer" in data.metode_pembayaran.lower():
            id_kas_bank = find_akun("bank", "rekening")
        else:
            id_kas_bank = find_akun("kas", "cash")
            if not id_kas_bank: id_kas_bank = find_akun("bank")

        if id_persediaan and id_kas_bank:
            res_j = sb.table("jurnal").insert({
                "tanggal": tanggal_skrg,
                "keterangan": f"Pembelian Stok: {nama_item} (+{data.qty})"
            }).execute()
            
            if res_j.data:
                jid = res_j.data[0]['id']
                sb.table("jurnal_detail").insert([
                    {"jurnal_id": jid, "akun_id": id_persediaan, "tipe": "Debit",  "nominal": data.total_nominal},
                    {"jurnal_id": jid, "akun_id": id_kas_bank,    "tipe": "Kredit", "nominal": data.total_nominal}
                ]).execute()
        
        return {"message": "Pembelian berhasil dicatat", "new_stok": new_stok}
    except Exception as e:
        print(f"PURCHASE ERROR: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

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

def send_receipt_email_task(to_email: str, order_summary: dict, subtotal: int, infaq: int, total_bayar: int, nama_pembeli: str):
    sender_email = os.environ.get("SMTP_EMAIL")
    sender_password = os.environ.get("SMTP_PASSWORD")
    
    if not sender_email or not sender_password or not to_email or "@" not in to_email:
        print("DEBUG: Skipping email sending, invalid credentials or email.")
        return
        
    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = f"Struk Pesanan #{int(time.time() % 10000)} - Adhar Coffe"
        msg["From"] = f"Adhar Coffe <{sender_email}>"
        msg["To"] = to_email

        # Premium Professional Template (Sky Blue & Pink Theme)
        html_content = f"""
        <html>
          <body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
            <table role="presentation" style="width: 100%; border-collapse: collapse;">
              <tr>
                <td align="center" style="padding: 40px 0;">
                  <div style="max-width: 500px; background-color: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05); border: 1px solid #e2e8f0;">
                    
                    <!-- Header -->
                    <div style="background: linear-gradient(135deg, #1ca3f4 0%, #7dd3fc 100%); padding: 32px; text-align: center;">
                      <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 800; letter-spacing: -0.025em; text-transform: uppercase;">ADHAR COFFE</h1>
                      <p style="margin: 8px 0 0; color: #e0f2fe; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em;">Digital Receipt (Terima Kasih)</p>
                    </div>

                    <div style="padding: 32px;">
                      <p style="margin: 0; color: #64748b; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em;">Terima kasih atas pesanan Anda,</p>
                      <h2 style="margin: 4px 0 24px; color: #0f172a; font-size: 20px; font-weight: 700;">Halo, {nama_pembeli}! 👋</h2>

                      <!-- Order Table -->
                      <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
                        <thead>
                          <tr style="border-bottom: 2px solid #f1f5f9;">
                            <th align="left" style="padding: 12px 0; color: #94a3b8; font-size: 12px; font-weight: 700; text-transform: uppercase;">Pesanan</th>
                            <th align="right" style="padding: 12px 0; color: #94a3b8; font-size: 12px; font-weight: 700; text-transform: uppercase;">Subtotal</th>
                          </tr>
                        </thead>
                        <tbody>
        """
        
        for name, data in order_summary.items():
            html_content += f"""
                          <tr style="border-bottom: 1px solid #f8fafc;">
                            <td style="padding: 16px 0;">
                              <div style="color: #1e293b; font-size: 15px; font-weight: 700;">{name}</div>
                              <div style="color: #64748b; font-size: 13px; font-weight: 500;">{data['qty']} x Rp{data['price']:,}</div>
                            </td>
                            <td align="right" style="padding: 16px 0; color: #0f172a; font-size: 15px; font-weight: 700;">
                              Rp{data['subtotal']:,}
                            </td>
                          </tr>
            """
        
        html_content += f"""
                        </tbody>
                      </table>

                      <!-- Summary Section -->
                      <div style="background-color: #f8fafc; border-radius: 16px; padding: 20px;">
                        <div style="display: table; width: 100%; margin-bottom: 8px;">
                          <div style="display: table-cell; color: #64748b; font-size: 14px; font-weight: 500;">Subtotal</div>
                           <div style="display: table-cell; text-align: right; color: #1e293b; font-size: 14px; font-weight: 700;">Rp{subtotal:,}</div>
                        </div>
                        <div style="display: table; width: 100%; margin-bottom: 16px;">
                          <div style="display: table-cell; color: #f472b6; font-size: 14px; font-weight: 600;">Infaq/Sedekah (2.5%)</div>
                          <div style="display: table-cell; text-align: right; color: #f472b6; font-size: 14px; font-weight: 700;">Rp{infaq:,}</div>
                        </div>
                        <div style="border-top: 1px solid #e2e8f0; padding-top: 16px; display: table; width: 100%;">
                          <div style="display: table-cell; color: #0f172a; font-size: 16px; font-weight: 800; text-transform: uppercase;">Total Pembayaran</div>
                           <div style="display: table-cell; text-align: right; color: #1ca3f4; font-size: 20px; font-weight: 800;">Rp{total_bayar:,}</div>
                        </div>
                      </div>

                      <div style="margin-top: 32px; text-align: center;">
                        <p style="margin: 0; color: #94a3b8; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.1em;">
                          Dicetak secara digital pada {datetime.now().strftime('%d %b %Y %H:%M')}
                        </p>
                      </div>
                    </div>

                    <!-- Footer -->
                    <div style="background-color: #f1f5f9; padding: 24px; text-align: center;">
                      <p style="margin: 0; color: #64748b; font-size: 12px; font-weight: 500; line-height: 1.5;">
                        Member berkah, transaksi cerah.<br>
                        <strong>Adhar Coffe - Sharia Certified POS</strong>
                      </p>
                    </div>

                  </div>
                </td>
              </tr>
            </table>
          </body>
        </html>
        """
        
        part = MIMEText(html_content, "html")
        msg.attach(part)
        
        server = smtplib.SMTP_SSL('smtp.gmail.com', 465)
        server.login(str(sender_email), str(sender_password))
        server.sendmail(str(sender_email), to_email, msg.as_string())
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

        # 3b. Auto-update table status to 'occupied'
        first_no_meja = items[0].no_meja if items else None
        if first_no_meja:
            _init_table_status()
            _table_status[str(first_no_meja)] = "occupied"

        
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
                
                total_infaq = sum(int(item.infaq or 0) for item in items)
                total_bayar_final = total_bayar + total_infaq
                background_tasks.add_task(send_receipt_email_task, to_email, order_summary, total_bayar, total_infaq, total_bayar_final, nama_pembeli)
            except Exception as email_prep_error:
                print(f"EMAIL PREP ERROR: {email_prep_error}")
        
        # 4. OTOMATISASI JURNAL AKUNTANSI
        try:
            # Hitung total HPP dan total penjualan
            total_hpp = sum(int(item.hpp or 0) for item in items)
            # total_bayar already accumulated above
            metode = (items[0].metode_pembayaran or "Tunai").lower() if items else "tunai"
            nama_customer = items[0].nama_pembeli if items else "Customer"
            tanggal_skrg = datetime.now().strftime("%Y-%m-%d")

            # Fetch semua akun sekali
            res_akun = sb.table("akun").select("id, nama_akun, kode_akun").execute()
            akun_list = res_akun.data or []

            def find_akun(*keywords):
                """Cari akun id yang namanya mengandung salah satu keyword (case-insensitive)."""
                for kw in keywords:
                    for a in akun_list:
                        if kw.lower() in a['nama_akun'].lower():
                            return a['id']
                return None
            # Penentuan akun Kas vs Bank berdasarkan metode pembayaran
            if any(k in metode for k in ["transfer", "bank", "bni", "bri", "mandiri", "bca", "debit"]):
                id_kas_bank = find_akun("bank", "rekening", "tabungan")
            else:
                id_kas_bank = find_akun("kas", "cash")
                if not id_kas_bank:
                    id_kas_bank = find_akun("bank")  # fallback

            id_pendapatan   = find_akun("pendapatan usaha", "pendapatan penjualan", "penjualan", "revenue")
            id_hpp_akun     = find_akun("harga pokok penjualan", "beban pokok", "harga pokok", "hpp", "beban bahan", "cogs")
            id_persediaan   = find_akun("persediaan", "inventory", "stok bahan")
            id_infaq        = find_akun("titipan infaq", "infaq", "sedekah")  # Kewajiban - bukan pendapatan

            # Final Total including Infaq for Kas/Bank entry
            total_infaq = sum(int(item.infaq or 0) for item in items)
            total_pembayaran_final = total_bayar + total_infaq

            print(f"JURNAL AKUN IDs -> kas/bank:{id_kas_bank}, pendapatan:{id_pendapatan}, hpp:{id_hpp_akun}, persediaan:{id_persediaan}, infaq:{id_infaq}")

            # ── Consolidated Journal Entry ────────────────────────────────
            # Debit: Kas/Bank (total_pembayaran_final)
            # Credit: Pendapatan Usaha (total_bayar)
            # Credit: Infaq/Pendapatan Lain (total_infaq)
            # Debit: HPP (total_hpp)
            # Credit: Inventory (total_hpp)
            
            if (id_kas_bank and id_pendapatan and total_bayar > 0) or (id_hpp_akun and id_persediaan and total_hpp > 0):
                res_j = sb.table("jurnal").insert({
                    "tanggal": tanggal_skrg,
                    "keterangan": f"Transaksi Penjualan: {nama_customer} | {items[0].metode_pembayaran if items else 'Tunai'}"
                }).execute()
                
                if res_j.data:
                    jid = res_j.data[0]['id']
                    j_details = []
                    
                    # 1. Entry Kas/Bank vs Revenue & Infaq
                    if id_kas_bank and id_pendapatan and total_bayar > 0:
                        # Total Debit to Kas
                        j_details.append({"jurnal_id": jid, "akun_id": id_kas_bank, "tipe": "Debit", "nominal": total_pembayaran_final})
                        # Credit to Revenue
                        j_details.append({"jurnal_id": jid, "akun_id": id_pendapatan, "tipe": "Kredit", "nominal": total_bayar})
                        # Credit to Infaq (if exists, else Revenue)
                        if total_infaq > 0:
                            target_infaq_akun = id_infaq if id_infaq else id_pendapatan
                            j_details.append({"jurnal_id": jid, "akun_id": target_infaq_akun, "tipe": "Kredit", "nominal": total_infaq})
                    
                    # 2. Entry HPP vs Inventory
                    if id_hpp_akun and id_persediaan and total_hpp > 0:
                        j_details.append({"jurnal_id": jid, "akun_id": id_hpp_akun, "tipe": "Debit", "nominal": total_hpp})
                        j_details.append({"jurnal_id": jid, "akun_id": id_persediaan, "tipe": "Kredit", "nominal": total_hpp})
                    
                    if j_details:
                        sb.table("jurnal_detail").insert(j_details).execute()
                        print(f"CONSOLIDATED JURNAL CREATED: id={jid} with {len(j_details)} details")
            else:
                print("JURNAL SKIPPED — insufficient accounts or zero totals")
        except Exception as jurnal_err:
            print(f"AUTO JURNAL ERROR: {jurnal_err}")
            # Tidak gagalkan whole transaction jika jurnal error

                
        return {"message": "Transaksi berhasil disimpan, stok diperbarui, dan jurnal dibuat", "data": res.data}
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
        
        # 1. Get account names for legacy display/compatibility
        res_accs = sb.table("akun").select("*").in_("id", [data.akun_id_debit, data.akun_id_kredit]).execute()
        acc_map = {a['id']: a['nama_akun'] for a in res_accs.data}
        
        # 2. Insert into pengeluaran_operasional (Legacy table)
        res_exp = sb.table("pengeluaran_operasional").insert({
            "akun": acc_map.get(data.akun_id_debit, "Beban"),
            "nominal": data.nominal,
            "tanggal": data.tanggal,
            "keterangan": data.keterangan,
            "akun_id_debit": data.akun_id_debit,
            "akun_id_kredit": data.akun_id_kredit
        }).execute()

        # 3. Create Balanced Journal Entry
        res_j = sb.table("jurnal").insert({
            "tanggal": data.tanggal,
            "keterangan": f"Biaya: {data.keterangan or acc_map.get(data.akun_id_debit)}"
        }).execute()
        
        if res_j.data:
            jid = res_j.data[0]['id']
            sb.table("jurnal_detail").insert([
                {"jurnal_id": jid, "akun_id": data.akun_id_debit, "tipe": "Debit", "nominal": data.nominal},
                {"jurnal_id": jid, "akun_id": data.akun_id_kredit, "tipe": "Kredit", "nominal": data.nominal}
            ]).execute()

        return res_exp.data[0]
    except Exception as e:
        error_msg = str(e)
        print(f"ADD EXPENSE ERROR: {error_msg}")
        # Memberikan detail error database jika ada (misal: kolom kurang atau constraint error)
        raise HTTPException(
            status_code=500, 
            detail=f"Gagal menyimpan pengeluaran: {error_msg}. Pastikan database sudah diperbarui."
        )

@app.delete("/api/pengeluaran/{id}")
async def delete_pengeluaran(id: int):
    try:
        sb = get_supabase()
        sb.table("pengeluaran_operasional").delete().eq("id", id).execute()
        return {"status": "success"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# --- Aset & Ekuitas Endpoints ---
@app.get("/api/aset")
async def get_aset():
    try:
        sb = get_supabase()
        res = sb.table("aset").select("*").order("tanggal", desc=True).execute()
        return res.data or []
    except Exception as e:
        print(f"GET ASET ERROR: {e}")
        return []

@app.post("/api/aset")
async def add_aset(data: Aset):
    try:
        sb = get_supabase()
        res = sb.table("aset").insert({
            "nama_aset": data.nama_aset,
            "kategori_aset": data.kategori_aset,
            "nominal": data.nominal,
            "tanggal": data.tanggal,
            "keterangan": data.keterangan
        }).execute()
        return res.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/api/aset/{id}")
async def delete_aset(id: int):
    try:
        sb = get_supabase()
        sb.table("aset").delete().eq("id", id).execute()
        return {"status": "success"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/ekuitas")
async def get_ekuitas():
    try:
        sb = get_supabase()
        res = sb.table("ekuitas").select("*").order("tanggal", desc=True).execute()
        return res.data or []
    except Exception as e:
        print(f"GET EKUITAS ERROR: {e}")
        return []

@app.post("/api/ekuitas")
async def add_ekuitas(data: Ekuitas):
    try:
        sb = get_supabase()
        res = sb.table("ekuitas").insert({
            "nama_modal": data.nama_modal,
            "nominal": data.nominal,
            "tanggal": data.tanggal,
            "keterangan": data.keterangan
        }).execute()
        return res.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/api/ekuitas/{id}")
async def delete_ekuitas(id: int):
    try:
        sb = get_supabase()
        sb.table("ekuitas").delete().eq("id", id).execute()
        return {"status": "success"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# --- Infaq / Penyaluran ---
@app.get("/api/infaq/saldo")
async def get_saldo_infaq():
    """Hitung saldo Titipan Infaq (total dikumpulkan - total disalurkan)"""
    try:
        sb = get_supabase()
        # Cari akun Titipan Infaq
        akun_res = sb.table("akun").select("id, nama_akun").ilike("nama_akun", "%titipan infaq%").execute()
        if not akun_res.data:
            return {"saldo": 0, "info": "Akun Titipan Infaq tidak ditemukan"}

        infaq_akun_id = akun_res.data[0]["id"]

        # Total Kredit ke akun ini (infaq dikumpulkan dari penjualan)
        kredit_res = sb.table("jurnal_detail").select("nominal").eq("akun_id", infaq_akun_id).eq("tipe", "Kredit").execute()
        total_kredit = sum(r["nominal"] for r in (kredit_res.data or []))

        # Total Debit dari akun ini (infaq disalurkan)
        debit_res = sb.table("jurnal_detail").select("nominal").eq("akun_id", infaq_akun_id).eq("tipe", "Debit").execute()
        total_debit = sum(r["nominal"] for r in (debit_res.data or []))

        saldo = total_kredit - total_debit
        return {"saldo": saldo, "total_terkumpul": total_kredit, "total_disalurkan": total_debit}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/infaq/penyaluran")
async def get_penyaluran_infaq():
    """List riwayat penyaluran infaq"""
    try:
        sb = get_supabase()
        res = sb.table("penyaluran_infaq").select("*").order("tanggal", desc=True).execute()
        return res.data or []
    except Exception as e:
        print(f"GET PENYALURAN INFAQ ERROR: {e}")
        return []

@app.post("/api/infaq/salurkan")
async def salurkan_infaq(data: PenyaluranInfaq):
    """
    Jurnal Pembalik saat infaq disalurkan:
    (D) Titipan Infaq  Rp xxx  <- mengurangi kewajiban
    (K) Kas            Rp xxx  <- keluar kas
    """
    try:
        sb = get_supabase()
        tanggal_skrg = data.tanggal or datetime.now().strftime("%Y-%m-%d")

        # Cek saldo mencukupi
        saldo_res = await get_saldo_infaq()
        if saldo_res["saldo"] < data.nominal:
            raise HTTPException(
                status_code=400,
                detail=f"Saldo Titipan Infaq tidak mencukupi. Saldo tersedia: Rp {saldo_res['saldo']:,}"
            )

        # Ambil ID akun
        akun_res = sb.table("akun").select("id, nama_akun").execute()
        akun_list = akun_res.data or []

        def find_id(*keywords):
            for kw in keywords:
                for a in akun_list:
                    if kw.lower() in a["nama_akun"].lower():
                        return a["id"]
            return None

        id_titipan_infaq = find_id("titipan infaq", "infaq")
        id_kas = find_id("kas")

        if not id_titipan_infaq or not id_kas:
            raise HTTPException(status_code=400, detail="Akun Titipan Infaq atau Kas tidak ditemukan")

        # Simpan ke tabel penyaluran_infaq
        try:
            sb.table("penyaluran_infaq").insert({
                "nominal": data.nominal,
                "tanggal": tanggal_skrg,
                "keterangan": data.keterangan,
                "penerima": data.penerima
            }).execute()
        except Exception:
            pass  # Tabel mungkin belum ada, tidak gagalkan jurnal

        # Buat Jurnal Pembalik
        res_j = sb.table("jurnal").insert({
            "tanggal": tanggal_skrg,
            "keterangan": f"Penyaluran Infaq kepada {data.penerima or 'Penerima'}: {data.keterangan or ''}"
        }).execute()

        if res_j.data:
            jid = res_j.data[0]["id"]
            sb.table("jurnal_detail").insert([
                {"jurnal_id": jid, "akun_id": id_titipan_infaq, "tipe": "Debit",  "nominal": data.nominal},
                {"jurnal_id": jid, "akun_id": id_kas,            "tipe": "Kredit", "nominal": data.nominal}
            ]).execute()

        return {
            "message": f"Infaq Rp {data.nominal:,} berhasil disalurkan kepada {data.penerima or 'Penerima'}",
            "jurnal_id": res_j.data[0]["id"] if res_j.data else None
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# --- Accounting & Journal Endpoints ---
@app.get("/api/akun")
async def get_akun():
    try:
        sb = get_supabase()
        res = sb.table("akun").select("*").order("kode_akun", desc=False).execute()
        return res.data or []
    except Exception as e:
        print(f"GET AKUN ERROR: {e}")
        return []

@app.post("/api/akun")
async def add_akun(data: dict):
    try:
        sb = get_supabase()
        res = sb.table("akun").insert(data).execute()
        return res.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/jurnal")
async def add_jurnal(request: JurnalRequest):
    try:
        sb = get_supabase()
        
        # Validation: Sum Debit must equal Sum Kredit
        total_debit = sum(item.nominal for item in request.items if item.tipe == 'Debit')
        total_kredit = sum(item.nominal for item in request.items if item.tipe == 'Kredit')
        
        if total_debit != total_kredit:
            raise HTTPException(status_code=400, detail=f"Jurnal tidak seimbang! Total Debit ({total_debit}) != Total Kredit ({total_kredit})")
        
        # 1. Insert Jurnal Header
        res_j = sb.table("jurnal").insert({
            "tanggal": request.tanggal,
            "keterangan": request.keterangan
        }).execute()
        
        if not res_j.data:
            raise Exception("Gagal membuat header jurnal")
            
        jurnal_id = res_j.data[0]['id']
        
        # 2. Insert Jurnal Details
        details_to_insert = [
            {
                "jurnal_id": jurnal_id,
                "akun_id": item.akun_id,
                "tipe": item.tipe,
                "nominal": item.nominal
            } for item in request.items
        ]
        
        sb.table("jurnal_detail").insert(details_to_insert).execute()
        
        return {"status": "success", "jurnal_id": jurnal_id}
    except HTTPException:
        raise
    except Exception as e:
        print(f"ADD JURNAL ERROR: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/jurnal")
async def get_jurnal():
    try:
        sb = get_supabase()
        res = sb.table("jurnal").select("*, jurnal_detail(*, akun(*))").order("tanggal", desc=True).execute()
        return res.data or []
    except Exception as e:
        print(f"GET JURNAL ERROR: {e}")
        return []

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

        # Ledger Balance Calculation (Asset, Equity, etc)
        # 1. Fetch all journal details
        journal_data = []
        try:
            res_j = sb.table("jurnal_detail").select("*, akun(*)").execute()
            journal_data = res_j.data or []
        except: pass
        
        balances = {"Aset": 0, "Kewajiban": 0, "Ekuitas": 0, "Pendapatan": 0, "Beban": 0}
        total_persediaan = 0
        
        for det in journal_data:
            cat = det['akun']['kategori']
            normal = det['akun']['saldo_normal']
            nominal = int(det['nominal'])
            nama_akun = det['akun']['nama_akun'].lower()
            
            val = nominal if det['tipe'] == normal else -nominal
            balances[cat] += val
            
            # Khusus untuk Persediaan (Aset)
            if 'persediaan' in nama_akun:
                total_persediaan += val

        total_aset = balances["Aset"]
        total_kewajiban = balances["Kewajiban"]
        total_ekuitas_awal = balances["Ekuitas"]
        
        # --- Hitung Arus Kas Keluar untuk Pembelian Persediaan (Cash Out) ---
        # Mencari jurnal yang mendebit Persediaan dan mengkredit Kas/Bank
        total_pembelian_persediaan = 0
        j_pers_debit = {} # {jurnal_id: nominal}
        j_kas_kredit = set()
        
        for det in journal_data:
            jid = det['jurnal_id']
            nama_akun = det['akun']['nama_akun'].lower()
            if 'persediaan' in nama_akun and det['tipe'] == 'Debit':
                j_pers_debit[jid] = j_pers_debit.get(jid, 0) + int(det['nominal'])
            if ('kas' in nama_akun or 'bank' in nama_akun) and det['tipe'] == 'Kredit':
                j_kas_kredit.add(jid)
        
        for jid, nominal in j_pers_debit.items():
            if jid in j_kas_kredit:
                total_pembelian_persediaan += nominal
        
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
                "profit": daily_stats[date]["profit"] - daily_stats[date]["operational_expense"], # Daily profit adjusted for COGS and OpEx
                "expense": daily_stats[date]["expense"], # This is purely HPP/COGS
                "operasional": daily_stats[date]["operational_expense"] # This is exclusively Operational Expenses
            })

        # Final Profit = (Sales - HPP) - Operational Expenses
        total_infaq = sum(int(t.get("infaq") or 0) for t in data)
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
            "total_infaq": total_infaq,
            "total_profit": total_profit,
            "total_aset": total_aset,
            "total_kewajiban": total_kewajiban,
            "total_ekuitas_awal": total_ekuitas_awal,
            "total_persediaan": total_persediaan,
            "total_pembelian_persediaan": total_pembelian_persediaan,
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
        # Include waiting, processing, and recently completed (last 5 mins)
        # However, for simplicity and reactive UI, let's just include all that are not older than 1 hour if completed
        res = sb.table("transaksi").select("id, nama_pembeli, no_meja, status, created_at").order("created_at", desc=False).execute()
        
        # client side filtering for public safety and noise reduction
        all_data = res.data or []
        filtered = [
            o for o in all_data 
            if o["status"] in ["waiting", "processing"] or 
            (o["status"] == "completed" and (datetime.utcnow() - datetime.fromisoformat(o["created_at"].replace('Z', '+00:00')).replace(tzinfo=None)).total_seconds() < 300)
        ]
        return filtered
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

@app.post("/api/orders/{order_id}/resend-email")
async def resend_order_email(order_id: int, background_tasks: BackgroundTasks):
    sb = get_supabase()
    try:
        # Get all related transactions for this checkout
        # We need to find other items in the same "session" (same created_at and nama_pembeli)
        base_res = sb.table("transaksi").select("*").eq("id", order_id).execute()
        if not base_res.data:
            raise HTTPException(status_code=404, detail="Order not found")
        
        base_order = base_res.data[0]
        to_email = base_order.get("kontak")
        
        if not to_email or "@" not in to_email:
            raise HTTPException(status_code=400, detail="No valid email associated with this order")
            
        # Fetch all items in the same group
        all_items_res = sb.table("transaksi").select("*").eq("created_at", base_order["created_at"]).eq("nama_pembeli", base_order["nama_pembeli"]).execute()
        items = all_items_res.data or []
        
        # Prepare data for email task
        # 1. Fetch menu names
        res_menu = sb.table("menu").select("id, nama_menu").execute()
        menu_lookup = {m['id']: m['nama_menu'] for m in (res_menu.data or [])}
        
        order_summary = {}
        total_bayar = 0
        total_infaq = 0
        
        for item in items:
            name = menu_lookup.get(item["kuantitas_menu"], f"Item #{item['kuantitas_menu']}")
            price = item["harga"]
            total_bayar += price
            total_infaq += int(item.get("infaq") or 0)
            
            if name not in order_summary:
                order_summary[name] = {"qty": 0, "price": price, "subtotal": 0}
            order_summary[name]["qty"] += 1
            order_summary[name]["subtotal"] += price
            
        total_bayar_final = total_bayar + total_infaq
        nama_pembeli = base_order["nama_pembeli"]
        
        background_tasks.add_task(send_receipt_email_task, to_email, order_summary, total_bayar, total_infaq, total_bayar_final, nama_pembeli)
        
        return {"message": f"Email confirmation resent to {to_email}"}
    except Exception as e:
        print(f"RESEND EMAIL ERROR: {e}")
        raise HTTPException(status_code=500, detail=str(e))



# --- INFAQ ENDPOINTS ---

@app.get("/api/infaq/stats")
async def get_infaq_stats():
    sb = get_supabase()
    try:
        # 1. Total Penerimaan from 'transaksi'
        trans = sb.table("transaksi").select("infaq").execute()
        total_penerimaan = sum(int(t.get("infaq") or 0) for t in (trans.data or []))

        # 2. Total Penyaluran from 'penyaluran_infaq'
        disb = sb.table("penyaluran_infaq").select("nominal").execute()
        total_penyaluran = sum(int(d.get("nominal") or 0) for d in (disb.data or []))

        return {
            "total_penerimaan": total_penerimaan,
            "total_penyaluran": total_penyaluran,
            "saldo_akhir": total_penerimaan - total_penyaluran
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Infaq Stats Error: {str(e)}")

@app.get("/api/infaq/logs")
async def get_infaq_logs():
    sb = get_supabase()
    try:
        # Combined logs for receipts and disbursements
        # Receipts (from transaksi where infaq > 0)
        res_penerimaan = sb.table("transaksi").select("id, created_at, infaq, nama_pembeli").gt("infaq", 0).execute()
        logs_penerimaan = []
        for r in (res_penerimaan.data or []):
            logs_penerimaan.append({
                "id": f"IN-{r['id']}",
                "tipe": "Penerimaan",
                "tanggal": r["created_at"][:10],
                "nominal": r["infaq"],
                "keterangan": f"Infaq dari {r['nama_pembeli']}",
                "penerima": "-"
            })

        # Disbursements
        res_penyaluran = sb.table("penyaluran_infaq").select("*").execute()
        logs_penyaluran = []
        for p in (res_penyaluran.data or []):
            logs_penyaluran.append({
                "id": f"OUT-{p['id']}",
                "tipe": "Penyaluran",
                "tanggal": p["tanggal"],
                "nominal": p["nominal"],
                "keterangan": p["keterangan"],
                "penerima": p["penerima"]
            })

        all_logs = sorted(logs_penerimaan + logs_penyaluran, key=lambda x: x["tanggal"], reverse=True)
        return all_logs
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Infaq Logs Error: {str(e)}")

@app.post("/api/infaq/disburse")
async def add_infaq_disbursement(data: PenyaluranInfaq):
    sb = get_supabase()
    try:
        res = sb.table("penyaluran_infaq").insert({
            "nominal": data.nominal,
            "tanggal": data.tanggal,
            "keterangan": data.keterangan,
            "penerima": data.penerima
        }).execute()
        return res.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Infaq Disbursement Error: {str(e)}")

# ─────────────────────────────────────────────
#  TABLE STATUS MANAGEMENT
#  3 states: 'available', 'occupied', 'served'
#  'served'   = food is done, waiting for staff to clear
#  'available' = table cleared by staff, ready for next customer
# ─────────────────────────────────────────────

# In-memory store: { table_id (str): status (str) }
_table_status: dict = {}

def _init_table_status():
    """Initialise default status for all tables (1-28) if not already set."""
    for t in range(1, 29):
        _table_status.setdefault(str(t), "available")

def _sync_table_status_from_db():
    """Update in-memory table statuses based on active orders in database."""
    try:
        sb = get_supabase()
        # Mark as 'occupied' if there's any active order (waiting or processing)
        res = sb.table("transaksi").select("no_meja, status").in_("status", ["waiting", "processing"]).execute()
        for row in (res.data or []):
            meja = str(row.get("no_meja") or "")
            if meja and meja not in ("", "None", "null"):
                if _table_status.get(meja) == "available":
                    _table_status[meja] = "occupied"
    except Exception as e:
        print(f"Table status sync error: {e}")

_init_table_status()

@app.get("/api/tables/status")
async def get_all_table_status():
    """Return current status of every table, synced with DB."""
    _init_table_status()
    _sync_table_status_from_db()
    return _table_status

@app.get("/api/tables/occupied")
async def get_occupied_tables():
    """Return list of table IDs that are currently 'occupied' (backward-compat)."""
    _init_table_status()
    _sync_table_status_from_db()
    occupied = [int(k) for k, v in _table_status.items() if v in ("occupied", "served")]
    return occupied

class TableStatusUpdate(BaseModel):
    status: str  # 'available', 'occupied', 'served'

@app.put("/api/tables/{table_id}/status")
async def update_table_status(table_id: str, body: TableStatusUpdate):
    """Update the status of a specific table. Staff uses this to mark tables as available."""
    allowed = {"available", "occupied", "served"}
    if body.status not in allowed:
        raise HTTPException(status_code=400, detail=f"Status must be one of {allowed}")
    _table_status[table_id] = body.status
    return {"table_id": table_id, "status": body.status}

 

