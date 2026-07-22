import React, { useState } from 'react';

const PAYMENT_TYPES = ['OMNITRIX CARD', 'POKÉBALL PAY (UPI)', 'HERO DEBIT CARD', 'TOON WALLET', 'CASH ON DELIVERY', 'GOLD VOUCHER'];

const ICON_MAP = {
  'OMNITRIX CARD': 'credit_card',
  'POKÉBALL PAY (UPI)': 'account_balance_wallet',
  'HERO DEBIT CARD': 'credit_card',
  'TOON WALLET': 'wallet',
  'CASH ON DELIVERY': 'payments',
  'GOLD VOUCHER': 'card_giftcard',
};

function maskCard(details = '') {
  // If looks like card (has digits), show only last 4
  const digits = details.replace(/\D/g, '');
  if (digits.length >= 4) {
    return `•••• •••• •••• ${digits.slice(-4)}`;
  }
  return details;
}

function isExpired(exp = '') {
  if (!exp || exp === 'INSTANT' || exp === 'NEVER') return false;
  const [month, year] = exp.split('/').map(Number);
  const now = new Date();
  return year < now.getFullYear() % 100 || (year === now.getFullYear() % 100 && month < now.getMonth() + 1);
}

export default function PaymentView({ paymentMethods = [], setPaymentMethods, showToast }) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [type, setType] = useState('OMNITRIX CARD');
  const [details, setDetails] = useState('');
  const [exp, setExp] = useState('');
  const [formError, setFormError] = useState('');
  const [walletBalance] = useState(24.50); // mock wallet balance

  const TRANSACTIONS = [
    { date: "TODAY", desc: "ORDER #BURST-8842 DISPATCH", amount: "-$32.50", status: "SUCCESS" },
    { date: "YESTERDAY", desc: "REDEEMED POKÉBALL VOUCHER", amount: "+$10.00", status: "CREDITED" },
    { date: "3 DAYS AGO", desc: "ORDER #BURST-7712 DISPATCH", amount: "-$18.99", status: "SUCCESS" },
    { date: "5 DAYS AGO", desc: "PAYMENT FAILED - RETRY", amount: "$0.00", status: "FAILED" },
  ];

  const validateAndAdd = (e) => {
    e.preventDefault();
    setFormError('');

    if (!details.trim()) { setFormError('Please enter payment details.'); return; }

    // Validate expiry for card types
    const requiresExpiry = type.includes('CARD');
    if (requiresExpiry) {
      if (!exp) { setFormError('Expiry date is required for card payments.'); return; }
      if (isExpired(exp)) { setFormError('This card has expired! Please use a valid card.'); return; }
    }

    // COD only for orders < $50 (enforced at checkout, note here)
    if (type === 'CASH ON DELIVERY') {
      if (showToast) showToast('COD is only available for orders under $50.', 'info');
    }

    const newMethod = {
      id: `p_${Date.now()}`,
      type,
      details: type.includes('CARD') ? maskCard(details) : details,
      exp: exp || 'N/A',
      primary: paymentMethods.length === 0,
      icon: ICON_MAP[type] || 'credit_card',
      isExpired: requiresExpiry ? isExpired(exp) : false,
    };

    if (setPaymentMethods) setPaymentMethods(prev => [...prev, newMethod]);
    if (showToast) showToast(`Added ${type} payment gadget! `, 'success');
    setDetails(''); setExp(''); setShowAddForm(false);
  };

  const handleSetPrimary = (id) => {
    if (setPaymentMethods) setPaymentMethods(prev => prev.map(p => ({ ...p, primary: p.id === id })));
    if (showToast) showToast('Primary payment gadget updated!', 'info');
  };

  const handleDelete = (id) => {
    if (setPaymentMethods) setPaymentMethods(prev => prev.filter(p => p.id !== id));
    if (showToast) showToast('Removed payment gadget.', 'info');
  };

  return (
    <div className="w-full py-8 flex flex-col items-center relative z-10 text-[#1a1c1c] max-w-4xl mx-auto px-4">
      {/* Header */}
      <div className="w-full bg-[#34C759] text-white border-4 border-[#1a1c1c] shadow-[8px_8px_0px_0px_#111111] rounded-3xl p-6 md:p-8 text-center mb-8">
        <span className="bg-[#FFD23F] text-[#1a1c1c] border-2 border-[#1a1c1c] px-3 py-0.5 rounded-full text-xs font-black uppercase inline-block mb-2 rotate-[-2deg]">GADGET POWER HUB</span>
        <h1 className="font-display-xl text-3xl md:text-5xl font-black uppercase">OMNITRIX POWER WALLET</h1>
        <p className="text-xs font-bold text-yellow-200">MANAGE CARDS, UPI, WALLET, COD & TRANSACTION LEDGER!</p>
      </div>

      {/* Toon Wallet Balance */}
      <div className="w-full bg-[#FFD23F] border-4 border-[#1a1c1c] shadow-[8px_8px_0px_0px_#111111] rounded-3xl p-5 mb-6 flex justify-between items-center">
        <div>
          <span className="text-xs font-black uppercase block">TOON WALLET BALANCE</span>
          <span className="text-3xl font-black text-[#1a1c1c]">${walletBalance.toFixed(2)}</span>
        </div>
        <button type="button" className="px-5 py-2.5 bg-[#1a1c1c] text-white border-2 border-[#1a1c1c] font-black text-xs uppercase rounded-xl cursor-pointer">
          ADD FUNDS 
        </button>
      </div>

      {/* Saved Methods */}
      <div className="w-full bg-white border-4 border-[#1a1c1c] shadow-[8px_8px_0px_0px_#111111] p-6 rounded-3xl space-y-4 mb-6">
        <div className="flex justify-between items-center border-b-3 border-[#1a1c1c] pb-3">
          <h3 className="font-black text-xl uppercase">SAVED POWER GADGETS ({paymentMethods.length})</h3>
          <button type="button" onClick={() => setShowAddForm(!showAddForm)}
            className="px-4 py-2 bg-[#FFD23F] text-[#1a1c1c] border-2 border-[#1a1c1c] font-black text-xs uppercase rounded-xl cursor-pointer">
            {showAddForm ? 'CANCEL' : '+ ADD GADGET '}
          </button>
        </div>

        {showAddForm && (
          <form onSubmit={validateAndAdd} className="bg-[#FFF8E7] border-3 border-[#1a1c1c] p-5 rounded-2xl space-y-3">
            <h4 className="font-black text-sm uppercase">ADD NEW PAYMENT GADGET</h4>
            {formError && <div className="bg-red-100 border-2 border-red-500 p-2 rounded-xl text-xs font-bold text-red-700">{formError}</div>}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <select value={type} onChange={(e) => setType(e.target.value)} className="p-3 border-2 border-[#1a1c1c] rounded-xl font-bold text-xs bg-white col-span-1">
                {PAYMENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
              <input type="text" placeholder={type.includes('UPI') ? 'UPI ID (hero@pokepay)' : type.includes('VOUCHER') ? 'Voucher Code' : 'Card Number (last 4 digits)'} value={details}
                onChange={(e) => setDetails(e.target.value)} required className="p-3 border-2 border-[#1a1c1c] rounded-xl font-bold text-xs bg-white col-span-1" />
              {type.includes('CARD') && (
                <input type="text" placeholder="Expiry MM/YY" value={exp} onChange={(e) => setExp(e.target.value)} className="p-3 border-2 border-[#1a1c1c] rounded-xl font-bold text-xs bg-white col-span-1" />
              )}
            </div>
            {type === 'CASH ON DELIVERY' && (
              <p className="text-[10px] font-bold text-orange-600">️ COD is only available for orders under $50.00</p>
            )}
            <button type="submit" className="px-6 py-2.5 bg-[#34C759] text-white border-2 border-[#1a1c1c] font-black text-xs uppercase rounded-xl cursor-pointer">
              SAVE TO WALLET 
            </button>
          </form>
        )}

        <div className="space-y-3">
          {paymentMethods.length === 0 ? (
            <div className="p-6 text-center bg-gray-50 border-2 border-dashed border-[#1a1c1c] rounded-2xl text-xs font-bold text-gray-600">No payment gadgets saved yet!</div>
          ) : paymentMethods.map((m) => {
            const expired = isExpired(m.exp);
            return (
              <div key={m.id} className={`border-3 border-[#1a1c1c] p-4 rounded-2xl flex justify-between items-center shadow-[2px_2px_0px_0px_#111111] ${expired ? 'bg-red-50 opacity-80' : 'bg-[#fcfbf7]'}`}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#FFD23F] border-2 border-[#1a1c1c] rounded-xl flex items-center justify-center">
                    <span className="material-symbols-outlined text-xl">{m.icon || 'credit_card'}</span>
                  </div>
                  <div>
                    <h4 className="font-black text-sm uppercase">{m.type}</h4>
                    <p className="text-xs font-bold text-gray-600">{m.details} {m.exp !== 'N/A' && `• Exp: ${m.exp}`}</p>
                    {expired && <span className="text-[10px] font-black text-red-600">EXPIRED — Please update or remove</span>}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {m.primary ? (
                    <span className="bg-[#00F0FF] text-[#1a1c1c] border border-[#1a1c1c] px-2 py-0.5 rounded-full text-[10px] font-black uppercase">PRIMARY</span>
                  ) : (
                    <button type="button" onClick={() => handleSetPrimary(m.id)} className="text-[10px] font-black text-[#FF0055] underline cursor-pointer">SET PRIMARY</button>
                  )}
                  <button type="button" onClick={() => handleDelete(m.id)} className="text-xs text-red-600 font-black cursor-pointer ml-2"></button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Transaction History */}
      <div className="w-full bg-white border-4 border-[#1a1c1c] shadow-[8px_8px_0px_0px_#111111] p-6 rounded-3xl">
        <h3 className="font-black text-xl uppercase border-b-3 border-[#1a1c1c] pb-2 mb-4">TRANSACTION LEDGER</h3>
        <div className="space-y-2">
          {TRANSACTIONS.map((t, idx) => (
            <div key={idx} className={`flex justify-between items-center border-2 border-[#1a1c1c] p-3 rounded-xl ${t.status === 'FAILED' ? 'bg-red-50' : 'bg-[#fcfbf7]'}`}>
              <div>
                <span className="font-black text-xs uppercase text-[#1a1c1c] block">{t.desc}</span>
                <span className="text-[10px] font-bold text-gray-500">{t.date}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`font-black text-sm ${t.amount.startsWith('+') ? 'text-green-600' : t.status === 'FAILED' ? 'text-gray-400' : 'text-[#FF0055]'}`}>{t.amount}</span>
                <span className={`text-[9px] font-black px-1.5 py-0.5 rounded border ${t.status === 'SUCCESS' ? 'bg-green-100 text-green-700 border-green-300' : t.status === 'FAILED' ? 'bg-red-100 text-red-700 border-red-300' : 'bg-blue-100 text-blue-700 border-blue-300'}`}>{t.status}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
