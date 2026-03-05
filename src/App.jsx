import React, { useState } from 'react';
import { Cloud, Flower2, HeartHandshake, Coffee, LogIn } from 'lucide-react';

export default function Login({ onLogin, onGoRegister }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Kasir');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email && password && role) {
      onLogin({ email, role });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-100 to-pink-100 flex items-center justify-center p-4">
      <div className="bg-white/80 backdrop-blur-md p-8 rounded-3xl shadow-xl w-full max-w-md border border-sky-100 relative overflow-hidden">
        {/* Dekorasi Tema */}
        <Cloud className="absolute -top-4 -left-4 w-24 h-24 text-sky-200 opacity-50" />
        <Flower2 className="absolute -bottom-4 -right-4 w-24 h-24 text-pink-200 opacity-50" />

        <div className="text-center relative z-10 mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-gradient-to-tr from-sky-300 to-pink-300 p-3 rounded-2xl shadow-lg shadow-pink-200/50">
              <Coffee className="w-10 h-10 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-sky-800 font-serif">Adhar Coffe</h1>
          <p className="text-pink-600 font-medium tracking-wide">SMART POS Syariah</p>
        </div>

        <div className="bg-sky-50 border border-sky-200 rounded-xl p-4 mb-6 flex items-start gap-3">
          <HeartHandshake className="w-6 h-6 text-sky-600 shrink-0 mt-0.5" />
          <p className="text-sm text-sky-800 italic">
            "Sempurnakan takaran dan timbangan, jalankan amanah perniagaan dengan jujur untuk meraih keberkahan."
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
          <div>
            <label className="block text-sm font-medium text-sky-900 mb-1">Email Karyawan</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-pink-200 focus:ring-2 focus:ring-sky-300 focus:border-sky-300 transition-all bg-white/90"
              placeholder="kasir@adharcoffe.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-sky-900 mb-1">Kata Sandi</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-pink-200 focus:ring-2 focus:ring-sky-300 focus:border-sky-300 transition-all bg-white/90"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-sky-400 to-pink-400 hover:from-sky-500 hover:to-pink-500 text-white font-bold py-3 rounded-xl shadow-md transform hover:-translate-y-0.5 transition-all flex justify-center items-center gap-2"
          >
            <LogIn className="w-5 h-5" />
            Mulai Sesi Kasir
          </button>
        </form>

        <p className="text-center text-sm text-sky-700 mt-6 relative z-10">
          Vendor Baru? {' '}
          <button onClick={onGoRegister} className="font-bold text-pink-600 hover:text-pink-700 underline decoration-pink-300 decoration-2 underline-offset-2">
            Daftar di sini
          </button>
        </p>
      </div>
    </div>
  );
}
