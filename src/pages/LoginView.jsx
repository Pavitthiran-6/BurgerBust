import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';

export default function LoginView({ onClose, showToast, setCurrentPage }) {
  const { sendOTP, verifyOTP } = useAuth();
  
  // Login Steps: 'EMAIL' | 'OTP'
  const [step, setStep] = useState('EMAIL'); 
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  
  // Countdown states
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const timerRef = useRef(null);

  // Status/Loading states
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [otpSentMsg, setOtpSentMsg] = useState('');

  // Start countdown timer
  const startTimer = () => {
    setCountdown(60);
    setCanResend(false);
    if (timerRef.current) clearInterval(timerRef.current);
    
    timerRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const validateEmail = (val) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(val);
  };

  // Step 1: Send OTP code
  const handleSendOTP = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    
    if (!validateEmail(email)) {
      setErrorMsg("Invalid Email! Please enter a valid email address.");
      if (showToast) showToast("Invalid Email Format!", "error");
      return;
    }

    setLoading(true);
    try {
      const res = await sendOTP(email);
      setOtpSentMsg(res.message);
      if (showToast) showToast(`OTP sent code (Mock: 123456)!`, "success");
      setStep('OTP');
      startTimer();
    } catch (err) {
      setErrorMsg(err.message || "Failed to send OTP.");
      if (showToast) showToast("Failed to send OTP.", "error");
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP code
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    
    if (otp.length !== 6) {
      setErrorMsg("OTP must be exactly 6 digits.");
      return;
    }

    // Check expiration
    if (countdown === 0 && !canResend) {
      setErrorMsg("OTP has expired. Please resend a new one.");
      if (showToast) showToast("OTP Expired!", "error");
      return;
    }

    setLoading(true);
    try {
      const res = await verifyOTP(email, otp);
      if (showToast) showToast(`Logged in successfully!`, "success");
      
      // Role based routing redirect
      if (res.user.role === 'ROLE_ADMIN') {
        window.history.pushState({}, '', '/admin');
        window.dispatchEvent(new Event('popstate'));
      } else {
        window.history.pushState({}, '', '/');
        window.dispatchEvent(new Event('popstate'));
        setCurrentPage('home');
      }
      
      if (onClose) onClose();
    } catch (err) {
      setErrorMsg(err.message || "Invalid OTP code!");
      if (showToast) showToast("Invalid OTP code!", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!canResend) return;
    setErrorMsg('');
    setOtp('');
    setLoading(true);
    try {
      const res = await sendOTP(email);
      setOtpSentMsg(res.message);
      if (showToast) showToast(`New OTP sent!`, "success");
      startTimer();
    } catch (err) {
      setErrorMsg(err.message || "Failed to resend OTP.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end overflow-hidden">
      {/* 1. Backdrop Overlay */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/25 backdrop-blur-[2px] transition-opacity animate-fadeIn cursor-pointer"
        aria-label="Close drawer"
      ></div>

      {/* 2. Drawer content */}
      <div className="relative w-full max-w-xl bg-[#FAF3E0] border-l-6 border-[#1a1c1c] shadow-2xl h-full min-h-screen z-10 flex flex-col justify-between p-6 md:p-10 overflow-y-auto animate-slideInRight text-[#1a1c1c]">
        <div>
          {/* Header Close */}
          <div className="flex items-center justify-between border-b-4 border-[#1a1c1c] pb-5 mb-8">
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 bg-[#D90429] rounded-full border border-black inline-block"></span>
              <span className="w-4 h-4 bg-[#FFD23F] rounded-full border border-black inline-block"></span>
              <span className="w-4 h-4 bg-[#0A2540] rounded-full border border-black inline-block"></span>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-11 h-11 bg-white border-3 border-[#1a1c1c] rounded-full flex items-center justify-center font-black text-2xl hover:bg-gray-200 active:scale-95 transition-all cursor-pointer shadow-[2px_2px_0px_0px_#111111]"
              aria-label="Close"
            >
              ❌
            </button>
          </div>

          {/* Sailor branding badge */}
          <div className="bg-[#0A2540] text-white border-4 border-[#1a1c1c] shadow-[6px_6px_0px_0px_#FFD23F] rounded-3xl p-6 text-center flex flex-col items-center gap-3 mb-8">
            <div className="relative flex items-center justify-center my-1">
              <div className="w-20 h-20 bg-[#FFD23F] border-4 border-[#1a1c1c] rounded-full flex flex-col items-center justify-center shadow-[3px_3px_0px_0px_#D90429] relative rotate-[-4deg] overflow-hidden">
                <div className="w-full bg-[#D90429] border-b-3 border-[#1a1c1c] text-center text-[8px] font-black text-white py-0.5 tracking-tighter uppercase">
                  POOPDECK PAPPY
                </div>
                <div className="flex items-center justify-center text-[#0A2540]">
                  <span className="material-symbols-outlined text-3xl font-black">directions_boat</span>
                </div>
              </div>
            </div>
            <h2 className="font-display-xl text-2xl uppercase font-black tracking-tight text-white">
              POOPDECK PAPPY'S VAULT
            </h2>
            <p className="text-[10px] font-black uppercase tracking-widest text-yellow-300">
              EMAIL + OTP SECURE CARTOON LOGIN
            </p>
          </div>

          {/* Step 1: Input Email */}
          {step === 'EMAIL' ? (
            <form onSubmit={handleSendOTP} className="space-y-5">
              <div className="flex flex-col gap-2">
                <label className="text-xs uppercase font-black text-[#1a1c1c] flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-sm font-black">mail</span>
                  SAILOR EMAIL ADDRESS
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. customer@burgerburst.com"
                  className="p-4 border-3 border-[#1a1c1c] rounded-2xl font-bold text-base bg-white focus:outline-none focus:border-[#FFD23F] min-h-[54px]"
                  disabled={loading}
                />
              </div>

              {errorMsg && (
                <div className="bg-red-100 border-2 border-red-500 p-3 rounded-xl text-xs font-bold text-red-700">
                  {errorMsg}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#D90429] text-white border-4 border-[#1a1c1c] shadow-[4px_4px_0px_0px_#FFD23F] py-4 px-6 font-black text-base uppercase hover:bg-red-700 active:translate-y-1 transition-all rounded-2xl cursor-pointer flex items-center justify-center gap-2 min-h-[56px] disabled:opacity-50"
              >
                {loading ? 'GENERATING SECURE CODE...' : 'SEND OTP CODE'}
              </button>
            </form>
          ) : (
            /* Step 2: Verification of OTP code */
            <form onSubmit={handleVerifyOTP} className="space-y-5">
              <div className="flex flex-col gap-2">
                <label className="text-xs uppercase font-black text-[#1a1c1c] flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-sm font-black">lock</span>
                  6-DIGIT OTP CODE
                </label>
                <input
                  type="text"
                  maxLength="6"
                  required
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  placeholder="123456"
                  className="p-4 border-3 border-[#1a1c1c] rounded-2xl font-black text-center tracking-widest text-lg bg-white focus:outline-none focus:border-[#FFD23F] min-h-[54px]"
                  disabled={loading}
                />
              </div>

              {/* Sent message or Error msg */}
              {otpSentMsg && !errorMsg && (
                <div className="bg-green-100 border-2 border-green-500 p-3 rounded-xl text-xs font-bold text-green-700">
                  {otpSentMsg}
                </div>
              )}

              {errorMsg && (
                <div className="bg-red-100 border-2 border-red-500 p-3 rounded-xl text-xs font-bold text-red-700">
                  {errorMsg}
                </div>
              )}

              {/* Timer/Resend */}
              <div className="flex justify-between items-center text-xs font-bold px-1">
                <span className="text-gray-500">
                  {countdown > 0 ? `Expires in: ${countdown}s` : 'OTP Expired!'}
                </span>
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={!canResend || loading}
                  className={`underline font-black cursor-pointer ${
                    canResend ? 'text-[#D90429]' : 'text-gray-400 cursor-not-allowed'
                  }`}
                >
                  Resend OTP
                </button>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setStep('EMAIL');
                    setErrorMsg('');
                  }}
                  className="w-1/3 bg-white text-[#1a1c1c] border-3 border-[#1a1c1c] py-3.5 font-black text-xs uppercase rounded-xl hover:bg-gray-100 cursor-pointer"
                  disabled={loading}
                >
                  BACK
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-2/3 bg-[#34C759] text-white border-3 border-[#1a1c1c] shadow-[3px_3px_0px_0px_#111111] py-3.5 px-6 font-black text-sm uppercase hover:bg-green-600 active:translate-y-0.5 active:shadow-none transition-all rounded-xl cursor-pointer disabled:opacity-50"
                >
                  {loading ? 'VERIFYING...' : 'VERIFY & LOGIN'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
