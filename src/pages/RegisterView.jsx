import React, { useState } from 'react';

export default function RegisterView({ setCurrentPage, showToast }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleRegister = (e) => {
    e.preventDefault();
    if (showToast) showToast("Hero League License Issued! Welcome Hero!", "success");
    if (setCurrentPage) setCurrentPage('home');
  };

  return (
    <div className="w-full py-10 flex flex-col items-center relative z-10 text-[#1a1c1c] max-w-md mx-auto px-4">
      {/* Header */}
      <div className="w-full bg-[#FF0055] text-white border-4 border-[#1a1c1c] shadow-[8px_8px_0px_0px_#FFD23F] rounded-3xl p-6 relative text-center mb-6 flex flex-col items-center gap-2">
        <div className="w-16 h-16 bg-[#FFD23F] text-[#1a1c1c] rounded-full border-4 border-[#1a1c1c] flex items-center justify-center font-black text-3xl shadow-md rotate-[-5deg]">
          <span className="material-symbols-outlined text-4xl">badge</span>
        </div>
        <h1 className="font-display-xl text-3xl uppercase font-black tracking-tight text-white drop-shadow-[2px_2px_0px_#1a1c1c]">
          HERO LEAGUE LICENSE REGISTER
        </h1>
        <p className="text-xs font-black uppercase tracking-wider text-yellow-200">
          BECOME AN OFFICIAL BURSTBURGER TOON WARRIOR!
        </p>
      </div>

      {/* Form Container */}
      <div className="w-full bg-white border-4 border-[#1a1c1c] shadow-[8px_8px_0px_0px_#111111] rounded-3xl p-6 md:p-8">
        <form onSubmit={handleRegister} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs uppercase font-black text-[#1a1c1c]">HERO WARRIOR NAME</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Finn the Hero"
              className="p-3.5 border-3 border-[#1a1c1c] rounded-xl font-bold text-sm bg-white focus:outline-none focus:border-[#FF0055]"
              required
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs uppercase font-black text-[#1a1c1c]">HERO COMMS EMAIL</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="finn@landofooo.com"
              className="p-3.5 border-3 border-[#1a1c1c] rounded-xl font-bold text-sm bg-white focus:outline-none focus:border-[#FF0055]"
              required
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs uppercase font-black text-[#1a1c1c]">HERO SECRET PASSCODE</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="p-3.5 border-3 border-[#1a1c1c] rounded-xl font-bold text-sm bg-white focus:outline-none focus:border-[#FF0055]"
              required
            />
          </div>

          <button
            type="submit"
            className="mt-2 bg-[#FFD23F] text-[#1a1c1c] border-3 border-[#1a1c1c] shadow-[4px_4px_0px_0px_#111111] py-3.5 font-black text-sm uppercase rounded-xl hover:bg-yellow-400 cursor-pointer"
          >
            ISSUE HERO LICENSE 
          </button>

          <div className="text-center mt-2">
            <button
              type="button"
              onClick={() => setCurrentPage && setCurrentPage('login')}
              className="text-xs font-black uppercase text-gray-700 hover:text-black underline cursor-pointer"
            >
              ALREADY A HERO? LOGIN HERE 
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
