import React, { useEffect, useState } from 'react';
import AddressForm from '../components/AddressForm';

export default function CheckoutView({
  cart,
  summary,
  appliedCoupon,
  addresses = [],
  paymentMethods = [],
  rewardPoints = 0,
  isPlacingOrder = false,
  onPlaceOrder,
  onAddAddress,
  profile = {},
  setCurrentPage,
  showToast
}) {
  const [step, setStep] = useState(1);
  const [selectedAddressId, setSelectedAddressId] = useState(addresses.find(address => address.default)?.id || addresses[0]?.id || null);
  const [selectedPaymentId, setSelectedPaymentId] = useState(paymentMethods.find(method => method.primary)?.id || paymentMethods[0]?.id || null);
  const [deliveryNote, setDeliveryNote] = useState('Leave at the door');
  const [pointsToRedeem, setPointsToRedeem] = useState(0);
  const [showAddressForm, setShowAddressForm] = useState(addresses.length === 0);

  useEffect(() => {
    if (!addresses.some(address => address.id === selectedAddressId)) {
      setSelectedAddressId(addresses.find(address => address.default)?.id || addresses[0]?.id || null);
    }
    if (addresses.length === 0) {
      setShowAddressForm(true);
    }
  }, [addresses, selectedAddressId]);

  const subtotal = summary?.subtotal ?? cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const discountPercent = appliedCoupon?.discountPercent || (appliedCoupon ? 20 : 0);
  const discount = summary?.couponDiscount ?? (subtotal * discountPercent) / 100;
  const platformFee = 0;
  const deliveryFee = summary?.deliveryFee ?? 3.99;
  const total = summary?.total ?? Math.max(0, subtotal - discount + deliveryFee);

  const activeAddress = addresses.find(a => a.id === selectedAddressId) || addresses[0];
  const activePayment = paymentMethods.find(p => p.id === selectedPaymentId) || paymentMethods[0];
  const paymentIsOnline = !activePayment?.type?.toUpperCase().includes('CASH');
  const currency = summary?.currency || 'INR';
  const money = value => new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(Number(value || 0));

  const addressIsComplete = activeAddress && [
    activeAddress.recipientName,
    activeAddress.phone,
    activeAddress.addressLine1 || activeAddress.address,
    activeAddress.city,
    activeAddress.state,
    activeAddress.postalCode || activeAddress.pincode,
  ].every(value => String(value || '').trim());

  const handleContinueToPayment = () => {
    if (!addressIsComplete) {
      if (showToast) showToast('Add a complete delivery address before choosing payment.', 'warning');
      setShowAddressForm(true);
      return;
    }
    setStep(2);
  };

  const handleCheckoutAddressSave = async address => {
    const savedAddress = await onAddAddress(address);
    setSelectedAddressId(savedAddress.id);
    setShowAddressForm(false);
  };

  const handleConfirmOrder = () => {
    if (addresses.length === 0) {
      if (showToast) showToast('Add a delivery address before placing your order.', 'warning');
      setStep(1);
      setShowAddressForm(true);
      return;
    }

    if (onPlaceOrder) {
      onPlaceOrder({ ...activeAddress, deliveryInstructions: deliveryNote }, activePayment, pointsToRedeem);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="w-full py-16 flex flex-col items-center justify-center text-center max-w-xl mx-auto px-4 text-[#1a1c1c] font-body-md">
        <div className="w-24 h-24 bg-[#FF6B00] border-4 border-[#1a1c1c] rounded-full flex items-center justify-center text-5xl mb-4 shadow-[6px_6px_0px_0px_#111111]">
          🐉
        </div>
        <h2 className="font-headline-xl text-3xl font-black uppercase text-[#1a1c1c]">YOUR SAIYAN ENERGY STASH IS EMPTY!</h2>
        <p className="font-body-lg text-sm font-bold text-gray-700 my-3">
          Summon Dragon Ball feast items from the menu before launching Kamehameha checkout!
        </p>
        <button
          type="button"
          onClick={() => setCurrentPage('menu')}
          className="mt-4 px-8 py-4 bg-[#FF6B00] text-white border-4 border-[#1a1c1c] shadow-[6px_6px_0px_0px_#111111] font-headline-md font-black text-sm uppercase rounded-2xl hover:bg-[#e05e00] cursor-pointer"
        >
          BROWSE BATTLE MENU ⚡
        </button>
      </div>
    );
  }

  return (
    <div className="w-full py-8 flex flex-col items-center relative z-10 text-[#1a1c1c] max-w-6xl mx-auto px-4 font-body-md">
      {/* Dynamic Header Banner */}
      <div className={`w-full border-4 border-[#1a1c1c] rounded-[2.5rem] p-6 md:p-8 text-center mb-8 relative overflow-hidden transition-all duration-500 ${
        step === 1 
          ? 'bg-gradient-to-r from-[#FF6B00] via-[#FF8C00] to-[#FF6B00] text-white shadow-[10px_10px_0px_0px_#111111]' 
          : 'bg-gradient-to-r from-[#0B132B] via-[#1C2541] to-[#0B132B] text-white shadow-[10px_10px_0px_0px_#00F0FF]'
      }`}>
        <div className="absolute -left-6 -top-6 text-7xl opacity-20 pointer-events-none">🐉</div>
        <div className="absolute -right-6 -bottom-6 text-7xl opacity-20 pointer-events-none">⚡</div>

        <div className="flex justify-center mb-3">
          <span className={`border-2 border-black px-4 py-1 rounded-full text-xs font-headline-md font-black uppercase tracking-wider shadow-[3px_3px_0px_0px_#111111] ${
            step === 1 ? 'bg-white text-[#FF6B00]' : 'bg-[#00F0FF] text-[#1a1c1c]'
          }`}>
            {step === 1 ? 'STEP 1 OF 2: SAIYAN CAPSULE BASE RADAR 📍' : 'STEP 2 OF 2: KI POWER WALLET & SHENRON DISPATCH ⚡'}
          </span>
        </div>

        <h1 className="font-headline-xl text-3xl md:text-5xl font-black uppercase tracking-tight text-[#FFD23F] drop-shadow-[3px_3px_0px_#000000]">
          {step === 1 ? 'SAIYAN DISPATCH COMMAND' : 'SHENRON POWER WALLET'}
        </h1>
        <p className="font-body-lg text-xs md:text-sm font-bold text-gray-100 mt-2">
          {step === 1 ? 'SET YOUR DELIVERY CAPSULE BASE & BATTLE INSTRUCTIONS' : 'CONFIRM YOUR PAYMENT MANIFEST & SUMMON THE FEAST'}
        </p>
      </div>

      {step === 1 ? (
        /* ========================================================================= */
        /* STEP 1 LAYOUT: 2-COLUMN SPLIT RADAR GRID (Address & Directives)           */
        /* ========================================================================= */
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Address Radar Selector */}
          <div className="lg:col-span-7 bg-white border-4 border-[#1a1c1c] shadow-[10px_10px_0px_0px_#FF6B00] p-6 md:p-8 rounded-[2.5rem] space-y-6">
            <div className="flex justify-between items-center pb-4 border-b-4 border-[#1a1c1c]">
              <h3 className="font-headline-lg text-xl md:text-2xl font-black uppercase flex items-center gap-2 text-[#1a1c1c]">
                <span>📍</span> SAVED CAPSULE BASES
              </h3>
              <button
                type="button"
                onClick={() => setShowAddressForm(previous => !previous)}
                disabled={addresses.length >= 5}
                className="font-headline-md text-xs font-black text-[#FF6B00] bg-orange-100 px-3 py-1.5 rounded-xl border-2 border-black shadow-[2px_2px_0px_0px_#111111] hover:bg-orange-200 cursor-pointer disabled:text-gray-400 disabled:no-underline"
              >
                {showAddressForm ? 'CLOSE FORM' : '+ ADD BASE'}
              </button>
            </div>

            {showAddressForm && (
              <div className="p-4 border-3 border-[#1a1c1c] rounded-2xl bg-orange-50">
                <AddressForm
                  profile={profile}
                  onSave={handleCheckoutAddressSave}
                  onCancel={addresses.length ? () => setShowAddressForm(false) : undefined}
                  submitLabel="SAVE CAPSULE BASE ADDRESS"
                />
              </div>
            )}

            {addresses.length > 0 && (
              <div className="space-y-4">
                {addresses.map((addr) => (
                  <label
                    key={addr.id}
                    className={`flex items-start justify-between p-5 border-4 border-[#1a1c1c] rounded-2xl cursor-pointer transition-all ${
                      selectedAddressId === addr.id
                        ? 'bg-[#FFF3E0] shadow-[6px_6px_0px_0px_#FF6B00] translate-x-1'
                        : 'bg-white hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <input
                        type="radio"
                        name="selectedAddr"
                        checked={selectedAddressId === addr.id}
                        onChange={() => setSelectedAddressId(addr.id)}
                        className="w-6 h-6 accent-[#FF6B00] mt-1"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-headline-md font-black text-sm uppercase text-[#1a1c1c]">{addr.title} ({addr.tag})</span>
                          <span className="font-body-md text-xs font-bold text-gray-500">[{addr.recipientName} • {addr.phone}]</span>
                        </div>
                        <span className="font-body-md text-xs font-bold text-gray-800 block mt-1">{addr.addressLine1 || addr.address}</span>
                        <span className="font-body-md text-[11px] font-semibold text-gray-500 block">
                          {[addr.city, addr.state, addr.postalCode || addr.pincode].filter(Boolean).join(', ')}
                        </span>
                      </div>
                    </div>
                    {addr.default && (
                      <span className="bg-[#10B981] text-white text-[9px] font-headline-md font-black px-2.5 py-1 rounded-full uppercase border-2 border-black shadow-[2px_2px_0px_0px_#000]">
                        PRIMARY ⭐️
                      </span>
                    )}
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Directives & Mini Manifest Preview */}
          <div className="lg:col-span-5 space-y-6">
            {/* Directives Card */}
            <div className="bg-[#FFF8E7] border-4 border-[#1a1c1c] shadow-[10px_10px_0px_0px_#111111] p-6 md:p-8 rounded-[2.5rem] space-y-4">
              <h3 className="font-headline-lg text-lg font-black uppercase flex items-center gap-2 text-[#1a1c1c]">
                <span>⚡</span> DISPATCH DIRECTIVES
              </h3>
              <div className="space-y-3">
                {['Leave at the door', 'Do not ring the bell', 'Call when you arrive'].map((note, i) => (
                  <label
                    key={i}
                    className={`flex items-center gap-3 p-4 border-3 border-[#1a1c1c] rounded-2xl font-headline-md text-xs font-bold cursor-pointer transition-all ${
                      deliveryNote === note ? 'bg-amber-200 shadow-[4px_4px_0px_0px_#111111]' : 'bg-white hover:bg-amber-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="note"
                      checked={deliveryNote === note}
                      onChange={() => setDeliveryNote(note)}
                      className="accent-[#FF6B00] w-4 h-4"
                    />
                    {note}
                  </label>
                ))}
              </div>
            </div>

            {/* Stash Mini Preview */}
            <div className="bg-white border-4 border-[#1a1c1c] shadow-[10px_10px_0px_0px_#FFD23F] p-6 rounded-[2.5rem] space-y-3">
              <div className="flex justify-between items-center font-headline-md text-xs font-black text-gray-700">
                <span>STASH ITEMS ({cart.reduce((a,c) => a + c.quantity, 0)})</span>
                <span className="bg-yellow-200 text-[#1a1c1c] px-2 py-0.5 rounded border border-black text-[10px]">FAST DISPATCH</span>
              </div>
              <div className="flex justify-between items-center font-headline-lg text-xl font-black text-[#1a1c1c]">
                <span>ESTIMATED SUBTOTAL</span>
                <span className="text-[#FF6B00]">{money(subtotal)}</span>
              </div>
            </div>

            {/* Next Action Button */}
            <button
              type="button"
              onClick={handleContinueToPayment}
              className="w-full py-5 bg-[#FF6B00] text-white border-4 border-[#1a1c1c] shadow-[8px_8px_0px_0px_#111111] font-headline-xl font-black text-base uppercase rounded-[2.5rem] cursor-pointer hover:bg-[#e05e00] transition-all flex items-center justify-center gap-2"
            >
              CONTINUE TO KI POWER WALLET ⚡
            </button>
          </div>
        </div>
      ) : (
        /* ========================================================================= */
        /* STEP 2 LAYOUT: BENTO CARD PAYMENT MATRIX (Payment Vault & Shenron Scroll) */
        /* ========================================================================= */
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Cyber Payment Vault & Ki Points Reservoir */}
          <div className="lg:col-span-7 space-y-6">
            {/* Bento Card 1: Payment Vault */}
            <div className="bg-white border-4 border-[#1a1c1c] shadow-[10px_10px_0px_0px_#00F0FF] p-6 md:p-8 rounded-[2.5rem] space-y-4">
              <div className="flex justify-between items-center pb-3 border-b-4 border-[#1a1c1c]">
                <h3 className="font-headline-lg text-xl font-black uppercase flex items-center gap-2 text-[#1a1c1c]">
                  <span>⚡</span> SELECT KI PAYMENT MANIFEST
                </h3>
                <span className="bg-[#00F0FF] text-[#1a1c1c] px-3 py-1 rounded-full text-[10px] font-headline-md font-black border border-black">
                  ENCRYPTED 🔐
                </span>
              </div>

              <div className="grid grid-cols-1 gap-3 font-headline-md text-xs font-bold">
                {paymentMethods.map((pm) => (
                  <label
                    key={pm.id}
                    className={`flex items-center justify-between p-4 border-3 border-[#1a1c1c] rounded-2xl cursor-pointer transition-all ${
                      selectedPaymentId === pm.id
                        ? 'bg-[#E0F7FA] shadow-[6px_6px_0px_0px_#00F0FF] translate-x-1'
                        : 'bg-white hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="pay"
                        checked={selectedPaymentId === pm.id}
                        onChange={() => setSelectedPaymentId(pm.id)}
                        className="w-5 h-5 accent-[#00F0FF]"
                      />
                      <span className="font-headline-md font-black text-sm uppercase text-[#1a1c1c]">
                        {pm.type} ({pm.details})
                      </span>
                    </div>
                    {pm.primary && (
                      <span className="bg-[#00F0FF] text-[#1a1c1c] text-[9px] font-headline-md font-black px-2.5 py-1 rounded-full uppercase border border-black shadow-[2px_2px_0px_0px_#000]">
                        DEFAULT ⚡
                      </span>
                    )}
                  </label>
                ))}
              </div>
            </div>

            {/* Bento Card 2: Ki Points Reservoir */}
            <div className="bg-[#FFF8E7] border-4 border-[#1a1c1c] shadow-[10px_10px_0px_0px_#FFD23F] p-6 rounded-[2.5rem] space-y-3">
              <label className="block font-headline-lg text-sm font-black uppercase text-[#1a1c1c]">
                REDEEM SAIYAN KI POINTS ({rewardPoints} AVAILABLE 🔮)
              </label>
              <input
                type="number"
                min="0"
                max={rewardPoints}
                value={pointsToRedeem}
                onChange={(event) => setPointsToRedeem(Math.min(rewardPoints, Math.max(0, Number(event.target.value) || 0)))}
                className="w-full rounded-2xl border-3 border-[#1a1c1c] bg-white p-3 font-headline-md font-black text-base text-[#1a1c1c] shadow-[4px_4px_0px_0px_#111111]"
                placeholder="0"
              />
              <p className="font-body-md text-xs font-semibold text-gray-600">Points are converted into discount energy upon final order confirmation.</p>
            </div>
          </div>

          {/* Right Column: Shenron Wish Scroll - Final Manifest */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-[#FFD23F] border-4 border-[#1a1c1c] p-6 md:p-8 rounded-[2.5rem] space-y-4 text-[#1a1c1c] shadow-[10px_10px_0px_0px_#FF6B00]">
              <div className="flex justify-between items-center font-headline-lg text-lg font-black border-b-4 border-[#1a1c1c] pb-3">
                <span>SHENRON BATTLE MANIFEST</span>
                <span className="bg-[#FF6B00] text-white px-3 py-1 rounded-full text-xs font-headline-md font-black shadow-[2px_2px_0px_0px_#000]">
                  {cart.reduce((a,c) => a + c.quantity, 0)} ITEMS
                </span>
              </div>

              <div className="space-y-2 font-headline-md text-xs md:text-sm font-bold">
                <div className="flex justify-between"><span>SUBTOTAL</span><span>{money(subtotal)}</span></div>
                {appliedCoupon && (
                  <div className="flex justify-between text-green-800 font-black">
                    <span>COUPON DISCOUNT ({appliedCoupon.code})</span>
                    <span>-{money(discount)}</span>
                  </div>
                )}
                <div className="flex justify-between"><span>CAPSULE DISPATCH FEE</span><span>{money(deliveryFee)}</span></div>
                <div className="flex justify-between"><span>TAX (5% GST)</span><span>{money(summary?.tax || 0)}</span></div>
                {platformFee > 0 && <div className="flex justify-between"><span>PLATFORM HANDLING</span><span>{money(platformFee)}</span></div>}

                <div className="flex justify-between font-headline-xl text-2xl md:text-3xl font-black border-t-4 border-[#1a1c1c] pt-3 text-[#FF0055] drop-shadow-[1px_1px_0px_#000]">
                  <span>TOTAL AMOUNT</span>
                  <span>{money(total)}</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-3">
              <button
                type="button"
                onClick={handleConfirmOrder}
                disabled={isPlacingOrder}
                className={`w-full py-5 border-4 border-[#1a1c1c] shadow-[8px_8px_0px_0px_#111111] font-headline-xl font-black text-base uppercase rounded-[2.5rem] cursor-pointer transition-all flex items-center justify-center gap-2 ${
                  isPlacingOrder
                    ? 'bg-gray-400 text-gray-800 cursor-not-allowed opacity-80'
                    : 'bg-[#10B981] text-white hover:bg-[#059669]'
                }`}
              >
                {isPlacingOrder
                  ? (paymentIsOnline ? 'CHARGING RAZORPAY KAMEHAMEHA...' : 'PLACING SAIYAN ORDER...')
                  : `${paymentIsOnline ? 'PROCEED TO ONLINE PAYMENT ⚡' : 'SUMMON CASH ORDER 🐉'} • ${money(total)}`}
              </button>

              <button
                type="button"
                onClick={() => setStep(1)}
                className="w-full py-3.5 bg-white border-3 border-[#1a1c1c] font-headline-md font-black text-xs uppercase rounded-2xl cursor-pointer hover:bg-gray-100 transition-all text-[#1a1c1c] shadow-[4px_4px_0px_0px_#111111]"
              >
                ← BACK TO CAPSULE BASE ADDRESS
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


