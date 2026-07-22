import React, { useState } from 'react';

export default function CartView({
  cart,
  summary,
  loading,
  appliedCoupon,
  onApplyCoupon,
  onRemoveCoupon,
  onAutoApplyBestCoupon,
  onUpdateQuantity,
  onRemoveFromCart,
  onClearCart,
  setCurrentPage
}) {
  const [couponCode, setCouponCode] = useState('');
  const [heroTip, setHeroTip] = useState(0);

  const subtotal = summary?.subtotal ?? cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const discountPercent = appliedCoupon?.discountPercent || (appliedCoupon ? 20 : 0);
  const discount = summary?.couponDiscount ?? (subtotal * discountPercent) / 100;
  const gstTax = summary?.tax ?? subtotal * 0.05;
  const platformFee = 0;
  const deliveryFee = summary?.deliveryFee ?? 3.99;
  const total = summary?.total ?? Math.max(0, subtotal - discount + gstTax + deliveryFee);
  const currency = summary?.currency || 'INR';
  const money = value => new Intl.NumberFormat('en-IN', {
    style: 'currency', currency, minimumFractionDigits: 2,
  }).format(Number(value || 0));

  const handleApplyCouponSubmit = (e) => {
    e.preventDefault();
    if (!couponCode.trim()) return;

    if (onApplyCoupon) onApplyCoupon({ code: couponCode.toUpperCase() });
    setCouponCode('');
  };

  const handleConfirmClearCart = () => {
    if (window.confirm("Are you sure you want to clear all items from your Secret Vault Stash Cart?")) {
      if (onClearCart) onClearCart();
    }
  };

  return (
    <div className="w-full py-8 flex flex-col items-center relative z-10 text-[#1a1c1c] max-w-5xl mx-auto px-4">
      {/* Header Banner */}
      <div className="w-full bg-[#FFD23F] border-4 border-[#1a1c1c] shadow-[8px_8px_0px_0px_#111111] rounded-3xl p-6 md:p-8 relative overflow-hidden mb-8 text-[#1a1c1c] flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <span className="bg-[#FF0055] text-white border-2 border-[#1a1c1c] px-3 py-0.5 rounded-full text-xs font-black uppercase inline-block mb-1">
            KRUSTY SECRET VAULT
          </span>
          <h1 className="font-display-xl text-3xl md:text-5xl uppercase font-black tracking-tight">
            KRUSTY SECRET STASH CART
          </h1>
          <p className="text-xs font-bold text-[#1a1c1c]">REVIEW YOUR FOOD BURSTS BEFORE MAGIC CHECKOUT!</p>
        </div>

        {cart.length > 0 && (
          <button
            type="button"
            onClick={handleConfirmClearCart}
            className="px-4 py-2 bg-red-500 text-white border-2 border-[#1a1c1c] shadow-[2px_2px_0px_0px_#111111] font-black text-xs uppercase rounded-xl hover:bg-red-600 cursor-pointer"
          >
            CLEAR VAULT ️
          </button>
        )}
      </div>

      {cart.length === 0 ? (
        <div className="w-full bg-white border-4 border-[#1a1c1c] shadow-[8px_8px_0px_0px_#111111] p-12 text-center rounded-3xl flex flex-col items-center gap-4">
          <div className="w-24 h-24 bg-[#FFD23F] border-4 border-[#1a1c1c] rounded-full flex items-center justify-center text-5xl shadow-[4px_4px_0px_0px_#111111]">
            ️
          </div>
          <h2 className="font-headline-md text-2xl font-black uppercase text-[#1a1c1c]">SECRET VAULT IS EMPTY!</h2>
          <p className="text-xs font-bold text-gray-600 max-w-sm">
            Head to the Multiverse Food Menu to grab Monster Burgers, Shakes, and Pepperoni Slices!
          </p>
          <button
            type="button"
            onClick={() => setCurrentPage('menu')}
            className="px-8 py-4 bg-[#FF0055] text-white border-4 border-[#1a1c1c] shadow-[4px_4px_0px_0px_#111111] font-black text-sm uppercase rounded-2xl hover:bg-pink-600 cursor-pointer mt-2"
          >
            GO TO MENU BISTRO 
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 w-full items-start">
          {/* Cart Items List */}
          <div className="lg:col-span-7 space-y-4">
            {cart.map((item, idx) => (
              <div key={idx} className="bg-white border-4 border-[#1a1c1c] shadow-[6px_6px_0px_0px_#111111] p-5 rounded-3xl flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <img src={item.image} alt={item.name} className="w-16 h-16 object-contain" />
                  <div>
                    <h3 className="font-black text-base uppercase text-[#1a1c1c]">{item.name}</h3>
                    <span className="text-xs font-black text-[#FF0055]">{money(item.price)}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 bg-yellow-50 border-2 border-[#1a1c1c] px-2 py-1 rounded-xl">
                    <button
                      type="button"
                      onClick={() => onUpdateQuantity(item.cartUniqueId || item.id, item.quantity - 1)}
                      className="w-7 h-7 bg-white border-2 border-[#1a1c1c] font-black text-xs rounded-lg cursor-pointer"
                    >
                      -
                    </button>
                    <span className="font-black text-xs w-4 text-center">{item.quantity}</span>
                    <button
                      type="button"
                      onClick={() => onUpdateQuantity(item.cartUniqueId || item.id, item.quantity + 1)}
                      className="w-7 h-7 bg-white border-2 border-[#1a1c1c] font-black text-xs rounded-lg cursor-pointer"
                    >
                      +
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => onRemoveFromCart(item.cartUniqueId || item.id)}
                    className="w-8 h-8 bg-red-100 text-red-600 border-2 border-[#1a1c1c] rounded-xl flex items-center justify-center font-black cursor-pointer hover:bg-red-200"
                  >
                    
                  </button>
                </div>
              </div>
            ))}

            {/* Delivery Distance Meter */}
            <div className="bg-[#FFF8E7] border-4 border-[#1a1c1c] p-4 rounded-3xl shadow-[4px_4px_0px_0px_#111111] flex justify-between items-center text-xs font-black">
              <span>ANYWHERE DOOR ETA</span>
              <span className="text-[#00F0FF] font-black"> 8 MINS (1.2 KM)</span>
            </div>
          </div>

          {/* Vault Receipt Summary */}
          <div className="lg:col-span-5 bg-white border-4 border-[#1a1c1c] shadow-[8px_8px_0px_0px_#111111] p-6 rounded-3xl space-y-6">
            <div className="flex justify-between items-center border-b-4 border-[#1a1c1c] pb-3">
              <h2 className="font-headline-md text-xl font-black uppercase text-[#1a1c1c]">VAULT RECEIPT</h2>
              <button
                type="button"
                onClick={onAutoApplyBestCoupon}
                className="px-3 py-1 bg-[#34C759] text-white border-2 border-[#1a1c1c] font-black text-[10px] uppercase rounded-lg cursor-pointer"
              >
                AUTO-APPLY BEST 
              </button>
            </div>

            {/* Applied Coupon Display */}
            {appliedCoupon ? (
              <div className="bg-green-100 border-2 border-[#1a1c1c] p-3 rounded-xl flex justify-between items-center text-xs font-black text-green-900">
                <span>COUPON {appliedCoupon.code} APPLIED</span>
                <button type="button" onClick={onRemoveCoupon} className="text-red-600 underline">REMOVE</button>
              </div>
            ) : (
              <form onSubmit={handleApplyCouponSubmit} className="flex gap-2">
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  placeholder="WELCOME20, BURST10 or FLAT5"
                  className="flex-1 p-2.5 border-2 border-[#1a1c1c] rounded-xl font-bold text-xs uppercase"
                />
                <button
                  type="submit"
                  className="px-4 py-2.5 bg-[#00F0FF] text-[#1a1c1c] border-2 border-[#1a1c1c] font-black text-xs uppercase rounded-xl cursor-pointer"
                >
                  APPLY
                </button>
              </form>
            )}

            {/* Estimated Savings Badge */}
            {discount > 0 && (
              <div className="bg-[#FFD23F] border-2 border-[#1a1c1c] p-2.5 rounded-xl text-center text-xs font-black uppercase">
                 TOTAL ESTIMATED SAVINGS: {money(discount)}
              </div>
            )}

            {/* Tip Hero Rider Selector */}
            <div className="space-y-2">
              <span className="text-xs font-black uppercase block">TIP DELIVERY HERO SIDEKICK</span>
              <div className="flex gap-2">
                {[0, 2.00, 5.00].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setHeroTip(amt)}
                    className={`flex-1 py-1.5 border-2 border-[#1a1c1c] rounded-xl font-black text-xs uppercase cursor-pointer ${
                      heroTip === amt ? 'bg-[#FFD23F] text-[#1a1c1c]' : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {amt === 0 ? 'NO TIP' : money(amt)}
                  </button>
                ))}
              </div>
            </div>

            {/* Financial Ledger */}
            <div className="space-y-2 text-xs font-bold border-t-2 border-dashed border-[#1a1c1c] pt-4">
              <div className="flex justify-between">
                <span>SUBTOTAL</span>
                <span>{money(subtotal)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-green-600 font-black">
                  <span>COUPON DISCOUNT ({discountPercent}%)</span>
                  <span>-{money(discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-gray-600">
                <span>5% GST TAX</span>
                <span>{money(gstTax)}</span>
              </div>
              {platformFee > 0 && <div className="flex justify-between text-gray-600"><span>PLATFORM HANDLING FEE</span><span>{money(platformFee)}</span></div>}
              <div className="flex justify-between text-gray-600">
                <span>ANYWHERE DOOR DISPATCH</span>
                <span>{money(deliveryFee)}</span>
              </div>
              <div className="flex justify-between text-base font-black border-t-2 border-[#1a1c1c] pt-2 text-[#FF0055]">
                <span>TOTAL AMOUNT</span>
                <span>{money(total)}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setCurrentPage('checkout')}
              disabled={loading || (summary && !summary.valid)}
              className="w-full py-4 bg-[#34C759] text-white border-4 border-[#1a1c1c] shadow-[4px_4px_0px_0px_#111111] font-black text-base uppercase rounded-2xl hover:bg-green-600 cursor-pointer"
            >
              {loading ? 'VALIDATING CART...' : summary && !summary.minimumOrderMet
                ? `MINIMUM ORDER ${summary.currency} ${summary.minimumOrderAmount.toFixed(2)}`
                : 'PROCEED TO MAGIC CHECKOUT'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
