import React, { useState } from 'react';

export default function ProfileView({
  profile = {},
  setProfile,
  completionPercentage = 80,
  orders = [],
  favorites = [],
  addresses = [],
  paymentMethods = [],
  rewardPoints = 450,
  notifications = [],
  onLogout,
  showToast,
  setCurrentPage
}) {
  const [activeTab, setActiveTab] = useState('PROFILE');

  // Profile Form State
  const [name, setName] = useState(profile.name || 'Finn the Hero');
  const [email, setEmail] = useState(profile.email || 'finn@landofooo.com');
  const [phone, setPhone] = useState(profile.phone || '555-0199');
  const [saved, setSaved] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(profile.avatar || null);

  // Security / Email Update State
  const [showSecuritySection, setShowSecuritySection] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [emailOtp, setEmailOtp] = useState('');
  const [emailStep, setEmailStep] = useState('EDIT'); // 'EDIT' | 'VERIFY'
  const [securityError, setSecurityError] = useState('');
  
  const [loginDevices, setLoginDevices] = useState([
    { id: 1, name: 'Chrome on macOS (Current)', location: 'Bikini Bottom coords', active: true },
    { id: 2, name: 'Safari on iPhone 15 Pro', location: 'Ooo coordinate 42', active: false }
  ]);

  const [securityActivity, setSecurityActivity] = useState([
    { id: 1, action: 'Email OTP Verification Request', time: 'Just now' },
    { id: 2, action: 'Authorized login with 123456 code', time: '10 minutes ago' }
  ]);

  // Delete Account State
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteInput, setDeleteInput] = useState('');

  // Settings State
  const [sound, setSound] = useState(true);
  const [autoSave, setAutoSave] = useState(true);
  const accountCreated = localStorage.getItem('burger_account_created') || 'July 21, 2025';
  const lastLogin = new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });


  const handleSaveProfile = (e) => {
    e.preventDefault();
    if (setProfile) {
      setProfile(prev => ({ ...prev, name, email, phone, avatar: avatarPreview }));
    }
    setSaved(true);
    if (showToast) showToast('Hero credentials updated across BurgerBurst!', 'success');
    setTimeout(() => setSaved(false), 3000);
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { if (showToast) showToast('Avatar must be under 2MB!', 'warning'); return; }
    const reader = new FileReader();
    reader.onload = (ev) => {
      setAvatarPreview(ev.target.result);
      if (showToast) showToast('Avatar updated! Save your profile to confirm. ', 'success');
    };
    reader.readAsDataURL(file);
  };

  const handleSendEmailOTP = (e) => {
    e.preventDefault();
    setSecurityError('');
    if (!newEmail || !newEmail.includes('@')) {
      setSecurityError('Please enter a valid new email address.');
      return;
    }
    setEmailStep('VERIFY');
    setSecurityActivity(prev => [
      { id: Date.now(), action: `OTP Sent to new email: ${newEmail}`, time: 'Just now' },
      ...prev
    ]);
    if (showToast) showToast('Verification code sent (Mock: 123456)!', 'success');
  };

  const handleVerifyEmailOTP = (e) => {
    e.preventDefault();
    setSecurityError('');
    if (emailOtp !== '123456') {
      setSecurityError('Incorrect verification code! Please try again.');
      if (showToast) showToast('Incorrect code!', 'error');
      return;
    }
    
    // Success: Update Email
    setEmail(newEmail);
    if (setProfile) {
      setProfile(prev => ({ ...prev, email: newEmail }));
    }
    setEmailStep('EDIT');
    setNewEmail('');
    setEmailOtp('');
    setSecurityActivity(prev => [
      { id: Date.now(), action: `Email successfully updated to ${newEmail}`, time: 'Just now' },
      ...prev
    ]);
    if (showToast) showToast('Email updated successfully! ', 'success');
  };

  const handleLogoutAllDevices = () => {
    setLoginDevices(prev => prev.filter(d => d.active));
    setSecurityActivity(prev => [
      { id: Date.now(), action: 'Logged out of all secondary devices', time: 'Just now' },
      ...prev
    ]);
    if (showToast) showToast('Terminated all secondary active sessions.', 'success');
  };

  const handleDeleteAccount = () => {
    if (deleteInput !== 'DELETE') { if (showToast) showToast('Type DELETE exactly to confirm.', 'warning'); return; }
    if (showToast) showToast('Account deletion requested. All data will be cleared! (Mock mode — not actually deleted)', 'info');
    setShowDeleteConfirm(false); setDeleteInput('');
  };


  const tabs = [
    { key: 'PROFILE', label: 'PROFILE', icon: 'person' },
    { key: 'ORDERS', label: 'ORDERS', icon: 'local_shipping' },
    { key: 'FAVORITES', label: 'FAVORITES', icon: 'favorite' },
    { key: 'REWARDS', label: 'REWARDS', icon: 'military_tech' },
    { key: 'ADDRESSES', label: 'ADDRESSES', icon: 'map' },
    { key: 'PAYMENTS', label: 'WALLET', icon: 'credit_card' },
    { key: 'NOTIFICATIONS', label: 'NOTIFICATIONS', icon: 'notifications' },
    { key: 'SETTINGS', label: 'SETTINGS', icon: 'settings' },
    { key: 'SUPPORT', label: 'SUPPORT', icon: 'help' }
  ];

  return (
    <div className="w-full py-8 flex flex-col items-center relative z-10 text-[#1a1c1c] max-w-6xl mx-auto px-4">
      {/* 1. Hero Banner */}
      <div className="w-full bg-[#70D6FF] border-4 border-[#1a1c1c] shadow-[8px_8px_0px_0px_#111111] rounded-3xl p-6 md:p-8 relative overflow-hidden mb-8 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-5 z-10">
          <label htmlFor="avatar-upload" className="relative cursor-pointer group">
            <div className="w-20 h-20 bg-[#FFD23F] border-4 border-[#1a1c1c] shadow-[4px_4px_0px_0px_#111111] rounded-2xl flex items-center justify-center font-black text-3xl text-[#1a1c1c] rotate-[-5deg] shrink-0 overflow-hidden">
              {avatarPreview
                ? <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                : <span className="material-symbols-outlined text-4xl">shield</span>}
            </div>
            <div className="absolute inset-0 bg-black/30 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="text-white text-xs font-black">EDIT </span>
            </div>
            <input id="avatar-upload" type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
          </label>
          <div>
            <div className="bg-[#FF70A6] text-white border-2 border-[#1a1c1c] px-3 py-0.5 rounded-full text-xs font-black uppercase inline-block mb-1 rotate-[-2deg]">
              ALGEBRAIC HERO LEVEL 42
            </div>
            <h1 className="font-display-xl text-3xl md:text-5xl uppercase font-black tracking-tight text-[#1a1c1c]">
              {name}
            </h1>
            <p className="text-xs font-black uppercase tracking-wider text-gray-800">
              HERO PROFILE HUB & DISPATCH CENTER
            </p>
          </div>
        </div>

        {/* Profile Completion Bar (0-100%) */}
        <div className="bg-white border-4 border-[#1a1c1c] shadow-[4px_4px_0px_0px_#111111] p-4 rounded-2xl w-full md:w-72 z-10 flex flex-col gap-2 shrink-0">
          <div className="flex justify-between items-center text-xs font-black">
            <span>PROFILE COMPLETION</span>
            <span className="text-[#FF70A6] font-black">{completionPercentage}%</span>
          </div>
          <div className="w-full h-4 bg-gray-200 border-2 border-[#1a1c1c] rounded-full overflow-hidden">
            <div className="h-full bg-[#FF70A6] transition-all duration-500 border-r-2 border-[#1a1c1c]" style={{ width: `${completionPercentage}%` }}></div>
          </div>
        </div>
      </div>

      {/* 2. 9-Tab Navigation System */}
      <div className="w-full flex gap-2 overflow-x-auto pb-4 mb-8 no-scrollbar scroll-smooth">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2.5 rounded-2xl font-black text-xs uppercase border-3 border-[#1a1c1c] shadow-[3px_3px_0px_0px_#111111] flex items-center gap-1.5 shrink-0 cursor-pointer transition-all ${
              activeTab === tab.key
                ? 'bg-[#FFD23F] text-[#1a1c1c] translate-y-0.5 shadow-none'
                : 'bg-white text-[#1a1c1c] hover:bg-yellow-50'
            }`}
          >
            <span className="material-symbols-outlined text-base font-black">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* 3. Tab Contents */}
      <div className="w-full bg-white border-4 border-[#1a1c1c] shadow-[8px_8px_0px_0px_#111111] rounded-3xl p-6 md:p-8">
        {/* TAB 1: PROFILE */}
        {activeTab === 'PROFILE' && (
          <form onSubmit={handleSaveProfile} className="space-y-6 max-w-2xl">
            <h2 className="font-headline-md text-2xl font-black uppercase text-[#1a1c1c]">HERO CREDENTIALS</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-black uppercase mb-1">Hero Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-3 border-3 border-[#1a1c1c] rounded-xl font-bold text-sm bg-[#fcfbf7]"
                />
              </div>
              <div>
                <label className="block text-xs font-black uppercase mb-1">Hero Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-3 border-3 border-[#1a1c1c] rounded-xl font-bold text-sm bg-[#fcfbf7]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-black uppercase mb-1">Phone Number</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full p-3 border-3 border-[#1a1c1c] rounded-xl font-bold text-sm bg-[#fcfbf7]"
              />
            </div>

            <div className="flex items-center gap-4">
              <button
                type="submit"
                className="px-6 py-3 bg-[#FF0055] text-white border-3 border-[#1a1c1c] shadow-[4px_4px_0px_0px_#111111] font-black text-xs uppercase rounded-xl hover:bg-pink-600 cursor-pointer"
              >
                SAVE CREDENTIALS 
              </button>
              {saved && <span className="text-xs font-black text-[#34C759]">Saved! </span>}
            </div>
          </form>
        )}

        {/* Account Meta Info */}
        {activeTab === 'PROFILE' && (
          <div className="mt-8 space-y-5 max-w-2xl">
            <div className="bg-[#00F0FF] border-3 border-[#1a1c1c] p-4 rounded-2xl shadow-[4px_4px_0px_0px_#111111] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h4 className="font-black text-sm uppercase">DELIVERY ADDRESSES ({addresses.length})</h4>
                <p className="text-[11px] font-bold text-gray-800">
                  {addresses.length === 0 ? 'Add an address before starting checkout.' : 'Review or add addresses used during checkout.'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setCurrentPage('address')}
                className="px-5 py-3 bg-[#FFD23F] text-[#1a1c1c] border-3 border-[#1a1c1c] font-black text-xs uppercase rounded-xl shadow-[3px_3px_0px_0px_#111111] cursor-pointer shrink-0"
              >
                + ADD DELIVERY ADDRESS
              </button>
            </div>

            {/* Account Info */}
            <div className="bg-[#FFF8E7] border-3 border-[#1a1c1c] p-4 rounded-2xl">
              <h4 className="font-black text-xs uppercase mb-3"> ACCOUNT INFORMATION</h4>
              <div className="grid grid-cols-2 gap-3 text-xs font-bold">
                <div><span className="text-gray-500 block">Account Created</span><span>{accountCreated}</span></div>
                <div><span className="text-gray-500 block">Last Login</span><span>{lastLogin}</span></div>
                <div><span className="text-gray-500 block">Hero Level</span><span>LVL {Math.floor(rewardPoints / 500) + 1} ({rewardPoints} XP)</span></div>
                <div><span className="text-gray-500 block">Total Orders</span><span>{orders.length} Orders</span></div>
              </div>
            </div>

            {/* Security Control Center */}
            <div className="border-3 border-[#1a1c1c] rounded-2xl overflow-hidden">
              <button type="button" onClick={() => setShowSecuritySection(!showSecuritySection)}
                className="w-full flex justify-between items-center p-4 bg-white font-black text-xs uppercase cursor-pointer hover:bg-gray-50">
                 SECURITY & LOGIN DEVICES
                <span>{showSecuritySection ? '▲' : '▼'}</span>
              </button>
              {showSecuritySection && (
                <div className="p-4 space-y-4 bg-[#FFF8E7] border-t-2 border-[#1a1c1c] text-xs font-bold text-[#1a1c1c]">
                  {securityError && <div className="bg-red-100 border-2 border-red-500 p-2 rounded-xl text-[10px] font-black text-red-700 uppercase">{securityError}</div>}
                  
                  {/* Security Status Info */}
                  <div className="grid grid-cols-2 gap-3 bg-white p-3 border-2 border-black rounded-xl mb-3 text-[10px]">
                    <div>
                      <span className="text-gray-400 block font-black uppercase text-[8px]">SECURITY STATUS</span>
                      <span className="font-black text-green-600">🟢 Email Verified</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block font-black uppercase text-[8px]">TWO-FACTOR AUTH</span>
                      <span className="font-black text-[#FF0055]">Email OTP Enabled</span>
                    </div>
                    <div className="border-t border-gray-100 pt-1.5 mt-0.5">
                      <span className="text-gray-400 block font-black uppercase text-[8px]">CURRENT SESSION</span>
                      <span className="font-black">Chrome, Windows 11</span>
                    </div>
                    <div className="border-t border-gray-100 pt-1.5 mt-0.5">
                      <span className="text-gray-400 block font-black uppercase text-[8px]">LAST LOGIN</span>
                      <span className="font-black">Today, {lastLogin.split(',')[1] || '07:25 PM'}</span>
                    </div>
                  </div>

                  {/* Change Email */}
                  <div className="space-y-2">
                    <h5 className="font-black text-[10px] uppercase text-gray-500">UPDATE LOGIN EMAIL</h5>
                    {emailStep === 'EDIT' ? (
                      <form onSubmit={handleSendEmailOTP} className="flex gap-2">
                        <input type="email" placeholder="New Email Address" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} required className="flex-1 p-2.5 border-2 border-[#1a1c1c] rounded-xl font-bold text-xs bg-white focus:outline-none" />
                        <button type="submit" className="px-4 py-2 bg-[#FFD23F] text-[#1a1c1c] border-2 border-[#1a1c1c] font-black text-[10px] uppercase rounded-xl cursor-pointer">SEND OTP</button>
                      </form>
                    ) : (
                      <form onSubmit={handleVerifyEmailOTP} className="space-y-2">
                        <div className="flex gap-2">
                          <input type="text" placeholder="Enter 6-Digit OTP" maxLength="6" value={emailOtp} onChange={(e) => setEmailOtp(e.target.value.replace(/\D/g, ''))} required className="flex-1 p-2.5 border-2 border-[#1a1c1c] rounded-xl font-black text-center tracking-widest text-xs bg-white focus:outline-none" />
                          <button type="submit" className="px-4 py-2 bg-[#34C759] text-white border-2 border-[#1a1c1c] font-black text-[10px] uppercase rounded-xl cursor-pointer">VERIFY</button>
                        </div>
                        <button type="button" onClick={() => setEmailStep('EDIT')} className="text-[10px] font-black text-gray-500 uppercase underline block">Back to Edit</button>
                      </form>
                    )}
                  </div>

                  {/* Active Devices */}
                  <div className="space-y-2 border-t-2 border-dashed border-gray-300 pt-3">
                    <div className="flex justify-between items-center">
                      <h5 className="font-black text-[10px] uppercase text-gray-500">ACTIVE LOGIN SESSIONS</h5>
                      {loginDevices.length > 1 && (
                        <button type="button" onClick={handleLogoutAllDevices} className="text-[9px] font-black text-red-500 uppercase underline cursor-pointer">Logout others</button>
                      )}
                    </div>
                    <ul className="space-y-1.5">
                      {loginDevices.map(d => (
                        <li key={d.id} className="flex justify-between items-center p-2 bg-white border border-black/10 rounded-lg text-[10px]">
                          <div>
                            <span className="font-black block">{d.name}</span>
                            <span className="text-[8px] font-bold text-gray-400">{d.location}</span>
                          </div>
                          <span className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase ${d.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                            {d.active ? 'CURRENT' : 'ACTIVE'}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Security Log */}
                  <div className="space-y-2 border-t-2 border-dashed border-gray-300 pt-3">
                    <h5 className="font-black text-[10px] uppercase text-gray-500">SECURITY LOGS</h5>
                    <ul className="space-y-1 text-[9px] text-gray-500 font-semibold">
                      {securityActivity.map(act => (
                        <li key={act.id} className="flex justify-between">
                          <span>{act.action}</span>
                          <span className="font-black">{act.time}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>

            {/* Danger Zone — Delete Account */}
            <div className="border-3 border-red-500 rounded-2xl overflow-hidden">
              <div className="p-4 bg-red-50 flex justify-between items-center">
                <div>
                  <h4 className="font-black text-xs uppercase text-red-600">️ DANGER ZONE</h4>
                  <p className="text-[10px] font-bold text-red-500 mt-0.5">Delete your account permanently. This action cannot be undone.</p>
                </div>
                <button type="button" onClick={() => setShowDeleteConfirm(!showDeleteConfirm)}
                  className="px-4 py-2 bg-red-600 text-white border-2 border-red-800 font-black text-xs uppercase rounded-xl cursor-pointer">
                  DELETE ACCOUNT
                </button>
              </div>
              {showDeleteConfirm && (
                <div className="p-4 bg-red-100 border-t-2 border-red-300 space-y-3">
                  <p className="text-xs font-bold text-red-700">Type <strong>DELETE</strong> below to confirm account deletion:</p>
                  <input type="text" placeholder='Type "DELETE"' value={deleteInput} onChange={(e) => setDeleteInput(e.target.value)}
                    className="w-full p-3 border-2 border-red-500 rounded-xl font-bold text-xs bg-white" />
                  <div className="flex gap-2">
                    <button type="button" onClick={handleDeleteAccount} className="px-5 py-2 bg-red-600 text-white border-2 border-red-800 font-black text-xs uppercase rounded-xl cursor-pointer">CONFIRM DELETE</button>
                    <button type="button" onClick={() => { setShowDeleteConfirm(false); setDeleteInput(''); }} className="px-5 py-2 bg-gray-200 border-2 border-gray-400 font-black text-xs uppercase rounded-xl cursor-pointer">CANCEL</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: ORDERS */}
        {activeTab === 'ORDERS' && (
          <div className="space-y-4">
            <h2 className="font-headline-md text-2xl font-black uppercase text-[#1a1c1c] border-b-3 border-[#1a1c1c] pb-2">
              DISPATCH LOGS ({orders.length})
            </h2>

            {orders.length === 0 ? (
              <div className="p-8 text-center bg-gray-50 border-2 border-dashed border-[#1a1c1c] rounded-2xl">
                <span className="text-3xl block mb-2"></span>
                <p className="text-xs font-bold text-gray-600">No dispatch orders placed yet! Order from the Menu Bistro.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {orders.map((ord) => (
                  <div key={ord.id} className="border-3 border-[#1a1c1c] p-4 rounded-2xl bg-[#FFF8E7] flex justify-between items-center shadow-[3px_3px_0px_0px_#111111]">
                    <div>
                      <span className="bg-[#FF0055] text-white border border-[#1a1c1c] px-2 py-0.5 rounded text-[10px] font-black uppercase">
                        ORDER #{ord.orderNumber || ord.id}
                      </span>
                      <h4 className="font-black text-sm uppercase text-[#1a1c1c] mt-1">{ord.items?.map(i => i.name).join(', ') || 'Cartoon Combo'}</h4>
                      <p className="text-xs font-bold text-gray-600">Total: ${ord.total?.toFixed(2)} • Status: <span className="text-green-600 font-black">{ord.status}</span></p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setCurrentPage('tracker')}
                      className="px-4 py-2 bg-[#00F0FF] text-[#1a1c1c] border-2 border-[#1a1c1c] font-black text-xs uppercase rounded-xl cursor-pointer"
                    >
                      TRACK 
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: FAVORITES */}
        {activeTab === 'FAVORITES' && (
          <div className="space-y-4">
            <h2 className="font-headline-md text-2xl font-black uppercase text-[#1a1c1c]">FAVORITES VAULT ({favorites.length})</h2>
            <button
              type="button"
              onClick={() => setCurrentPage('favorites')}
              className="px-6 py-3 bg-[#FFD23F] text-[#1a1c1c] border-3 border-[#1a1c1c] font-black text-xs uppercase rounded-xl"
            >
              OPEN TOM & JERRY FAVORITES VAULT ️
            </button>
          </div>
        )}

        {/* TAB 4: REWARDS */}
        {activeTab === 'REWARDS' && (
          <div className="space-y-4">
            <h2 className="font-headline-md text-2xl font-black uppercase text-[#1a1c1c]">HERO ACADEMY POINTS</h2>
            <div className="bg-[#FFD23F] border-3 border-[#1a1c1c] p-6 rounded-2xl flex justify-between items-center">
              <div>
                <span className="font-black text-2xl text-[#1a1c1c] block">{rewardPoints} POKÉBALL POINTS</span>
                <span className="text-xs font-bold text-gray-800">Earn +150 Points on every completed order!</span>
              </div>
              <button
                type="button"
                onClick={() => setCurrentPage('rewards')}
                className="px-5 py-2.5 bg-[#FF0055] text-white border-2 border-[#1a1c1c] font-black text-xs uppercase rounded-xl"
              >
                REDEEM REWARDS 
              </button>
            </div>
          </div>
        )}

        {/* TAB 5: ADDRESSES */}
        {activeTab === 'ADDRESSES' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="font-headline-md text-2xl font-black uppercase text-[#1a1c1c]">SECRET MAP BASES ({addresses.length})</h2>
              <button
                type="button"
                onClick={() => setCurrentPage('address')}
                className="px-4 py-2 bg-[#FFD23F] text-[#1a1c1c] border-2 border-[#1a1c1c] font-black text-xs uppercase rounded-xl"
              >
                {addresses.length === 0 ? '+ ADD DELIVERY ADDRESS' : 'MANAGE ADDRESSES'}
              </button>
            </div>
            <div className="space-y-2 text-xs font-bold">
              {addresses.length === 0 && (
                <div className="border-2 border-dashed border-[#1a1c1c] p-5 rounded-xl bg-[#FFF8E7] text-center">
                  No delivery address saved yet.
                </div>
              )}
              {addresses.map(a => (
                <div key={a.id} className="border-2 border-[#1a1c1c] p-3 rounded-xl bg-[#fcfbf7] flex justify-between items-center">
                  <span>{a.title}: {a.address}</span>
                  {a.default && <span className="bg-[#34C759] text-white text-[9px] font-black px-2 py-0.5 rounded">PRIMARY</span>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 6: PAYMENTS */}
        {activeTab === 'PAYMENTS' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="font-headline-md text-2xl font-black uppercase text-[#1a1c1c]">OMNITRIX WALLET ({paymentMethods.length})</h2>
              <button
                type="button"
                onClick={() => setCurrentPage('payment')}
                className="px-4 py-2 bg-[#FFD23F] text-[#1a1c1c] border-2 border-[#1a1c1c] font-black text-xs uppercase rounded-xl"
              >
                MANAGE WALLET 
              </button>
            </div>
            <div className="space-y-2 text-xs font-bold">
              {paymentMethods.map(p => (
                <div key={p.id} className="border-2 border-[#1a1c1c] p-3 rounded-xl bg-[#fcfbf7] flex justify-between items-center">
                  <span>{p.type} ({p.details})</span>
                  {p.primary && <span className="bg-[#00F0FF] text-[#1a1c1c] text-[9px] font-black px-2 py-0.5 rounded">PRIMARY</span>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 7: NOTIFICATIONS */}
        {activeTab === 'NOTIFICATIONS' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="font-headline-md text-2xl font-black uppercase text-[#1a1c1c]">TITANS MAILBOX ({notifications.length})</h2>
              <button
                type="button"
                onClick={() => setCurrentPage('notifications')}
                className="px-4 py-2 bg-[#FFD23F] text-[#1a1c1c] border-2 border-[#1a1c1c] font-black text-xs uppercase rounded-xl"
              >
                OPEN MAILBOX ️
              </button>
            </div>
          </div>
        )}

        {/* TAB 8: SETTINGS */}
        {activeTab === 'SETTINGS' && (
          <div className="space-y-4 max-w-lg">
            <h2 className="font-headline-md text-2xl font-black uppercase text-[#1a1c1c]">SYSTEM PREFERENCES</h2>
            <label className="flex items-center justify-between p-3 border-2 border-[#1a1c1c] rounded-xl bg-[#fcfbf7] font-bold text-xs">
              <span>CARTOON SOUND EFFECTS</span>
              <input type="checkbox" checked={sound} onChange={() => setSound(!sound)} className="w-5 h-5" />
            </label>
            <label className="flex items-center justify-between p-3 border-2 border-[#1a1c1c] rounded-xl bg-[#fcfbf7] font-bold text-xs">
              <span>AUTO-SAVE QUEST LOGS</span>
              <input type="checkbox" checked={autoSave} onChange={() => setAutoSave(!autoSave)} className="w-5 h-5" />
            </label>
          </div>
        )}

        {/* TAB 9: SUPPORT */}
        {activeTab === 'SUPPORT' && (
          <div className="space-y-4 text-center py-6">
            <h2 className="font-headline-md text-2xl font-black uppercase text-[#1a1c1c]">BIKINI BOTTOM SUPPORT DESK</h2>
            <p className="text-xs font-bold text-gray-600">Need help with your order? Our cartoon chefs are on standby 24/7!</p>
            <button
              type="button"
              onClick={() => setCurrentPage('help')}
              className="px-6 py-3 bg-[#FF0055] text-white border-3 border-[#1a1c1c] font-black text-xs uppercase rounded-xl"
            >
              VISIT HELP DESK 
            </button>
          </div>
        )}

        {/* Logout Button */}
        <div className="pt-6 border-t-3 border-dashed border-[#1a1c1c] mt-8 flex justify-end">
          <button
            type="button"
            onClick={onLogout}
            className="px-6 py-2.5 bg-red-500 text-white border-3 border-[#1a1c1c] shadow-[3px_3px_0px_0px_#111111] font-black text-xs uppercase rounded-xl hover:bg-red-600 cursor-pointer"
          >
            LOGOUT OF CARTOON VAULT 
          </button>
        </div>
      </div>
    </div>
  );
}
