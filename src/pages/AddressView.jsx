import React, { useState } from 'react';

const MAX_ADDRESSES = 5;
const TAGS = ['HOME BASE', 'WORK BASE', 'FRIENDS BASE', 'SECRET DEN'];

export default function AddressView({ addresses = [], setAddresses, showToast, profile = {} }) {
  const [showForm, setShowForm] = useState(addresses.length === 0);
  const [recipientName, setRecipientName] = useState(profile.name || '');
  const [phone, setPhone] = useState(profile.phone || '');
  const [title, setTitle] = useState('');
  const [addressStr, setAddressStr] = useState('');
  const [apartment, setApartment] = useState('');
  const [floor, setFloor] = useState('');
  const [landmark, setLandmark] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [deliveryNotes, setDeliveryNotes] = useState('');
  const [tag, setTag] = useState('HOME BASE');
  const [pincode, setPincode] = useState('');
  const [pincodeError, setPincodeError] = useState('');

  const validatePincode = (p) => {
    if (!p) return 'PIN code is required.';
    if (!/^\d{5,6}$/.test(p)) return 'PIN code must be 5-6 digits.';
    return '';
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (addresses.length >= MAX_ADDRESSES) {
      if (showToast) showToast(`Maximum ${MAX_ADDRESSES} secret bases allowed! Remove one first.`, 'warning');
      return;
    }
    const pError = validatePincode(pincode);
    if (pError) { setPincodeError(pError); return; }

    const addressLine2 = [apartment, floor ? `Floor ${floor}` : '', landmark ? `Near ${landmark}` : ''].filter(Boolean).join(', ');
    const fullAddress = [addressStr, addressLine2].filter(Boolean).join(', ');

    // Prevent duplicate addresses
    const isDuplicate = addresses.some(a => a.address.toLowerCase() === fullAddress.toLowerCase());
    if (isDuplicate) {
      if (showToast) showToast('This address is already saved!', 'warning');
      return;
    }

    const newAddr = {
      id: Date.now(),
      title: title.toUpperCase() || tag,
      recipientName: recipientName.trim(),
      phone: phone.trim(),
      address: fullAddress,
      addressLine1: addressStr.trim(),
      addressLine2,
      apartment,
      floor,
      landmark,
      city: city.trim(),
      state: state.trim(),
      deliveryNotes,
      deliveryInstructions: deliveryNotes,
      pincode: pincode.trim(),
      postalCode: pincode.trim(),
      tag,
      default: addresses.length === 0,
      serviceable: true,
    };

    if (setAddresses) setAddresses(prev => [...prev, newAddr]);
    if (showToast) showToast(`Saved delivery address: ${newAddr.title}!`, 'success');
    setTitle(''); setAddressStr(''); setApartment(''); setFloor(''); setLandmark(''); setCity(''); setState(''); setDeliveryNotes(''); setPincode(''); setPincodeError('');
    setShowForm(false);
  };

  const handleSetDefault = (id) => {
    if (setAddresses) setAddresses(prev => prev.map(a => ({ ...a, default: a.id === id })));
    if (showToast) showToast('Primary secret base updated!', 'info');
  };

  const handleDelete = (id) => {
    if (setAddresses) setAddresses(prev => prev.filter(a => a.id !== id));
    if (showToast) showToast('Removed secret base.', 'info');
  };

  return (
    <div className="w-full py-8 flex flex-col items-center relative z-10 text-[#1a1c1c] max-w-4xl mx-auto px-4">
      {/* Header */}
      <div className="w-full bg-[#70D6FF] border-4 border-[#1a1c1c] shadow-[8px_8px_0px_0px_#111111] rounded-3xl p-6 md:p-8 text-center mb-8">
        <span className="bg-[#FFD23F] text-[#1a1c1c] border-2 border-[#1a1c1c] px-3 py-0.5 rounded-full text-xs font-black uppercase inline-block mb-2 rotate-[-2deg]">PARCHMENT MAP PINS</span>
        <h1 className="font-display-xl text-3xl md:text-5xl font-black uppercase">TREASURE MAP SECRET BASES</h1>
        <p className="text-xs font-bold text-gray-800">YOUR SAVED DELIVERY DETAILS FOR FASTER CHECKOUT! (MAX {MAX_ADDRESSES})</p>
      </div>

      {/* Address List */}
      <div className="w-full bg-white border-4 border-[#1a1c1c] shadow-[8px_8px_0px_0px_#111111] p-6 rounded-3xl space-y-4 mb-8">
        <div className="flex justify-between items-center border-b-3 border-[#1a1c1c] pb-3">
          <h3 className="font-black text-xl uppercase">PINNED BASES ({addresses.length}/{MAX_ADDRESSES})</h3>
          <div className="flex gap-2">
            <button type="button" onClick={() => setShowForm(!showForm)} disabled={addresses.length >= MAX_ADDRESSES}
              className={`px-4 py-2 border-2 border-[#1a1c1c] font-black text-xs uppercase rounded-xl cursor-pointer ${addresses.length >= MAX_ADDRESSES ? 'bg-gray-300 opacity-60 cursor-not-allowed' : 'bg-[#FFD23F]'}`}>
              {showForm ? 'CANCEL' : '+ PIN NEW BASE '}
            </button>
          </div>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} className="bg-[#FFF8E7] border-3 border-[#1a1c1c] p-5 rounded-2xl space-y-3 animate-fadeIn">
            <div>
              <h4 className="font-black text-sm uppercase">ADD YOUR DELIVERY ADDRESS</h4>
              <p className="text-[11px] font-bold text-gray-600">Use your real delivery details. BurgerBurst does not insert demo locations.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input type="text" placeholder="Recipient Name *" value={recipientName} onChange={(e) => setRecipientName(e.target.value)} required className="p-3 border-2 border-[#1a1c1c] rounded-xl font-bold text-xs bg-white" />
              <input type="tel" placeholder="Phone Number *" value={phone} onChange={(e) => setPhone(e.target.value)} required pattern="[+0-9][0-9 ()-]{6,19}" className="p-3 border-2 border-[#1a1c1c] rounded-xl font-bold text-xs bg-white" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input type="text" placeholder="Address Label (e.g. Home)" value={title} onChange={(e) => setTitle(e.target.value)} className="p-3 border-2 border-[#1a1c1c] rounded-xl font-bold text-xs bg-white" />
              <select value={tag} onChange={(e) => setTag(e.target.value)} className="p-3 border-2 border-[#1a1c1c] rounded-xl font-bold text-xs bg-white">
                {TAGS.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <input type="text" placeholder="Street Address *" value={addressStr} onChange={(e) => setAddressStr(e.target.value)} required className="w-full p-3 border-2 border-[#1a1c1c] rounded-xl font-bold text-xs bg-white" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <input type="text" placeholder="Apartment / Suite" value={apartment} onChange={(e) => setApartment(e.target.value)} className="p-3 border-2 border-[#1a1c1c] rounded-xl font-bold text-xs bg-white" />
              <input type="text" placeholder="Floor No." value={floor} onChange={(e) => setFloor(e.target.value)} className="p-3 border-2 border-[#1a1c1c] rounded-xl font-bold text-xs bg-white" />
              <div>
                <input type="text" placeholder="PIN Code *" value={pincode} onChange={(e) => { setPincode(e.target.value); setPincodeError(validatePincode(e.target.value)); }}
                  required inputMode="numeric" className={`w-full p-3 border-2 rounded-xl font-bold text-xs bg-white ${pincodeError ? 'border-red-500' : 'border-[#1a1c1c]'}`} />
                {pincodeError && <p className="text-[10px] text-red-600 font-bold mt-1">{pincodeError}</p>}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input type="text" placeholder="City *" value={city} onChange={(e) => setCity(e.target.value)} required className="p-3 border-2 border-[#1a1c1c] rounded-xl font-bold text-xs bg-white" />
              <input type="text" placeholder="State *" value={state} onChange={(e) => setState(e.target.value)} required className="p-3 border-2 border-[#1a1c1c] rounded-xl font-bold text-xs bg-white" />
            </div>
            <input type="text" placeholder="Landmark (near hospital, school...)" value={landmark} onChange={(e) => setLandmark(e.target.value)} className="w-full p-3 border-2 border-[#1a1c1c] rounded-xl font-bold text-xs bg-white" />
            <textarea placeholder="Delivery notes (e.g. Ring bell twice, leave at door...)" value={deliveryNotes} onChange={(e) => setDeliveryNotes(e.target.value)}
              rows={2} className="w-full p-3 border-2 border-[#1a1c1c] rounded-xl font-bold text-xs bg-white resize-none" />
            <button type="submit" className="px-6 py-2.5 bg-[#34C759] text-white border-2 border-[#1a1c1c] font-black text-xs uppercase rounded-xl cursor-pointer">SAVE BASE </button>
          </form>
        )}

        {addresses.length === 0 ? (
          <div className="p-8 text-center bg-gray-50 border-2 border-dashed border-[#1a1c1c] rounded-2xl">
            <span className="text-3xl block mb-2">️</span>
            <p className="text-xs font-bold text-gray-600">No secret bases pinned! Click + PIN NEW BASE to add one.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {addresses.map((a) => (
              <div key={a.id} className={`border-3 border-[#1a1c1c] p-4 rounded-2xl shadow-[3px_3px_0px_0px_#111111] flex flex-col justify-between min-h-[160px] ${a.serviceable === false ? 'bg-red-50' : 'bg-[#FFF8E7]'}`}>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="bg-[#FF0055] text-white border border-[#1a1c1c] px-2 py-0.5 rounded font-black text-[10px] uppercase">{a.tag}</span>
                    <div className="flex gap-1 items-center">
                      {a.serviceable === false && <span className="bg-red-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded">OUT OF RANGE</span>}
                      {a.serviceable !== false && <span className="bg-[#34C759] text-white text-[9px] font-black px-1.5 py-0.5 rounded">SERVICEABLE</span>}
                      {a.default && <span className="bg-[#34C759] text-white border border-[#1a1c1c] px-2 py-0.5 rounded text-[10px] font-black uppercase">PRIMARY</span>}
                    </div>
                  </div>
                  <h4 className="font-black text-base uppercase text-[#1a1c1c]">{a.title}</h4>
                  <p className="text-[11px] font-black text-gray-800">{a.recipientName} • {a.phone}</p>
                  <p className="text-xs font-bold text-gray-700">{a.address}</p>
                  <p className="text-[11px] font-bold text-gray-600">{[a.city, a.state, a.postalCode || a.pincode].filter(Boolean).join(', ')}</p>
                  {a.deliveryNotes && <p className="text-[10px] font-bold text-gray-500 mt-1"> {a.deliveryNotes}</p>}
                </div>
                <div className="flex justify-between items-center text-[10px] font-mono font-bold text-gray-500 pt-2 border-t border-dashed border-[#1a1c1c] mt-2">
                  <span>{a.default ? 'DEFAULT DELIVERY ADDRESS' : 'SAVED ADDRESS'}</span>
                  <div className="flex gap-2">
                    {!a.default && <button type="button" onClick={() => handleSetDefault(a.id)} className="text-[#FF0055] font-black underline">SET PRIMARY</button>}
                    <button type="button" onClick={() => handleDelete(a.id)} className="text-red-600 font-black underline">DELETE</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
