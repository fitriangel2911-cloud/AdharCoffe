import React, { useState, useEffect } from 'react';
import { 
    Plus, 
    Trash2, 
    BookOpen, 
    Save, 
    AlertCircle,
    CheckCircle2,
    Calendar,
    FileText,
    Loader2,
    History,
    ArrowRightLeft,
    PlusCircle
} from 'lucide-react';

export default function AccountingJournal() {
    const [accounts, setAccounts] = useState([]);
    const [journals, setJournals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    
    const [formData, setFormData] = useState({
        tanggal: new Date().toISOString().split('T')[0],
        keterangan: '',
        items: [
            { akun_id: '', tipe: 'Debit', nominal: '' },
            { akun_id: '', tipe: 'Kredit', nominal: '' }
        ]
    });

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        setLoading(true);
        try {
            const [accRes, jRes] = await Promise.all([
                fetch('/api/akun'),
                fetch('/api/jurnal')
            ]);
            setAccounts(await accRes.json());
            setJournals(await jRes.json());
        } catch (error) {
            console.error("Error loading accounting data:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddItem = () => {
        setFormData({
            ...formData,
            items: [...formData.items, { akun_id: '', tipe: 'Debit', nominal: '' }]
        });
    };

    const handleRemoveItem = (index) => {
        if (formData.items.length <= 2) return;
        const newItems = formData.items.filter((_, i) => i !== index);
        setFormData({ ...formData, items: newItems });
    };

    const handleItemChange = (index, field, value) => {
        const newItems = [...formData.items];
        newItems[index][field] = value;
        setFormData({ ...formData, items: newItems });
    };

    const totalDebit = formData.items.reduce((sum, item) => item.tipe === 'Debit' ? sum + Number(item.nominal || 0) : sum, 0);
    const totalKredit = formData.items.reduce((sum, item) => item.tipe === 'Kredit' ? sum + Number(item.nominal || 0) : sum, 0);
    const isBalanced = totalDebit === totalKredit && totalDebit > 0;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!isBalanced) return alert("Total Debit dan Kredit harus seimbang!");
        
        setIsSaving(true);
        try {
            const res = await fetch('/api/jurnal', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            
            if (res.ok) {
                setFormData({
                    tanggal: new Date().toISOString().split('T')[0],
                    keterangan: '',
                    items: [
                        { akun_id: '', tipe: 'Debit', nominal: '' },
                        { akun_id: '', tipe: 'Kredit', nominal: '' }
                    ]
                });
                fetchInitialData();
            } else {
                const err = await res.json();
                alert(err.detail || "Gagal menyimpan jurnal");
            }
        } catch (error) {
            console.error("Submit Journal Error:", error);
        } finally {
            setIsSaving(false);
        }
    };

    const formatRp = (num) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num);

    const handleInitializeAccounts = async () => {
        if (!window.confirm("Ingin membuat daftar akun standar lengkap untuk kafe Adhar Coffe?")) return;
        try {
            const basicAccounts = [
                // 1xxx - ASET LANCAR
                { kode_akun: '1-1100', nama_akun: 'Kas Utama', kategori: 'Aset', saldo_normal: 'Debit' },
                { kode_akun: '1-1200', nama_akun: 'Kas di Bank', kategori: 'Aset', saldo_normal: 'Debit' },
                { kode_akun: '1-2100', nama_akun: 'Piutang Usaha', kategori: 'Aset', saldo_normal: 'Debit' },
                { kode_akun: '1-3100', nama_akun: 'Persediaan Bahan Baku (Kopi & Susu)', kategori: 'Aset', saldo_normal: 'Debit' },
                { kode_akun: '1-3200', nama_akun: 'Persediaan Makanan & Snack', kategori: 'Aset', saldo_normal: 'Debit' },
                { kode_akun: '1-3300', nama_akun: 'Persediaan Perlengkapan (Cup, Paper, dll)', kategori: 'Aset', saldo_normal: 'Debit' },
                { kode_akun: '1-4100', nama_akun: 'Sewa Dibayar Dimuka', kategori: 'Aset', saldo_normal: 'Debit' },
                { kode_akun: '1-4200', nama_akun: 'Asuransi Dibayar Dimuka', kategori: 'Aset', saldo_normal: 'Debit' },
                
                // 1xxx - ASET TETAP
                { kode_akun: '1-5100', nama_akun: 'Tanah', kategori: 'Aset', saldo_normal: 'Debit' },
                { kode_akun: '1-5200', nama_akun: 'Bangunan & Renovasi', kategori: 'Aset', saldo_normal: 'Debit' },
                { kode_akun: '1-5300', nama_akun: 'Mesin Kopi & Grinder', kategori: 'Aset', saldo_normal: 'Debit' },
                { kode_akun: '1-5400', nama_akun: 'Peralatan Dapur & Bar', kategori: 'Aset', saldo_normal: 'Debit' },
                { kode_akun: '1-5500', nama_akun: 'Furniture (Meja & Kursi)', kategori: 'Aset', saldo_normal: 'Debit' },
                { kode_akun: '1-5600', nama_akun: 'Peralatan Elektronik & POS', kategori: 'Aset', saldo_normal: 'Debit' },
                { kode_akun: '1-5900', nama_akun: 'Akumulasi Penyusutan Aset Tetap', kategori: 'Aset', saldo_normal: 'Kredit' },

                // 2xxx - KEWAJIBAN
                { kode_akun: '2-1100', nama_akun: 'Hutang Dagang (Supplier)', kategori: 'Kewajiban', saldo_normal: 'Kredit' },
                { kode_akun: '2-1200', nama_akun: 'Hutang Gaji & Upah', kategori: 'Kewajiban', saldo_normal: 'Kredit' },
                { kode_akun: '2-1300', nama_akun: 'Hutang Pajak (PPN)', kategori: 'Kewajiban', saldo_normal: 'Kredit' },
                { kode_akun: '2-1400', nama_akun: 'Hutang Biaya Operasional', kategori: 'Kewajiban', saldo_normal: 'Kredit' },
                { kode_akun: '2-2100', nama_akun: 'Hutang Bank Jangka Panjang', kategori: 'Kewajiban', saldo_normal: 'Kredit' },
                
                // 3xxx - EKUITAS
                { kode_akun: '3-1100', nama_akun: 'Modal Pemilik', kategori: 'Ekuitas', saldo_normal: 'Kredit' },
                { kode_akun: '3-1200', nama_akun: 'Prive Pemilik', kategori: 'Ekuitas', saldo_normal: 'Debit' },
                { kode_akun: '3-2100', nama_akun: 'Laba Ditahan', kategori: 'Ekuitas', saldo_normal: 'Kredit' },
                { kode_akun: '3-2200', nama_akun: 'Laba Tahun Berjalan', kategori: 'Ekuitas', saldo_normal: 'Kredit' },
                
                // 4xxx - PENDAPATAN
                { kode_akun: '4-1100', nama_akun: 'Pendapatan Penjualan Kopi', kategori: 'Pendapatan', saldo_normal: 'Kredit' },
                { kode_akun: '4-1200', nama_akun: 'Pendapatan Penjualan Makanan', kategori: 'Pendapatan', saldo_normal: 'Kredit' },
                { kode_akun: '4-1300', nama_akun: 'Pendapatan Penjualan Merchandise', kategori: 'Pendapatan', saldo_normal: 'Kredit' },
                { kode_akun: '4-2100', nama_akun: 'Pendapatan Jasa / Sewa Ruang', kategori: 'Pendapatan', saldo_normal: 'Kredit' },
                { kode_akun: '4-9100', nama_akun: 'Pendapatan Lain-lain', kategori: 'Pendapatan', saldo_normal: 'Kredit' },

                // 5xxx - HARGA POKOK PENJUALAN (HPP)
                { kode_akun: '5-1100', nama_akun: 'HPP - Bahan Baku Kopi', kategori: 'Beban', saldo_normal: 'Debit' },
                { kode_akun: '5-1200', nama_akun: 'HPP - Bahan Baku Makanan', kategori: 'Beban', saldo_normal: 'Debit' },
                { kode_akun: '5-1300', nama_akun: 'Beban Kerusakan / Waste Bahan', kategori: 'Beban', saldo_normal: 'Debit' },

                // 6xxx - BEBAN OPERASIONAL
                { kode_akun: '6-1100', nama_akun: 'Beban Gaji Karyawan', kategori: 'Beban', saldo_normal: 'Debit' },
                { kode_akun: '6-1200', nama_akun: 'Beban Listrik', kategori: 'Beban', saldo_normal: 'Debit' },
                { kode_akun: '6-1300', nama_akun: 'Beban Air & Kebersihan', kategori: 'Beban', saldo_normal: 'Debit' },
                { kode_akun: '6-1400', nama_akun: 'Beban Internet & Telepon', kategori: 'Beban', saldo_normal: 'Debit' },
                { kode_akun: '6-1500', nama_akun: 'Beban Keamanan', kategori: 'Beban', saldo_normal: 'Debit' },
                { kode_akun: '6-2100', nama_akun: 'Beban Pemasaran & Promo', kategori: 'Beban', saldo_normal: 'Debit' },
                { kode_akun: '6-2200', nama_akun: 'Beban Diskon Penjualan', kategori: 'Beban', saldo_normal: 'Debit' },
                { kode_akun: '6-2300', nama_akun: 'Beban Sewa', kategori: 'Beban', saldo_normal: 'Debit' },
                { kode_akun: '6-2400', nama_akun: 'Beban Asuransi', kategori: 'Beban', saldo_normal: 'Debit' },
                { kode_akun: '6-3100', nama_akun: 'Beban ATK & Administrasi', kategori: 'Beban', saldo_normal: 'Debit' },
                { kode_akun: '6-3200', nama_akun: 'Beban Perbaikan & Pemeliharaan', kategori: 'Beban', saldo_normal: 'Debit' },
                { kode_akun: '6-3300', nama_akun: 'Beban Perizinan Usaha', kategori: 'Beban', saldo_normal: 'Debit' },
                { kode_akun: '6-4100', nama_akun: 'Beban Penyusutan Aset Tetap', kategori: 'Beban', saldo_normal: 'Debit' },
                { kode_akun: '6-9100', nama_akun: 'Beban Bunga Bank', kategori: 'Beban', saldo_normal: 'Debit' },
                { kode_akun: '6-9200', nama_akun: 'Beban Pajak Penghasilan', kategori: 'Beban', saldo_normal: 'Debit' },
                { kode_akun: '6-9900', nama_akun: 'Beban Administrasi Bank / Biaya Admin POS', kategori: 'Beban', saldo_normal: 'Debit' }
            ];
            
            for (const acc of basicAccounts) {
                // Fix: map 'modal' to 'nama_akun' if exists
                const finalAcc = { ...acc, nama_akun: acc.nama_akun || acc.modal };
                delete finalAcc.modal;

                await fetch('/api/akun', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(finalAcc)
                });
            }
            alert("Inisialisasi akun lengkap selesai!");
            fetchInitialData();
        } catch (error) {
            console.error("Init error:", error);
            alert("Gagal inisialisasi. Pastikan tabel 'akun' sudah ada.");
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-emerald-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-100">
                        <BookOpen className="w-7 h-7" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-slate-800 italic tracking-tight uppercase">Jurnal Akuntansi Umum</h1>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Pencatatan Berpasangan (Debit & Kredit)</p>
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
                {/* Form Input Jurnal */}
                <div className="xl:col-span-12">
                    <form onSubmit={handleSubmit} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase pl-1">Tanggal Transaksi</label>
                                <div className="relative">
                                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                                    <input 
                                        type="date" required
                                        className="w-full bg-slate-50 border-none rounded-2xl py-4 pl-12 pr-4 text-sm font-bold focus:ring-2 focus:ring-emerald-500"
                                        value={formData.tanggal} onChange={e => setFormData({...formData, tanggal: e.target.value})}
                                    />
                                </div>
                            </div>
                            <div className="md:col-span-2 space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase pl-1">Keterangan Jurnal</label>
                                <div className="relative">
                                    <FileText className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                                    <input 
                                        type="text" required placeholder="Contoh: Setoran Modal Awal Kas"
                                        className="w-full bg-slate-50 border-none rounded-2xl py-4 pl-12 pr-4 text-sm font-bold focus:ring-2 focus:ring-emerald-500"
                                        value={formData.keterangan} onChange={e => setFormData({...formData, keterangan: e.target.value})}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Alert if no accounts */}
                        {accounts.length === 0 && (
                            <div className="bg-amber-50 border border-amber-200 p-6 rounded-[2rem] flex flex-col md:flex-row items-center justify-between gap-4">
                                <div className="flex items-center gap-4">
                                    <AlertCircle className="text-amber-500 w-8 h-8" />
                                    <div>
                                        <p className="text-sm font-black text-amber-800 uppercase tracking-tight">Daftar Akun Kosong</p>
                                        <p className="text-xs font-bold text-amber-600">Anda perlu membuat daftar akun sebelum bisa menginput jurnal.</p>
                                    </div>
                                </div>
                                <button 
                                    type="button" onClick={handleInitializeAccounts}
                                    className="bg-amber-500 text-white px-6 py-3 rounded-xl font-black text-[10px] uppercase shadow-lg shadow-amber-100"
                                >
                                    Buat Akun Standar Otomatis
                                </button>
                            </div>
                        )}

                        {/* Journal Items Table */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between px-4">
                                <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
                                    <ArrowRightLeft className="w-4 h-4 text-emerald-500" />
                                    Entri Jurnal
                                </h3>
                                <button 
                                    type="button" onClick={handleAddItem}
                                    className="flex items-center gap-2 bg-emerald-50 text-emerald-600 px-4 py-2 rounded-xl text-[10px] font-black hover:bg-emerald-100 transition-all"
                                >
                                    <PlusCircle size={14} /> TAMBAH BARIS
                                </button>
                            </div>

                            <div className="space-y-3">
                                <datalist id="accounts-list">
                                    {accounts.map(acc => (
                                        <option key={acc.id} value={`${acc.kode_akun} - ${acc.nama_akun}`} data-id={acc.id} />
                                    ))}
                                </datalist>
                                {formData.items.map((item, index) => (
                                    <div key={index} className="grid grid-cols-1 md:grid-cols-12 gap-3 group animate-in slide-in-from-left-2 duration-300" style={{ animationDelay: `${index * 50}ms` }}>
                                        <div className="md:col-span-5">
                                            <input 
                                                list="accounts-list"
                                                required
                                                placeholder="Ketik kode atau nama akun..."
                                                className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm font-bold focus:ring-2 focus:ring-emerald-500"
                                                value={accounts.find(a => a.id == item.akun_id) ? `${accounts.find(a => a.id == item.akun_id).kode_akun} - ${accounts.find(a => a.id == item.akun_id).nama_akun}` : item.temp_name || ''} 
                                                onChange={e => {
                                                    const val = e.target.value;
                                                    const matched = accounts.find(a => `${a.kode_akun} - ${a.nama_akun}` === val);
                                                    if (matched) {
                                                        handleItemChange(index, 'akun_id', matched.id);
                                                    } else {
                                                        const newItems = [...formData.items];
                                                        newItems[index].akun_id = '';
                                                        newItems[index].temp_name = val;
                                                        setFormData({...formData, items: newItems});
                                                    }
                                                }}
                                            />
                                        </div>
                                        <div className="md:col-span-3">
                                            <select 
                                                className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm font-bold focus:ring-2 focus:ring-emerald-500"
                                                value={item.tipe} onChange={e => handleItemChange(index, 'tipe', e.target.value)}
                                            >
                                                <option value="Debit">DEBIT</option>
                                                <option value="Kredit">KREDIT</option>
                                            </select>
                                        </div>
                                        <div className="md:col-span-3 relative">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-slate-400 text-xs">Rp</span>
                                            <input 
                                                type="number" required placeholder="0"
                                                className="w-full bg-slate-50 border-none rounded-2xl py-4 pl-10 pr-4 text-sm font-bold text-right focus:ring-2 focus:ring-emerald-500"
                                                value={item.nominal} onChange={e => handleItemChange(index, 'nominal', e.target.value)}
                                            />
                                        </div>
                                        <div className="md:col-span-1 flex items-center justify-center">
                                            <button 
                                                type="button" onClick={() => handleRemoveItem(index)}
                                                disabled={formData.items.length <= 2}
                                                className="p-3 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all disabled:opacity-0"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Summary & Footer */}
                        <div className="pt-8 border-t border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div className="flex gap-8">
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Debit</p>
                                    <p className="text-xl font-black text-slate-800">{formatRp(totalDebit)}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Kredit</p>
                                    <p className="text-xl font-black text-slate-800">{formatRp(totalKredit)}</p>
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-6">
                                <div className={`flex items-center gap-2 px-4 py-2 rounded-2xl ${isBalanced ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                                    {isBalanced ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                                    <span className="text-[10px] font-black uppercase tracking-wider">
                                        {isBalanced ? 'Jurnal Seimbang' : 'Belum Seimbang'}
                                    </span>
                                </div>
                                <button 
                                    disabled={!isBalanced || isSaving}
                                    className="bg-emerald-500 text-white px-8 py-4 rounded-2xl font-black text-sm shadow-xl shadow-emerald-100 hover:scale-[1.02] transition-all disabled:opacity-50 disabled:scale-100 flex items-center gap-3"
                                >
                                    {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                                    SIMPAN JURNAL
                                </button>
                            </div>
                        </div>
                    </form>
                </div>

                {/* Riwayat Jurnal */}
                <div className="xl:col-span-12 space-y-6">
                    <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
                        <div className="p-8 border-b border-slate-50 flex items-center justify-between">
                            <h3 className="font-black text-slate-800 flex items-center gap-2">
                                <History className="w-5 h-5 text-emerald-500" />
                                RIWAYAT JURNAL UMUM
                            </h3>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-slate-50/50">
                                    <tr>
                                        <th className="px-8 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Tanggal / Transaksi</th>
                                        <th className="px-8 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Akun</th>
                                        <th className="px-8 py-4 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Debit</th>
                                        <th className="px-8 py-4 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Kredit</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {loading ? (
                                        <tr>
                                            <td colSpan="4" className="px-8 py-20 text-center"><Loader2 size={24} className="mx-auto animate-spin text-slate-300" /></td>
                                        </tr>
                                    ) : journals.length === 0 ? (
                                        <tr>
                                            <td colSpan="4" className="px-8 py-20 text-center text-slate-300 font-bold italic">Belum ada transaksi jurnal</td>
                                        </tr>
                                    ) : journals.map(journal => (
                                        <React.Fragment key={journal.id}>
                                            <tr className="bg-slate-50/30">
                                                <td colSpan="4" className="px-8 py-3">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-3">
                                                            <Calendar size={14} className="text-slate-400" />
                                                            <span className="text-xs font-black text-slate-700 uppercase tracking-wider">{journal.tanggal}</span>
                                                            <span className="text-slate-200">|</span>
                                                            <span className="text-xs font-bold text-slate-500 italic">{journal.keterangan}</span>
                                                        </div>
                                                        <span className="text-[9px] font-black text-slate-300 uppercase">ID: #{journal.id}</span>
                                                    </div>
                                                </td>
                                            </tr>
                                            {journal.jurnal_detail.map((det, idx) => (
                                                <tr key={idx} className="hover:bg-slate-50/20 transition-colors">
                                                    <td className="px-8 py-3"></td>
                                                    <td className={`px-8 py-3 ${det.tipe === 'Kredit' ? 'pl-16' : ''}`}>
                                                        <p className="font-bold text-slate-700 text-sm">{det.akun?.nama_akun}</p>
                                                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{det.akun?.kode_akun}</p>
                                                    </td>
                                                    <td className="px-8 py-3 text-right">
                                                        <span className="font-black text-slate-800 text-sm">
                                                            {det.tipe === 'Debit' ? formatRp(det.nominal) : '-'}
                                                        </span>
                                                    </td>
                                                    <td className="px-8 py-3 text-right">
                                                        <span className="font-black text-slate-800 text-sm">
                                                            {det.tipe === 'Kredit' ? formatRp(det.nominal) : '-'}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </React.Fragment>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
