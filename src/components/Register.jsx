import React, { useState } from 'react';
import { Cloud, Flower2, UserPlus } from 'lucide-react';

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
        <div className="min-h-screen bg-gradient-to-br from-pink-100 to-sky-100 flex items-center justify-center p-4">
            <div className="bg-white/80 backdrop-blur-md p-8 rounded-3xl shadow-xl w-full max-w-md border border-pink-100 relative overflow-hidden">
                <Flower2 className="absolute -top-4 -left-4 w-24 h-24 text-pink-200 opacity-50" />
                <Cloud className="absolute -bottom-4 -right-4 w-24 h-24 text-sky-200 opacity-50" />

                <div className="text-center relative z-10 mb-6">
                    <h2 className="text-2xl font-bold text-pink-700 font-serif">Registrasi Vendor</h2>
                    <p className="text-sky-600 text-sm mt-1">Bergabung dengan ekosistem perniagaan Islami</p>
                </div>

                {error && (
                    <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-4 border border-red-200">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
                    <div>
                        <label className="block text-sm font-medium text-pink-900 mb-1">Nama Vendor / Toko</label>
                        <input
                            type="text" required
                            onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                            className="w-full px-4 py-2.5 rounded-xl border border-sky-200 focus:ring-2 focus:ring-pink-300 focus:border-pink-300 bg-white/90"
                            placeholder="Misal: Kedai Langit Biru"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-pink-900 mb-1">Email Representatif</label>
                        <input
                            type="email" required
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="w-full px-4 py-2.5 rounded-xl border border-sky-200 focus:ring-2 focus:ring-pink-300 focus:border-pink-300 bg-white/90"
                            placeholder="vendor@domain.com"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-pink-900 mb-1">Kata Sandi</label>
                        <input
                            type="password" required
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            className="w-full px-4 py-2.5 rounded-xl border border-sky-200 focus:ring-2 focus:ring-pink-300 focus:border-pink-300 bg-white/90"
                            placeholder="••••••••"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-pink-900 mb-1">Konfirmasi Kata Sandi</label>
                        <input
                            type="password" required
                            onChange={(e) => setFormData({ ...formData, confirm: e.target.value })}
                            className="w-full px-4 py-2.5 rounded-xl border border-sky-200 focus:ring-2 focus:ring-pink-300 focus:border-pink-300 bg-white/90"
                            placeholder="••••••••"
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-gradient-to-r from-pink-400 to-sky-400 hover:from-pink-500 hover:to-sky-500 text-white font-bold py-3 rounded-xl shadow-md transform hover:-translate-y-0.5 transition-all flex justify-center items-center gap-2 mt-2"
                    >
                        <UserPlus className="w-5 h-5" />
                        Daftarkan Vendor
                    </button>
                </form>

                <p className="text-center text-sm text-pink-800 mt-6 relative z-10">
                    Sudah terdaftar? {' '}
                    <button onClick={onGoLogin} className="font-bold text-sky-600 hover:text-sky-700 underline decoration-sky-300 decoration-2 underline-offset-2">
                        Kembali ke Login
                    </button>
                </p>
            </div>
        </div>
    );
}