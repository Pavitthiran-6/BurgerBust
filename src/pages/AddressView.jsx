import React, { useState } from 'react';
import AddressForm from '../components/AddressForm';

const MAX_ADDRESSES = 5;

export default function AddressView({
  addresses = [],
  onAddAddress,
  onSetDefaultAddress,
  onDeleteAddress,
  profile = {},
}) {
  const [showForm, setShowForm] = useState(addresses.length === 0);

  const handleSave = async address => {
    await onAddAddress(address);
    setShowForm(false);
  };

  return (
    <div className="w-full py-8 flex flex-col items-center relative z-10 text-[#1a1c1c] max-w-4xl mx-auto px-4">
      <div className="w-full bg-[#70D6FF] border-4 border-[#1a1c1c] shadow-[8px_8px_0px_0px_#111111] rounded-3xl p-6 md:p-8 text-center mb-8">
        <span className="bg-[#FFD23F] text-[#1a1c1c] border-2 border-[#1a1c1c] px-3 py-0.5 rounded-full text-xs font-black uppercase inline-block mb-2 rotate-[-2deg]">DELIVERY MAP</span>
        <h1 className="font-display-xl text-3xl md:text-5xl font-black uppercase">SAVED DELIVERY ADDRESSES</h1>
        <p className="text-xs font-bold text-gray-800">Stored in your BurgerBurst account for faster checkout. (MAX {MAX_ADDRESSES})</p>
      </div>

      <div className="w-full bg-white border-4 border-[#1a1c1c] shadow-[8px_8px_0px_0px_#111111] p-6 rounded-3xl space-y-4 mb-8">
        <div className="flex flex-wrap justify-between items-center gap-3 border-b-3 border-[#1a1c1c] pb-3">
          <h3 className="font-black text-xl uppercase">YOUR ADDRESSES ({addresses.length}/{MAX_ADDRESSES})</h3>
          <button
            type="button"
            onClick={() => setShowForm(previous => !previous)}
            disabled={addresses.length >= MAX_ADDRESSES}
            className={`px-4 py-2 border-2 border-[#1a1c1c] font-black text-xs uppercase rounded-xl cursor-pointer ${addresses.length >= MAX_ADDRESSES ? 'bg-gray-300 opacity-60 cursor-not-allowed' : 'bg-[#FFD23F]'}`}
          >
            {showForm ? 'CLOSE FORM' : '+ ADD ADDRESS'}
          </button>
        </div>

        {showForm && (
          <AddressForm
            profile={profile}
            onSave={handleSave}
            onCancel={addresses.length ? () => setShowForm(false) : undefined}
          />
        )}

        {addresses.length === 0 ? (
          <div className="p-8 text-center bg-gray-50 border-2 border-dashed border-[#1a1c1c] rounded-2xl">
            <p className="text-xs font-bold text-gray-600">No delivery address saved yet. Add one above or during checkout.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {addresses.map(address => (
              <article key={address.id} className="border-3 border-[#1a1c1c] p-4 rounded-2xl shadow-[3px_3px_0px_0px_#111111] flex flex-col justify-between min-h-[170px] bg-[#FFF8E7]">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="bg-[#FF0055] text-white border border-[#1a1c1c] px-2 py-0.5 rounded font-black text-[10px] uppercase">{address.tag}</span>
                    {address.default && <span className="bg-[#34C759] text-white border border-[#1a1c1c] px-2 py-0.5 rounded text-[10px] font-black uppercase">DEFAULT</span>}
                  </div>
                  <h4 className="font-black text-base uppercase">{address.title}</h4>
                  <p className="text-[11px] font-black text-gray-800">{address.recipientName} · {address.phone}</p>
                  <p className="text-xs font-bold text-gray-700">{address.address}</p>
                  <p className="text-[11px] font-bold text-gray-600">{[address.city, address.state, address.postalCode || address.pincode].filter(Boolean).join(', ')}</p>
                </div>
                <div className="flex justify-end gap-3 pt-3 border-t border-dashed border-[#1a1c1c] mt-3 text-[10px] font-black uppercase">
                  {!address.default && <button type="button" onClick={() => onSetDefaultAddress(address.id)} className="text-[#FF0055] underline cursor-pointer">SET DEFAULT</button>}
                  <button type="button" onClick={() => onDeleteAddress(address.id)} className="text-red-600 underline cursor-pointer">DELETE</button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
