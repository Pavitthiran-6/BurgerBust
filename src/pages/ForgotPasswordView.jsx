import React, { useState } from 'react';

export default function ForgotPasswordView({ setCurrentPage, showToast }) {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  const handleReset = (e) => {
    e.preventDefault();
    setSent(true);
    if (showToast) showToast("Memory Eraser Recovery Beam Dispatched!", "success");
  };

  return (
    <div className="w-full py-10 flex flex-col items-center relative z-10 text-[#1a1c1c] max-w-md mx-auto px-4">
      {/* Header */}
      <div className="w-full bg-[#00F0FF] text-[#1a1c1c] border-4 border-[#1a1c1c] shadow-[8px_8px_0px_0px_#111111] rounded-3xl p-6 relative text-center mb-6 flex flex-col items-center gap-2">
        <div className="w-16 h-16 bg-[#1a1c1c] text-[#00F0FF] rounded-full border-4 border-[#1a1c1c] flex items-center justify-center font-black text-3xl shadow-md rotate-[3deg]">
          <span className="material-symbols-outlined text-4xl">key</span>
        </div>
        <h1 className="font-display-xl text-3xl uppercase font-black tracking-tight text-[#1a1c1c]">
          MEMORY ERASER RECOVERY
        </h1>
        <p className="text-xs font-black uppercase tracking-wider text-gray-900">
          RECOVER YOUR HERO ACCESS PASSCODE!
        </p>
      </div>

      {/* Form Container */}
      <div className="w-full bg-white border-4 border-[#1a1c1c] shadow-[8px_8px_0px_0px_#111111] rounded-3xl p-6 md:p-8 relative">
        {sent ? (
          <div className="flex flex-col items-center text-center gap-4 py-4">
            <span className="material-symbols-outlined text-6xl text-[#00F0FF] font-black">mark_email_read</span>
            <h2 className="font-headline-md text-2xl font-black uppercase">RECOVERY BEAM SENT!</h2>
            <p className="text-xs font-bold text-gray-700">
              Agent K has sent a password reset link to <span className="font-black text-black">{email}</span>.
            </p>

            <button
              type="button"
              onClick={() => setCurrentPage && setCurrentPage('login')}
              className="mt-2 bg-[#1a1c1c] text-white border-3 border-[#1a1c1c] shadow-[4px_4px_0px_0px_#00F0FF] py-3 px-6 font-black text-sm uppercase rounded-xl hover:bg-gray-800 cursor-pointer"
            >
              RETURN TO LOGIN
            </button>
          </div>
        ) : (
          <form onSubmit={handleReset} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs uppercase font-black text-[#1a1c1c]">HERO RECOVERY EMAIL</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="finn@landofooo.com"
                className="p-3.5 border-3 border-[#1a1c1c] rounded-xl font-bold text-sm bg-white focus:outline-none focus:border-[#00F0FF]"
                required
              />
            </div>

            <button
              type="submit"
              className="mt-2 bg-[#FFD23F] text-[#1a1c1c] border-3 border-[#1a1c1c] shadow-[4px_4px_0px_0px_#111111] py-3.5 font-black text-sm uppercase rounded-xl hover:bg-yellow-400 cursor-pointer"
            >
              SEND RECOVERY BEAM 
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
