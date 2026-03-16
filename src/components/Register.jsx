import React, { useState } from 'react';
import { User, Mail, Lock, Store, ChefHat, Users, KeyRound, ChevronRight } from 'lucide-react';

export default function Register({ onRegister, onGoLogin }) {
    const [formData, setFormData] = useState({
        nama: '', email: '', password: '', confirm: '', role: 'Pelanggan', accessCode: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const STAFF_ACCESS_CODE = "ADHAR2024";

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (formData.password !== formData.confirm) {
            setError('Kata sandi tidak cocok. Mohon periksa kembali.');
            return;
        }

        if (formData.role === 'Staff' && formData.accessCode !== STAFF_ACCESS_CODE) {
            setError('Kode Akses Staf tidak valid.');
            return;
        }

        setLoading(true);
        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    nama: formData.nama,
                    email: formData.email,
                    password: formData.password,
                    role: formData.role // Will be 'Pelanggan' or 'Staff'
                }),
            });

            const data = await response.json();

            if (response.ok) {
                onRegister();
            } else {
                setError(data.detail || 'Registrasi gagal. Coba lagi nanti.');
            }
        } catch (err) {
            setError('Gagal menghubungkan ke server.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#e2e8f0] via-[#f8fafc] to-[#fce7f3] flex items-center justify-center p-4">
            <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-[480px] overflow-hidden border border-white/40 my-4 flex flex-col">
                
                {/* Header Section */}
                <div className="bg-[#1ca3f4] pt-12 pb-10 px-8 rounded-b-[2.5rem] text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                    <div className="relative z-10 flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-black tracking-tight mb-1">BERGABUNG</h1>
                            <p className="text-sm font-bold opacity-80 uppercase tracking-widest">Keluarga Adhar Coffe</p>
                        </div>
                        <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/30">
                            <Store className="w-7 h-7 text-white" strokeWidth={2.5} />
                        </div>
                    </div>
                </div>

                {/* Content Section */}
                <div className="px-8 pt-6 pb-10 flex-1 overflow-y-auto">
                    <div className="text-center mb-8">
                        <p className="text-[#0284c7] font-arabic italic text-[1.2rem] mb-2 font-bold tracking-wider">
                            بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ
                        </p>
                        <p className="text-[11px] font-bold text-slate-400 italic">
                            "Dan janganlah kamu mendekati harta anak yatim, kecuali dengan cara yang lebih bermanfaat... dan sempurnakanlah janji; sesungguhnya janji itu pasti diminta pertanggungjawabannya." (QS. Al-Isra: 34)
                        </p>
                    </div>

                    {error && (
                        <div className="bg-rose-50 text-rose-600 text-[12px] p-4 rounded-2xl mb-6 border border-rose-100 flex items-center gap-3 font-bold shadow-sm animate-shake">
                            <span className="w-2 h-2 bg-rose-500 rounded-full animate-pulse"></span>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Role Selection Cards */}
                        <div className="space-y-3">
                            <label className="block text-[11px] font-black text-[#0c4a6e] uppercase tracking-widest ml-1">Pilih Status Anda</label>
                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, role: 'Pelanggan' })}
                                    className={`p-4 rounded-3xl border-2 transition-all flex flex-col items-center gap-2 group ${formData.role === 'Pelanggan' ? 'border-[#1ca3f4] bg-sky-50 shadow-lg shadow-sky-100/50' : 'border-slate-100 hover:border-sky-200 bg-white'}`}
                                >
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${formData.role === 'Pelanggan' ? 'bg-[#1ca3f4] text-white' : 'bg-slate-100 text-slate-400 group-hover:bg-sky-100'}`}>
                                        <Users className="w-5 h-5" />
                                    </div>
                                    <span className={`text-[13px] font-black ${formData.role === 'Pelanggan' ? 'text-sky-700' : 'text-slate-500'}`}>Pelanggan</span>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, role: 'Staff' })}
                                    className={`p-4 rounded-3xl border-2 transition-all flex flex-col items-center gap-2 group ${formData.role === 'Staff' ? 'border-[#f472b6] bg-pink-50 shadow-lg shadow-pink-100/50' : 'border-slate-100 hover:border-pink-200 bg-white'}`}
                                >
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${formData.role === 'Staff' ? 'bg-[#f472b6] text-white' : 'bg-slate-100 text-slate-400 group-hover:bg-pink-100'}`}>
                                        <ChefHat className="w-5 h-5" />
                                    </div>
                                    <span className={`text-[13px] font-black ${formData.role === 'Staff' ? 'text-pink-700' : 'text-slate-500'}`}>Staf</span>
                                </button>
                            </div>
                        </div>

                        {/* Conditional Access Code Field */}
                        {formData.role === 'Staff' && (
                            <div className="animate-in fade-in slide-in-from-top-4 duration-300">
                                <label className="block text-[11px] font-black text-[#f472b6] uppercase tracking-widest mb-2 ml-1">Kode Akses Staf</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <KeyRound className="h-[18px] w-[18px] text-[#f472b6]" strokeWidth={2.5} />
                                    </div>
                                    <input
                                        type="password" required
                                        value={formData.accessCode}
                                        onChange={(e) => setFormData({ ...formData, accessCode: e.target.value })}
                                        className="w-full pl-11 pr-4 py-3.5 rounded-2xl border-2 border-pink-100 bg-pink-50/30 text-slate-700 placeholder-pink-300 focus:outline-none focus:ring-4 focus:ring-pink-500/10 focus:border-pink-300 transition-all text-sm font-bold"
                                        placeholder="Masukkan kode akses..."
                                    />
                                </div>
                            </div>
                        )}

                        <div className="space-y-4">
                            <div className="grid grid-cols-1 gap-4">
                                <div className="relative group">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-[#1ca3f4] transition-colors" />
                                    <input
                                        type="text" required
                                        value={formData.nama}
                                        onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                                        className="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-slate-100 bg-slate-50 text-slate-700 focus:outline-none focus:ring-4 focus:ring-sky-500/10 focus:border-[#1ca3f4] transition-all text-sm font-bold"
                                        placeholder="Nama Lengkap"
                                    />
                                </div>

                                <div className="relative group">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-[#1ca3f4] transition-colors" />
                                    <input
                                        type="email" required
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-slate-100 bg-slate-50 text-slate-700 focus:outline-none focus:ring-4 focus:ring-sky-500/10 focus:border-[#1ca3f4] transition-all text-sm font-bold"
                                        placeholder="Email Aktif"
                                    />
                                </div>

                                <div className="relative group">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-[#1ca3f4] transition-colors" />
                                    <input
                                        type="password" required
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        className="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-slate-100 bg-slate-50 text-slate-700 focus:outline-none focus:ring-4 focus:ring-sky-500/10 focus:border-[#1ca3f4] transition-all text-sm font-bold"
                                        placeholder="Kata Sandi Baru"
                                    />
                                </div>

                                <div className="relative group">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-[#1ca3f4] transition-colors" />
                                    <input
                                        type="password" required
                                        value={formData.confirm}
                                        onChange={(e) => setFormData({ ...formData, confirm: e.target.value })}
                                        className="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-slate-100 bg-slate-50 text-slate-700 focus:outline-none focus:ring-4 focus:ring-sky-500/10 focus:border-[#1ca3f4] transition-all text-sm font-bold"
                                        placeholder="Konfirmasi Sandi"
                                    />
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full ${loading ? 'opacity-70 cursor-not-allowed' : 'hover:shadow-xl hover:-translate-y-0.5'} transition-all duration-300 relative group overflow-hidden bg-[#1ca3f4] text-white py-4 rounded-2xl font-black text-[15px] shadow-lg shadow-sky-200 mt-2`}
                        >
                            <span className="relative z-10 flex items-center justify-center gap-2">
                                {loading ? 'Memproses...' : 'BUAT AKUN SEKARANG'}
                                {!loading && <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
                            </span>
                        </button>
                    </form>

                    {/* Footer Link */}
                    <div className="mt-10 text-center">
                        <p className="text-[13px] text-slate-400 font-bold mb-3 uppercase tracking-tighter">Sudah Menjadi Bagian Kami?</p>
                        <button 
                            onClick={onGoLogin} 
                            className="bg-white px-8 py-2.5 rounded-xl border border-slate-100 text-[#1ca3f4] font-black text-xs hover:bg-slate-50 transition-colors shadow-sm"
                        >
                            MASUK DI SINI
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
}