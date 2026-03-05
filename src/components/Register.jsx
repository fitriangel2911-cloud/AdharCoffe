import React, { useState } from 'react';
import { User, Mail, Lock, Store } from 'lucide-react';

export default function Register({ onRegister, onGoLogin }) {
    const [formData, setFormData] = useState({
        nama: '', email: '', password: '', confirm: ''
    });
    const [error, setError] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (formData.password !== formData.confirm) {
            setError('Kata sandi tidak cocok. Mohon periksa kembali.');
            return;
        }
        if (formData.nama && formData.email && formData.password) {
            onRegister();
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#e2e8f0] to-[#fce7f3] flex items-center justify-center p-4">

            {/* Main Card */}
            <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-[400px] overflow-hidden border border-white/40 my-4">

                {/* Top Header Section (Sky Blue) */}
                <div className="bg-[#1ca3f4] pt-14 pb-12 rounded-b-[2rem] flex flex-col items-center justify-center text-white relative z-10">
                    {/* Logo Icon */}
                    <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-5 backdrop-blur-sm">
                        <Store className="w-8 h-8 text-white" strokeWidth={2.5} />
                    </div>

                    <h1 className="text-3xl font-black tracking-wide mb-1">REGISTRASI</h1>
                    <p className="text-sm font-semibold opacity-90">Kemitraan Vendor</p>
                </div>

                {/* Content Section */}
                <div className="px-8 pt-6 pb-10">

                    <div className="text-center mb-6">
                        <p className="text-[#0284c7] font-arabic italic text-[1.1rem] mb-2 font-bold tracking-wider">
                            بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ
                        </p>
                        <h2 className="text-[#0c4a6e] text-[1.4rem] font-black tracking-tight mt-1">Daftar Akun Baru</h2>
                    </div>

                    {error && (
                        <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-4 border border-red-200 text-center font-medium shadow-sm">
                            {error}
                        </div>
                    )}

                    {/* Form Inputs */}
                    <form onSubmit={handleSubmit} className="space-y-3">
                        <div>
                            <label className="block text-[13px] font-bold text-[#0c4a6e] mb-1.5 ml-1">Nama Vendor / Toko</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <User className="h-[18px] w-[18px] text-[#f472b6]" strokeWidth={2.5} />
                                </div>
                                <input
                                    type="text" required
                                    value={formData.nama}
                                    onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-[#bae6fd] bg-white text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#7dd3fc] focus:border-transparent transition-all text-sm font-medium shadow-sm"
                                    placeholder="Kedai Langit Biru"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-[13px] font-bold text-[#0c4a6e] mb-1.5 ml-1">Email</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Mail className="h-[18px] w-[18px] text-[#f472b6]" strokeWidth={2.5} />
                                </div>
                                <input
                                    type="email" required
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-[#bae6fd] bg-white text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#7dd3fc] focus:border-transparent transition-all text-sm font-medium shadow-sm"
                                    placeholder="vendor@domain.com"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-[13px] font-bold text-[#0c4a6e] mb-1.5 ml-1">Kata Sandi</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Lock className="h-[18px] w-[18px] text-[#f472b6]" strokeWidth={2.5} />
                                </div>
                                <input
                                    type="password" required
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-[#bae6fd] bg-white text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#7dd3fc] focus:border-transparent transition-all text-sm font-medium shadow-sm"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-[13px] font-bold text-[#0c4a6e] mb-1.5 ml-1">Konfirmasi Sandi</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Lock className="h-[18px] w-[18px] text-[#f472b6]" strokeWidth={2.5} />
                                </div>
                                <input
                                    type="password" required
                                    value={formData.confirm}
                                    onChange={(e) => setFormData({ ...formData, confirm: e.target.value })}
                                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-[#bae6fd] bg-white text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#7dd3fc] focus:border-transparent transition-all text-sm font-medium shadow-sm"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <div className="pt-2">
                            <button
                                type="submit"
                                className="w-full bg-[#f472b6] hover:bg-[#ec4899] text-white font-black text-[15px] py-3.5 rounded-xl shadow-[0_4px_14px_0_rgba(244,114,182,0.39)] transition-all transform active:scale-[0.98] mt-2"
                            >
                                Daftarkan Vendor
                            </button>
                        </div>
                    </form>

                    {/* Footer Link */}
                    <div className="mt-8 text-center text-[13px] text-[#0c4a6e] font-medium">
                        Sudah terdaftar? {' '}
                        <button onClick={onGoLogin} className="font-extrabold text-[#f472b6] hover:text-[#ec4899] transition-colors">
                            Masuk di sini
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
}