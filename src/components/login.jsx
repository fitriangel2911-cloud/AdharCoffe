import React, { useState } from 'react';
import { Cloud, Flower2, HeartHandshake, Coffee, LogIn, Sparkles } from 'lucide-react';

export default function Login({ onLogin, onGoRegister }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email && password) {
      // Role implicitly defaulted since it's removed from the new minimal UI design
      onLogin({ email, role: 'Kasir' });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#e0f2fe] via-[#fdf2f8] to-[#fae8ff] flex items-center justify-center p-4 relative overflow-hidden">

      {/* Background Decorative Outline Icons */}
      <Cloud className="absolute top-16 left-16 w-48 h-48 text-white stroke-[1.5px] opacity-60" />
      <Flower2 className="absolute top-32 right-24 w-32 h-32 text-pink-200 stroke-[1.5px] opacity-60" />
      <Cloud className="absolute bottom-12 right-12 w-64 h-64 text-white stroke-[1.5px] opacity-60" />

      {/* Main Card */}
      <div className="bg-white/80 backdrop-blur-xl px-8 py-10 rounded-[2rem] shadow-[0_20px_60px_rgba(0,0,0,0.05)] w-full max-w-md border border-white/50 relative z-10 text-center">

        {/* Logo Icon */}
        <div className="w-[4.5rem] h-[4.5rem] mx-auto bg-gradient-to-br from-sky-300 to-pink-300 rounded-[1.25rem] flex items-center justify-center mb-6 shadow-inner border border-white/40">
          <Coffee className="w-8 h-8 text-white" strokeWidth={2} />
        </div>

        {/* Title & Subtitle */}
        <h1 className="text-[2.2rem] font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-700 via-indigo-600 to-pink-500 font-serif mb-2 tracking-tight">
          Adhar Coffe
        </h1>
        <div className="flex items-center justify-center gap-1.5 mb-8">
          <Sparkles className="w-3.5 h-3.5 text-pink-500" strokeWidth={2.5} />
          <span className="text-pink-600 font-bold tracking-[0.15em] text-[10.5px] uppercase">
            SMART POS SYARIAH
          </span>
          <Sparkles className="w-3.5 h-3.5 text-pink-500" strokeWidth={2.5} />
        </div>

        {/* Quote Box */}
        <div className="bg-sky-50/60 border border-sky-100 rounded-2xl p-4 mb-8 flex items-start gap-4 text-left shadow-sm">
          <HeartHandshake className="w-6 h-6 text-sky-500 shrink-0 mt-0.5" strokeWidth={2.5} />
          <p className="text-sm text-sky-800/80 italic font-bold leading-relaxed pr-2">
            "Sempurnakan takaran dan timbangan, jalankan amanah perniagaan dengan jujur untuk meraih keberkahan."
          </p>
        </div>

        {/* Form Inputs */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-5 py-4 rounded-xl border-2 border-pink-50 bg-white/60 text-sky-500 font-bold placeholder-sky-300 focus:outline-none focus:ring-4 focus:ring-sky-100 focus:border-sky-300 transition-all text-sm"
              placeholder="Email Karyawan (kasir@adharcoffe.com)"
            />
          </div>

          <div className="relative">
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-5 py-4 rounded-xl border-2 border-pink-50 bg-white/60 text-sky-500 font-bold placeholder-sky-300 focus:outline-none focus:ring-4 focus:ring-sky-100 focus:border-sky-300 transition-all text-sm"
              placeholder="Kata Sandi (••••••••)"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-[#44bdf8] via-[#a78bfa] to-[#f472b6] hover:opacity-90 text-white font-bold py-4 rounded-xl shadow-md shadow-pink-200/50 transition-opacity flex justify-center items-center gap-2 mt-4 text-base"
          >
            <LogIn className="w-[18px] h-[18px]" strokeWidth={2.5} />
            <span>Mulai Berniaga</span>
          </button>
        </form>

        {/* Footer Link */}
        <p className="text-center text-sm text-[#0369a1] mt-8 font-bold">
          Vendor Baru? {' '}
          <button onClick={onGoRegister} className="text-pink-500 hover:text-pink-600 underline underline-offset-[5px] decoration-2 decoration-pink-300 transition-all ml-1">
            Daftar Kemitraan
          </button>
        </p>

      </div>
    </div>
  );
}