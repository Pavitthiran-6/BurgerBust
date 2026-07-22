import React, { useState } from 'react';

export default function CheckoutView({
  cart,
  summary,
  appliedCoupon,
  addresses = [],
  paymentMethods = [],
  rewardPoints = 0,
  onPlaceOrder,
  setCurrentPage,
  showToast
}) {
  const [step, setStep] = useState(1);
  const [selectedAddressId, setSelectedAddressId] = useState(addresses[0]?.id || 1);
  const [selectedPaymentId, setSelectedPaymentId] = useState(paymentMethods[0]?.id || 'p1');
  const [deliveryNote, setDeliveryNote] = useState('Leave at Treehouse Door');
  const [pointsToRedeem, setPointsToRedeem] = useState(0);

  const subtotal = summary?.subtotal ?? cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const discountPercent = appliedCoupon?.discountPercent || (appliedCoupon ? 20 : 0);
  const discount = summary?.couponDiscount ?? (subtotal * discountPercent) / 100;
  const platformFee = 0;
  const deliveryFee = summary?.deliveryFee ?? 3.99;
  const total = summary?.total ?? Math.max(0, subtotal - discount + deliveryFee);

  const activeAddress = addresses.find(a => a.id === selectedAddressId) || addresses[0];
  const activePayment = paymentMethods.find(p => p.id === selectedPaymentId) || paymentMethods[0];

  const handleConfirmOrder = () => {
    if (addresses.length === 0) {
      if (showToast) showToast("No secret base address found! Redirecting to add address...", "warning");
      setCurrentPage('address');
      return;
    }

    if (onPlaceOrder) {
      onPlaceOrder({ ...activeAddress, deliveryInstructions: deliveryNote }, activePayment, pointsToRedeem);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="w-full py-12 flex flex-col items-center justify-center text-center max-w-xl mx-auto px-4">
        <div className="w-24 h-24 bg-[#FFD23F] border-4 border-[#1a1c1c] rounded-full flex items-center justify-center text-5xl mb-4 shadow-[4px_4px_0px_0px_#111111]">
          
        </div>
        <h2 className="font-display-xl text-3xl font-black uppercase text-[#1a1c1c]">YOUR STASH CART IS EMPTY!</h2>
        <p className="text-xs font-bold text-gray-600 my-2">Add delicious cartoon burgers & pizzas before launching magic checkout!</p>
        <button
          type="button"
          onClick={() => setCurrentPage('menu')}
          className="mt-4 px-6 py-3 bg-[#FF0055] text-white border-3 border-[#1a1c1c] shadow-[4px_4px_0px_0px_#111111] font-black text-xs uppercase rounded-xl"
        >
          GO TO MENU BISTRO 
        </button>
      </div>
    );
  }

  return (
    <div className="w-full py-8 flex flex-col items-center relative z-10 text-[#1a1c1c] max-w-4xl mx-auto px-4">
      {/* Header Banner */}
      <div className="w-full bg-[#FF0055] text-white border-4 border-[#1a1c1c] shadow-[8px_8px_0px_0px_#111111] rounded-3xl p-6 text-center mb-8">
        <span className="bg-[#00F0FF] text-[#1a1c1c] border-2 border-[#1a1c1c] px-4 py-1 rounded-full text-xs font-black uppercase inline-block mb-2 rotate-[-2deg]">
          MISSION CONTROL CENTER
        </span>
        <h1 className="font-display-xl text-3xl md:text-5xl font-black uppercase">
          ACTION MASK MAGIC CHECKOUT
        </h1>
      </div>

      {/* Steps Form */}
      <div className="w-full bg-white border-4 border-[#1a1c1c] shadow-[8px_8px_0px_0px_#111111] p-6 md:p-8 rounded-3xl space-y-6">
        <div className="flex border-b-4 border-[#1a1c1c] pb-4 gap-4 text-xs font-black uppercase">
          <span className={step === 1 ? 'text-[#FF0055] underline' : 'text-gray-400'}>1. BASE ADDRESS & INSTRUCTIONS</span>
          <span className={step === 2 ? 'text-[#FF0055] underline' : 'text-gray-400'}>2. POWER WALLET & DISPATCH</span>
        </div>

        {step === 1 ? (
          <div className="space-y-6">
            <div>
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-black text-lg uppercase">SECRET BASE ADDRESS</h3>
                <button
                  type="button"
                  onClick={() => setCurrentPage('address')}
                  className="text-xs font-black text-[#FF0055] underline cursor-pointer"
                >
                  + MANAGE MAP BASES
                </button>
              </div>

              {addresses.length === 0 ? (
                <div className="bg-red-50 border-2 border-red-500 p-4 rounded-xl text-xs font-bold text-red-700 flex justify-between items-center">
                  <span>No address pinned! Please add a secret base address.</span>
                  <button
                    type="button"
                    onClick={() => setCurrentPage('address')}
                    className="px-3 py-1 bg-[#FFD23F] text-[#1a1c1c] border border-black font-black text-[10px] uppercase rounded-lg"
                  >
                    ADD BASE 
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  {addresses.map((addr) => (
                    <label key={addr.id} className={`flex items-center justify-between p-4 border-3 border-[#1a1c1c] rounded-2xl cursor-pointer ${selectedAddressId === addr.id ? 'bg-[#FFF8E7]' : 'bg-[#fcfbf7]'}`}>
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="selectedAddr"
                          checked={selectedAddressId === addr.id}
                          onChange={() => setSelectedAddressId(addr.id)}
                          className="w-4 h-4 accent-[#FF0055]"
                        />
                        <div>
                          <span className="font-black text-xs uppercase block">{addr.title} ({addr.tag})</span>
                          <span className="text-[11px] font-bold text-gray-600">{addr.address}</span>
                        </div>
                      </div>
                      {addr.default && <span className="bg-[#34C759] text-white text-[9px] font-black px-2 py-0.5 rounded uppercase border border-black">PRIMARY</span>}
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Classified Delivery Instructions */}
            <div className="space-y-2">
              <h3 className="font-black text-sm uppercase">CLASSIFIED DELIVERY INSTRUCTIONS</h3>
              <div className="space-y-2">
                {['Leave at Treehouse Door', 'Don\'t Ring Bell - Sleeping Dragon', 'Ring 3 Times & Shout BOOM!'].map((note, i) => (
                  <label key={i} className="flex items-center gap-3 p-3 border-2 border-[#1a1c1c] rounded-xl bg-[#fcfbf7] text-xs font-bold cursor-pointer">
                    <input
                      type="radio"
                      name="note"
                      defaultChecked={i === 0}
                      onChange={() => setDeliveryNote(note)}
                    />
                    {note}
                  </label>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={() => setStep(2)}
              className="w-full py-3.5 bg-[#FFD23F] text-[#1a1c1c] border-3 border-[#1a1c1c] shadow-[4px_4px_0px_0px_#111111] font-black text-xs uppercase rounded-xl cursor-pointer hover:bg-yellow-400"
            >
              NEXT: POWER WALLET 
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <div>
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-black text-lg uppercase">SELECT POWER PAYMENT METHOD</h3>
                <button
                  type="button"
                  onClick={() => setCurrentPage('payment')}
                  className="text-xs font-black text-[#FF0055] underline cursor-pointer"
                >
                  + MANAGE WALLET
                </button>
              </div>

              <div className="space-y-2 text-xs font-bold">
                {paymentMethods.map((pm) => (
                  <label key={pm.id} className={`flex items-center justify-between p-3.5 border-3 border-[#1a1c1c] rounded-xl cursor-pointer ${selectedPaymentId === pm.id ? 'bg-yellow-100' : 'bg-[#fcfbf7]'}`}>
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="pay"
                        checked={selectedPaymentId === pm.id}
                        onChange={() => setSelectedPaymentId(pm.id)}
                        className="w-4 h-4 accent-[#FF0055]"
                      />
                      <span className="font-black uppercase">{pm.type} ({pm.details})</span>
                    </div>
                    {pm.primary && <span className="bg-[#00F0FF] text-[#1a1c1c] text-[9px] font-black px-2 py-0.5 rounded uppercase border border-black">PRIMARY</span>}
                  </label>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border-2 border-[#1a1c1c] bg-yellow-50 p-4">
              <label className="mb-2 block text-xs font-black uppercase">
                Redeem reward points ({rewardPoints} available)
              </label>
              <input
                type="number"
                min="0"
                max={rewardPoints}
                value={pointsToRedeem}
                onChange={(event) => setPointsToRedeem(Math.min(rewardPoints, Math.max(0, Number(event.target.value) || 0)))}
                className="w-full rounded-xl border-2 border-[#1a1c1c] bg-white p-2 text-sm font-black"
              />
              <p className="mt-1 text-[10px] font-bold text-gray-600">Balance and redemption limits are validated again by the backend.</p>
            </div>

            {/* Mission Manifest Summary */}
            <div className="bg-[#fcfbf7] border-3 border-[#1a1c1c] p-5 rounded-2xl space-y-2 text-xs font-bold">
              <div className="flex justify-between"><span>SUBTOTAL ({cart.reduce((a,c) => a + c.quantity, 0)} ITEMS)</span><span>${subtotal.toFixed(2)}</span></div>
              {appliedCoupon && (
                <div className="flex justify-between text-green-600 font-black">
                  <span>COUPON DISCOUNT ({appliedCoupon.code})</span>
                  <span>-${discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between"><span>ANYWHERE DOOR DISPATCH</span><span>${deliveryFee.toFixed(2)}</span></div>
              <div className="flex justify-between"><span>TAX</span><span>${(summary?.tax || 0).toFixed(2)}</span></div>
              {platformFee > 0 && <div className="flex justify-between"><span>PLATFORM FEE</span><span>${platformFee.toFixed(2)}</span></div>}
              <div className="flex justify-between text-base font-black border-t-2 border-dashed border-[#1a1c1c] pt-2 text-[#FF0055]">
                <span>TOTAL DISPATCH</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>

            <div className="flex gap-4 pt-4 border-t-2 border-dashed border-[#1a1c1c]">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-6 py-3.5 bg-gray-200 border-3 border-[#1a1c1c] font-black text-xs uppercase rounded-xl cursor-pointer"
              >
                BACK
              </button>
              <button
                type="button"
                onClick={handleConfirmOrder}
                disabled={isPlacingOrder}
                className={`flex-1 py-3.5 border-3 border-[#1a1c1c] shadow-[4px_4px_0px_0px_#111111] font-black text-xs uppercase rounded-xl cursor-pointer ${
                  isPlacingOrder ? 'bg-gray-400 text-gray-800 cursor-not-allowed opacity-80' : 'bg-[#34C759] text-white hover:bg-green-600'
                }`}
              >
                {isPlacingOrder ? 'LAUNCHING DISPATCH... ' : `CONFIRM & LAUNCH DISPATCH • $${total.toFixed(2)}`}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
