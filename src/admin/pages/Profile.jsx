import React, { useState } from 'react';
import { useAdmin } from '../AdminContext';

export default function Profile() {
  const { adminProfile, activityLogs, logActivity } = useAdmin();
  
  const [newEmail, setNewEmail] = useState('');
  const [emailOtp, setEmailOtp] = useState('');
  const [emailStep, setEmailStep] = useState('EDIT'); // EDIT | VERIFY
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSendEmailOTP = (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    if (!newEmail || !newEmail.includes('@')) {
      setErrorMsg('Invalid email format.');
      return;
    }
    setEmailStep('VERIFY');
    logActivity(`Admin OTP requested for email update to ${newEmail}`);
  };

  const handleVerifyEmailOTP = (e) => {
    e.preventDefault();
    setErrorMsg('');
    if (emailOtp !== '123456') {
      setErrorMsg('Incorrect OTP code (Mock: 123456)');
      return;
    }
    // Update successful
    logActivity(`Admin email updated to ${newEmail}`);
    setSuccessMsg('Admin email updated successfully!');
    setEmailStep('EDIT');
    setNewEmail('');
    setEmailOtp('');
  };

  const handleTerminateSessions = () => {
    logActivity('Terminated all other active administrator sessions');
    setSuccessMsg('Other sessions terminated.');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fadeIn">
      {/* Left: profile details */}
      <div className="lg:col-span-5 space-y-6">
        <div className="bg-white border-4 border-[#1a1c1c] p-6 rounded-3xl shadow-[6px_6px_0px_0px_#111111] text-center">
          <div className="w-24 h-24 bg-[#FF0055] border-4 border-black rounded-full mx-auto flex items-center justify-center text-white font-black text-4xl shadow-[4px_4px_0px_0px_#111111] mb-4">
            A
          </div>
          <h3 className="font-display-xl text-xl font-black uppercase text-[#1a1c1c]">{adminProfile.name}</h3>
          <span className="bg-primary-container border-2 border-black px-3 py-1 rounded-full text-[9px] font-black uppercase text-on-surface inline-block mt-2">
            {adminProfile.role}
          </span>
          
          <div className="border-t-2 border-dashed border-gray-200 mt-6 pt-4 text-xs text-left font-bold text-gray-600 space-y-2">
            <div>Email: <span className="font-black text-[#1a1c1c]">{adminProfile.email}</span></div>
            <div>Joined: <span className="font-black text-[#1a1c1c]">{adminProfile.joined}</span></div>
          </div>
        </div>

        {/* Change email security container */}
        <div className="bg-white border-4 border-[#1a1c1c] p-6 rounded-3xl shadow-[6px_6px_0px_0px_#111111] space-y-4 text-xs font-bold text-gray-700">
          <h4 className="font-headline-md text-base font-black uppercase text-[#1a1c1c] border-b-2 border-black pb-2 mb-3">
            ADMIN SECURITY CENTER
          </h4>

          {errorMsg && (
            <div className="bg-red-100 border-2 border-red-500 p-2.5 rounded-xl text-[10px] font-black text-red-700 uppercase">
              {errorMsg}
            </div>
          )}

          {successMsg && (
            <div className="bg-green-100 border-2 border-green-500 p-2.5 rounded-xl text-[10px] font-black text-green-700 uppercase">
              {successMsg}
            </div>
          )}

          {/* Security Status Info */}
          <div className="grid grid-cols-2 gap-3 bg-[#FFF8E7] p-3 border-2 border-black rounded-xl text-[10px]">
            <div>
              <span className="text-gray-400 block font-black uppercase text-[8px]">SECURITY STATUS</span>
              <span className="font-black text-green-600">🟢 Email Verified</span>
            </div>
            <div>
              <span className="text-gray-400 block font-black uppercase text-[8px]">TWO-FACTOR AUTH</span>
              <span className="font-black text-[#FF0055]">Email OTP Enabled</span>
            </div>
            <div className="border-t border-gray-200/50 pt-1.5 mt-0.5">
              <span className="text-gray-400 block font-black uppercase text-[8px]">CURRENT SESSION</span>
              <span className="font-black">Chrome, Windows 11</span>
            </div>
            <div className="border-t border-gray-200/50 pt-1.5 mt-0.5">
              <span className="text-gray-400 block font-black uppercase text-[8px]">LAST LOGIN</span>
              <span className="font-black">Today, 09:42 PM</span>
            </div>
          </div>

          <div className="space-y-3">
            <span className="text-[10px] font-black uppercase text-gray-400 block">Update Admin Email</span>
            {emailStep === 'EDIT' ? (
              <form onSubmit={handleSendEmailOTP} className="flex gap-2">
                <input
                  type="email"
                  required
                  placeholder="New Admin Email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="flex-grow p-2.5 border-2 border-black rounded-xl font-bold bg-white text-[#1a1c1c] focus:outline-none"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#FFD23F] border-2 border-black font-black text-[10px] uppercase rounded-xl cursor-pointer"
                >
                  SEND OTP
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyEmailOTP} className="space-y-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    placeholder="Enter 6-Digit OTP"
                    maxLength="6"
                    value={emailOtp}
                    onChange={(e) => setEmailOtp(e.target.value.replace(/\D/g, ''))}
                    className="flex-grow p-2.5 border-2 border-black rounded-xl font-black text-center tracking-widest bg-white focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#34C759] text-white border-2 border-black font-black text-[10px] uppercase rounded-xl cursor-pointer"
                  >
                    VERIFY
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => setEmailStep('EDIT')}
                  className="text-[9px] font-black text-gray-400 uppercase underline block"
                >
                  Back to Edit
                </button>
              </form>
            )}
          </div>

          <div className="border-t border-gray-200 pt-3">
            <span className="text-[10px] font-black uppercase text-gray-400 block mb-2">Active Admin Sessions</span>
            <button
              type="button"
              onClick={handleTerminateSessions}
              className="w-full py-2.5 bg-red-500 text-white border-2 border-black font-black text-[10px] uppercase rounded-xl cursor-pointer hover:bg-red-600 transition-colors"
            >
              TERMINATE OTHER ADMIN SESSIONS
            </button>
          </div>
        </div>
      </div>

      {/* Right: Detailed activity log history */}
      <div className="lg:col-span-7 bg-white border-4 border-[#1a1c1c] p-6 rounded-3xl shadow-[6px_6px_0px_0px_#111111]">
        <h3 className="font-headline-md text-xl font-black uppercase text-[#1a1c1c] border-b-4 border-black pb-2 mb-4">
          HISTORIC COMMAND AUDIT LOGS
        </h3>
        <ul className="flex flex-col gap-3 max-h-[500px] overflow-y-auto">
          {activityLogs.map((log) => (
            <li key={log.id} className="flex justify-between items-center bg-[#FFF8E7] p-3.5 border-2 border-black rounded-xl text-xs">
              <span className="font-bold text-gray-700">{log.action}</span>
              <span className="font-black text-[10px] text-gray-400 uppercase shrink-0">{log.time}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
