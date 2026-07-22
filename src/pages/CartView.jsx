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

  const subtotal = summary?.subtotal ?? cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const discountPercent = appliedCoupon?.discountPercent || (appliedCoupon ? 20 : 0);
  const discount = summary?.couponDiscount ?? (subtotal * discountPercent) / 100;
  const gstTax = summary?.tax ?? subtotal * 0.05;
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
    if (window.confirm("Are you sure you want to clear all items from your Mystery Order Cart?")) {
      if (onClearCart) onClearCart();
    }
  };

  return (
    <div className="mystery-map-bg text-on-background font-body-md min-h-screen pb-16 w-full px-4 md:px-8 relative text-[#1a1c1c] max-w-[1200px] mx-auto pt-6 rounded-3xl">
      <div className="spooky-mist" />
      <div className="spooky-mist-right" />

      {/* Main Title Section */}
      <div className="text-center mb-12 relative z-10">
        <h1 className="font-headline-xl text-3xl md:text-5xl text-on-background uppercase inline-block bg-primary-container px-6 py-2 border-4 border-on-background shadow-[8px_8px_0px_0px_#111111] transform -rotate-2 font-extrabold">
          The Mystery Order
        </h1>
        <div className="action-bubble top-[-20px] right-4 md:right-[20%] font-headline-md text-xl md:text-2xl font-bold">
          ZOINKS!
        </div>
      </div>

      {cart.length === 0 ? (
        <div className="w-full bg-white border-4 border-on-background shadow-[8px_8px_0px_0px_#111111] p-12 text-center rounded-3xl flex flex-col items-center gap-4 relative z-10">
          <div className="w-24 h-24 bg-primary-container border-4 border-on-background rounded-full flex items-center justify-center text-5xl shadow-[4px_4px_0px_0px_#111111]">
            🔍
          </div>
          <h2 className="font-headline-md text-2xl font-black uppercase text-on-background">SECRET VAULT IS EMPTY!</h2>
          <p className="text-sm font-bold text-on-surface-variant max-w-sm">
            No evidence found in your cart! Head to the menu to solve your hunger mystery!
          </p>
          <button
            type="button"
            onClick={() => setCurrentPage('menu')}
            className="comic-btn px-8 py-4 bg-primary-container text-on-background font-black text-sm uppercase rounded-2xl cursor-pointer mt-2"
          >
            GO TO FOOD MENU
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">
          {/* Left Column: Pathway */}
          <div className="lg:col-span-8 flex flex-col gap-8 relative">
            {/* Pathway Line (Desktop) */}
            <div className="hidden lg:block absolute left-8 top-16 bottom-0 dashed-line z-0" />

            {/* Section 1: The Evidence (Cart) */}
            <section className="relative z-10 pl-0 lg:pl-16">
              <div className="absolute left-[-16px] top-4 w-8 h-8 rounded-full bg-primary-container border-4 border-on-background shadow-[4px_4px_0px_0px_#111111] hidden lg:flex items-center justify-center font-headline-md font-bold text-sm">
                1
              </div>

              <div className="flex justify-between items-center mb-6">
                <h2 className="font-headline-lg text-2xl md:text-3xl font-extrabold flex items-center gap-2">
                  <span className="material-symbols-outlined text-4xl">search</span>
                  The Evidence
                </h2>
                <button
                  type="button"
                  onClick={handleConfirmClearCart}
                  className="px-3 py-1.5 bg-red-500 text-white border-2 border-on-background shadow-[2px_2px_0px_0px_#111111] font-black text-xs uppercase rounded-xl hover:bg-red-600 cursor-pointer"
                >
                  CLEAR CART
                </button>
              </div>

              <div className="flex flex-col gap-4">
                {cart.map((item, idx) => (
                  <div
                    key={item.cartUniqueId || item.id || idx}
                    className="comic-panel p-4 flex flex-col sm:flex-row gap-4 items-center relative overflow-hidden"
                  >
                    <div className={`absolute top-2 right-2 bg-on-background text-on-primary px-2 py-1 text-xs font-extrabold uppercase transform ${idx % 2 === 0 ? 'rotate-3' : '-rotate-3'}`}>
                      {idx % 2 === 0 ? 'Mystery Solved!' : 'Clue Found!'}
                    </div>

                    <div className="w-full sm:w-32 h-32 flex-shrink-0 border-4 border-on-background bg-surface-container flex items-center justify-center overflow-hidden">
                      <img
                        className="w-full h-full object-contain p-1"
                        src={item.image || '/foods/burger-classic.png'}
                        alt={item.name}
                      />
                    </div>

                    <div className="flex-grow flex flex-col justify-between h-full w-full">
                      <div>
                        <h3 className="font-headline-md text-xl font-bold">{item.name}</h3>
                        <p className="text-on-surface-variant text-sm mt-1">
                          {item.customizations ? Object.values(item.customizations).join(', ') : 'Fresh & crispy'}
                        </p>
                      </div>

                      <div className="flex justify-between items-end mt-4">
                        <div className="flex items-center gap-2 border-4 border-on-background bg-surface-container w-fit">
                          <button
                            type="button"
                            onClick={() => onUpdateQuantity(item.cartUniqueId || item.id, item.quantity - 1)}
                            className="px-3 py-1 hover:bg-primary-container font-headline-md font-bold text-lg cursor-pointer"
                          >
                            -
                          </button>
                          <span className="font-headline-md px-2 font-bold text-base">{item.quantity}</span>
                          <button
                            type="button"
                            onClick={() => onUpdateQuantity(item.cartUniqueId || item.id, item.quantity + 1)}
                            className="px-3 py-1 hover:bg-primary-container font-headline-md font-bold text-lg cursor-pointer"
                          >
                            +
                          </button>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="font-headline-md text-xl font-extrabold">
                            {money(item.lineTotal ?? item.price * item.quantity)}
                          </span>
                          <button
                            type="button"
                            onClick={() => onRemoveFromCart(item.cartUniqueId || item.id)}
                            className="w-8 h-8 bg-red-100 text-red-600 border-2 border-on-background rounded-xl flex items-center justify-center font-black cursor-pointer hover:bg-red-200 text-sm"
                            title="Remove item"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Right Column: The Unmasking (Payment & Summary) */}
          <div className="lg:col-span-4 relative">
            <div className="sticky top-6">
              <section className="comic-panel bg-primary-container p-6 relative overflow-visible rounded-xl">
                <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-on-background text-on-primary px-4 py-2 font-headline-md text-xl font-extrabold border-4 border-on-background shadow-[4px_4px_0px_0px_#ffffff] z-20 whitespace-nowrap">
                  The Unmasking
                </div>

                <div className="mt-6 flex flex-col gap-3">
                  {/* Coupon Applied or Form */}
                  {appliedCoupon ? (
                    <div className="bg-green-100 border-2 border-on-background p-2.5 rounded-xl flex justify-between items-center text-xs font-black text-green-900">
                      <span>COUPON {appliedCoupon.code} APPLIED</span>
                      <button type="button" onClick={onRemoveCoupon} className="text-red-600 underline cursor-pointer">REMOVE</button>
                    </div>
                  ) : (
                    <form onSubmit={handleApplyCouponSubmit} className="flex gap-2">
                      <input
                        type="text"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        placeholder="COUPON CODE"
                        className="flex-1 p-2 border-2 border-on-background rounded-xl font-bold text-xs uppercase bg-white"
                      />
                      <button
                        type="submit"
                        className="px-3 py-2 bg-on-background text-on-primary font-black text-xs uppercase rounded-xl cursor-pointer"
                      >
                        APPLY
                      </button>
                    </form>
                  )}

                  <div className="flex justify-between font-body-lg text-base font-bold">
                    <span>Subtotal</span>
                    <span>{money(subtotal)}</span>
                  </div>
                  <div className="flex justify-between font-body-lg text-base font-bold">
                    <span>Mystery Fee (Tax)</span>
                    <span>{money(gstTax)}</span>
                  </div>
                  <div className="flex justify-between font-body-lg text-base font-bold">
                    <span>Delivery</span>
                    <span>{money(deliveryFee)}</span>
                  </div>

                  {discount > 0 && (
                    <div className="flex justify-between font-body-lg text-base font-bold text-red-700">
                      <span>Discount</span>
                      <span>−{money(discount)}</span>
                    </div>
                  )}

                  <hr className="border-t-4 border-on-background my-1" />

                  <div className="flex justify-between font-headline-lg text-2xl font-extrabold mb-2">
                    <span>Total</span>
                    <span>{money(total)}</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setCurrentPage('checkout')}
                    disabled={loading || (summary && !summary.valid)}
                    className="comic-btn bg-white text-on-background w-full py-4 mt-2 font-headline-md text-lg font-black uppercase flex items-center justify-center gap-2 hover:bg-yellow-50 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'VALIDATING CART...' : summary && !summary.minimumOrderMet
                      ? `MINIMUM ORDER ${summary.currency} ${summary.minimumOrderAmount.toFixed(2)}`
                      : 'CONTINUE TO SHIPPING'}
                    <span className="material-symbols-outlined text-xl">arrow_forward</span>
                  </button>
                </div>
              </section>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

