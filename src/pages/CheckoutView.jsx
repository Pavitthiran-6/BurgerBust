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
      <div className="w-full py-16 flex flex-col items-center justify-center text-center max-w-xl mx-auto px-4 text-[#1a1c1c]">
        <div className="w-24 h-24 bg-[#FF6B00] border-4 border-[#1a1c1c] rounded-full flex items-center justify-center text-5xl mb-4 shadow-[6px_6px_0px_0px_#111111]">
          🐉
        </div>
        <h2 className="font-headline-xl text-3xl font-black uppercase text-[#1a1c1c]">YOUR SAIYAN ENERGY STASH IS EMPTY!</h2>
        <p className="text-sm font-bold text-gray-700 my-3">
          Summon Dragon Ball feast items from the menu before launching Kamehameha checkout!
        </p>
        <button
          type="button"
          onClick={() => setCurrentPage('menu')}
          className="mt-4 px-8 py-4 bg-[#FF6B00] text-white border-4 border-[#1a1c1c] shadow-[6px_6px_0px_0px_#111111] font-black text-sm uppercase rounded-2xl hover:bg-[#e05e00] cursor-pointer"
        >
          BROWSE BATTLE MENU ⚡
        </button>
      </div>
    );
  }

  return (
    <div className="w-full py-8 flex flex-col items-center relative z-10 text-[#1a1c1c] max-w-5xl mx-auto px-4">
      {/* Dragon Ball Super Saiyan Header Banner */}
      <div className="w-full bg-gradient-to-r from-[#0B132B] via-[#1C2541] to-[#0B132B] text-white border-4 border-[#1a1c1c] shadow-[10px_10px_0px_0px_#FF6B00] rounded-[2rem] p-6 md:p-8 text-center mb-8 relative overflow-hidden">
        <div className="absolute -left-6 -top-6 text-7xl opacity-20 pointer-events-none">🐉</div>
        <div className="absolute -right-6 -bottom-6 text-7xl opacity-20 pointer-events-none">⚡</div>

        <span className="bg-[#FF6B00] text-white border-2 border-black px-4 py-1 rounded-full text-xs font-black uppercase tracking-wider inline-block mb-3 shadow-[3px_3px_0px_0px_#111111] rotate-[-1deg]">
          CAPSULE CORP • KAMEHAMEHA CHECKOUT 🔮
        </span>
        <h1 className="font-headline-xl text-3xl md:text-5xl font-black uppercase tracking-tight text-[#FFD23F] drop-shadow-[3px_3px_0px_#000000]">
          SUPER SAIYAN CHECKOUT
        </h1>
        <p className="text-xs md:text-sm font-bold text-gray-200 mt-2">
          SUMMON SHENRON TO DISPATCH YOUR FEAST AT MAXIMUM POWER LEVEL!
        </p>
      </div>

      {/* Main Steps Container */}
      <div className="w-full bg-white border-4 border-[#1a1c1c] shadow-[10px_10px_0px_0px_#111111] p-6 md:p-8 rounded-[2rem] space-y-6 relative">
        {/* Step Navigation Tabs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 border-b-4 border-[#1a1c1c] pb-4 gap-3 text-xs font-black uppercase">
          <button
            type="button"
            onClick={() => setStep(1)}
            className={`border-3 border-[#1a1c1c] rounded-2xl px-5 py-3.5 transition-all text-left font-black flex items-center justify-between cursor-pointer ${
              step === 1
                ? 'bg-[#FF6B00] text-white shadow-[4px_4px_0px_0px_#111111]'
                : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
            }`}
          >
            <span>1. SAIYAN CAPSULE ADDRESS 📍</span>
            {addressIsComplete && <span className="bg-white text-green-700 px-2 py-0.5 rounded text-[10px] border border-black font-extrabold">READY</span>}
          </button>

          <button
            type="button"
            onClick={() => {
              if (addressIsComplete) setStep(2);
              else handleContinueToPayment();
            }}
            className={`border-3 border-[#1a1c1c] rounded-2xl px-5 py-3.5 transition-all text-left font-black flex items-center justify-between cursor-pointer ${
              step === 2
                ? 'bg-[#00F0FF] text-[#1a1c1c] shadow-[4px_4px_0px_0px_#111111]'
                : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
            }`}
          >
            <span>2. KI POWER WALLET & DISPATCH ⚡</span>
            {selectedPaymentId && <span className="bg-white text-blue-800 px-2 py-0.5 rounded text-[10px] border border-black font-extrabold">SELECTED</span>}
          </button>
        </div>

        {step === 1 ? (
          /* STEP 1: Address & Classified Delivery Note */
          <div className="space-y-6">
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-headline-md text-lg font-black uppercase flex items-center gap-2">
                  <span>🐉</span> SAIYAN CAPSULE ADDRESS
                </h3>
                <button
                  type="button"
                  onClick={() => setShowAddressForm(previous => !previous)}
                  disabled={addresses.length >= 5}
                  className="text-xs font-black text-[#FF6B00] underline cursor-pointer disabled:text-gray-400 disabled:no-underline"
                >
                  {showAddressForm ? 'CLOSE ADDRESS FORM' : '+ ADD NEW CAPSULE BASE'}
                </button>
              </div>

              {showAddressForm && (
                <div className="mb-6 p-4 border-3 border-[#1a1c1c] rounded-2xl bg-orange-50">
                  <AddressForm
                    profile={profile}
                    onSave={handleCheckoutAddressSave}
                    onCancel={addresses.length ? () => setShowAddressForm(false) : undefined}
                    submitLabel="SAVE CAPSULE BASE ADDRESS"
                  />
                </div>
              )}

              {addresses.length > 0 && (
                <div className="space-y-3">
                  {addresses.map((addr) => (
                    <label
                      key={addr.id}
                      className={`flex items-center justify-between p-4 border-3 border-[#1a1c1c] rounded-2xl cursor-pointer transition-all ${
                        selectedAddressId === addr.id
                          ? 'bg-[#FFF3E0] shadow-[4px_4px_0px_0px_#FF6B00]'
                          : 'bg-white hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="selectedAddr"
                          checked={selectedAddressId === addr.id}
                          onChange={() => setSelectedAddressId(addr.id)}
                          className="w-5 h-5 accent-[#FF6B00]"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-black text-xs uppercase text-[#1a1c1c]">{addr.title} ({addr.tag})</span>
                            <span className="text-[10px] font-bold text-gray-500">[{addr.recipientName} • {addr.phone}]</span>
                          </div>
                          <span className="text-xs font-bold text-gray-700 block mt-0.5">{addr.addressLine1 || addr.address}</span>
                          <span className="text-[11px] font-semibold text-gray-500 block">
                            {[addr.city, addr.state, addr.postalCode || addr.pincode].filter(Boolean).join(', ')}
                          </span>
                        </div>
                      </div>
                      {addr.default && (
                        <span className="bg-[#10B981] text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase border border-black shadow-[2px_2px_0px_0px_#000]">
                          PRIMARY BASE ⭐️
                        </span>
                      )}
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Classified Delivery Note */}
            <div className="space-y-3 pt-2">
              <h3 className="font-headline-md text-sm font-black uppercase flex items-center gap-2">
                <span>⚡</span> SAIYAN BATTLE DISPATCH DIRECTIVES
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {['Leave at the door', 'Do not ring the bell', 'Call when you arrive'].map((note, i) => (
                  <label
                    key={i}
                    className={`flex items-center gap-3 p-3.5 border-3 border-[#1a1c1c] rounded-2xl text-xs font-bold cursor-pointer transition-all ${
                      deliveryNote === note ? 'bg-amber-100 shadow-[3px_3px_0px_0px_#111111]' : 'bg-white hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="note"
                      checked={deliveryNote === note}
                      onChange={() => setDeliveryNote(note)}
                      className="accent-[#FF6B00]"
                    />
                    {note}
                  </label>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={handleContinueToPayment}
              className="w-full py-4 bg-[#FF6B00] text-white border-4 border-[#1a1c1c] shadow-[6px_6px_0px_0px_#111111] font-black text-sm uppercase rounded-2xl cursor-pointer hover:bg-[#e05e00] transition-all flex items-center justify-center gap-2 mt-4"
            >
              NEXT: KI POWER WALLET ⚡
            </button>
          </div>
        ) : (
          /* STEP 2: Payment & Shenron Final Review */
          <div className="space-y-6">
            <div>
              <h3 className="font-headline-md text-lg font-black uppercase flex items-center gap-2 mb-3">
                <span>⚡</span> SELECT KI PAYMENT MANIFEST
              </h3>

              <div className="space-y-3 text-xs font-bold">
                {paymentMethods.map((pm) => (
                  <label
                    key={pm.id}
                    className={`flex items-center justify-between p-4 border-3 border-[#1a1c1c] rounded-2xl cursor-pointer transition-all ${
                      selectedPaymentId === pm.id
                        ? 'bg-[#E0F7FA] shadow-[4px_4px_0px_0px_#00F0FF]'
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
                      <span className="font-black text-xs uppercase text-[#1a1c1c]">
                        {pm.type} ({pm.details})
                      </span>
                    </div>
                    {pm.primary && (
                      <span className="bg-[#00F0FF] text-[#1a1c1c] text-[9px] font-black px-2 py-0.5 rounded-full uppercase border border-black shadow-[2px_2px_0px_0px_#000]">
                        DEFAULT METHOD ⚡
                      </span>
                    )}
                  </label>
                ))}
              </div>
            </div>

            {/* Ki Points Redemption Bar */}
            <div className="rounded-2xl border-3 border-[#1a1c1c] bg-[#FFF8E7] p-4 shadow-[4px_4px_0px_0px_#FFD23F]">
              <label className="mb-2 block text-xs font-black uppercase text-[#1a1c1c]">
                REDEEM SAIYAN KI POINTS ({rewardPoints} AVAILABLE 🔮)
              </label>
              <input
                type="number"
                min="0"
                max={rewardPoints}
                value={pointsToRedeem}
                onChange={(event) => setPointsToRedeem(Math.min(rewardPoints, Math.max(0, Number(event.target.value) || 0)))}
                className="w-full rounded-xl border-2 border-[#1a1c1c] bg-white p-2.5 text-sm font-black text-[#1a1c1c]"
                placeholder="0"
              />
              <p className="mt-1 text-[11px] font-semibold text-gray-600">Points are converted to discount energy upon final order confirmation.</p>
            </div>

            {/* Shenron Wish Summary (Manifest) */}
            <div className="bg-[#FFF8E7] border-4 border-[#1a1c1c] p-6 rounded-2xl space-y-2.5 text-xs font-bold shadow-[6px_6px_0px_0px_#FF6B00]">
              <div className="flex justify-between items-center text-sm font-black border-b-2 border-dashed border-[#1a1c1c] pb-2 mb-2">
                <span>SHENRON BATTLE MANIFEST</span>
                <span className="bg-[#FF6B00] text-white px-2 py-0.5 rounded text-[10px] uppercase font-extrabold">{cart.reduce((a,c) => a + c.quantity, 0)} ITEMS</span>
              </div>

              <div className="flex justify-between"><span>SUBTOTAL</span><span>{money(subtotal)}</span></div>
              {appliedCoupon && (
                <div className="flex justify-between text-green-700 font-black">
                  <span>COUPON DISCOUNT ({appliedCoupon.code})</span>
                  <span>-{money(discount)}</span>
                </div>
              )}
              <div className="flex justify-between"><span>CAPSULE DISPATCH FEE</span><span>{money(deliveryFee)}</span></div>
              <div className="flex justify-between"><span>TAX (5% GST)</span><span>{money(summary?.tax || 0)}</span></div>
              {platformFee > 0 && <div className="flex justify-between"><span>PLATFORM HANDLING</span><span>{money(platformFee)}</span></div>}

              <div className="flex justify-between text-lg font-black border-t-4 border-[#1a1c1c] pt-3 text-[#FF6B00]">
                <span>TOTAL POWER AMOUNT</span>
                <span>{money(total)}</span>
              </div>
            </div>

            {/* Step Action Buttons */}
            <div className="flex gap-4 pt-4 border-t-4 border-dashed border-[#1a1c1c]">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-6 py-4 bg-gray-200 border-4 border-[#1a1c1c] font-black text-xs uppercase rounded-2xl cursor-pointer hover:bg-gray-300 transition-all"
              >
                BACK
              </button>

              <button
                type="button"
                onClick={handleConfirmOrder}
                disabled={isPlacingOrder}
                className={`flex-1 py-4 border-4 border-[#1a1c1c] shadow-[6px_6px_0px_0px_#111111] font-black text-sm uppercase rounded-2xl cursor-pointer transition-all flex items-center justify-center gap-2 ${
                  isPlacingOrder
                    ? 'bg-gray-400 text-gray-800 cursor-not-allowed opacity-80'
                    : 'bg-[#10B981] text-white hover:bg-[#059669]'
                }`}
              >
                {isPlacingOrder
                  ? (paymentIsOnline ? 'CHARGING RAZORPAY KAMEHAMEHA...' : 'PLACING SAIYAN ORDER...')
                  : `${paymentIsOnline ? 'PROCEED TO ONLINE PAYMENT ⚡' : 'SUMMON CASH ORDER 🐉'} • ${money(total)}`}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

