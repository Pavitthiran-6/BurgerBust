import React, { useState } from 'react';
import { COUPON_CATALOG, validateCoupon, calculateCouponDiscount, getRecommendedCoupon } from '../data/coupons';
import { useCouponCountdown } from '../hooks/useCouponCountdown';

function CouponCard({ coupon, onCopyCode, onApply, copiedCode }) {
  const { formattedTime, secondsLeft } = useCouponCountdown(coupon);
  const isExpiring = !coupon.isExpired && secondsLeft > 0 && secondsLeft < 3600;

  return (
    <div className={`border-4 border-[#1a1c1c] shadow-[8px_8px_0px_0px_#111111] rounded-3xl p-6 flex flex-col justify-between ${coupon.color} ${coupon.isExpired ? 'opacity-50 grayscale' : ''}`}>
      <div>
        <div className="flex justify-between items-center mb-3">
          <span className="bg-white text-[#1a1c1c] border-2 border-[#1a1c1c] px-3 py-0.5 rounded-full font-black text-[10px] uppercase">
            {coupon.tag}
          </span>
          <div className="text-right">
            {coupon.isExpired ? (
              <span className="text-[10px] font-black uppercase opacity-80">EXPIRED</span>
            ) : (
              <span className={`text-[10px] font-bold ${isExpiring ? 'animate-pulse' : ''}`}>
                ⏰ {formattedTime}
              </span>
            )}
          </div>
        </div>
        <h3 className="font-display-xl text-2xl font-black uppercase mb-1">{coupon.title}</h3>
        <p className="text-xs font-bold opacity-90 mb-1">{coupon.desc}</p>
        <p className="text-[10px] font-bold opacity-70">Min spend: ${coupon.minSpend.toFixed(2)} • Max discount: ${coupon.maxDiscount.toFixed(2)}</p>
        {coupon.firstOrderOnly && <span className="text-[10px] font-black uppercase mt-1 block"> FIRST ORDER ONLY</span>}
      </div>

      <div className="flex items-center justify-between pt-3 border-t-2 border-dashed border-[#1a1c1c] gap-2 mt-3">
        <span className="font-mono text-sm font-black underline">{coupon.code}</span>
        <div className="flex gap-2">
          {!coupon.isExpired && onApply && (
            <button type="button" onClick={() => onApply(coupon)}
              className="px-3 py-1.5 bg-[#1a1c1c] text-white border-2 border-[#1a1c1c] font-black text-[10px] uppercase rounded-xl cursor-pointer hover:opacity-80">
              APPLY ️
            </button>
          )}
          <button type="button" onClick={() => !coupon.isExpired && onCopyCode(coupon.code)}
            className={`px-3 py-1.5 bg-white text-[#1a1c1c] border-2 border-[#1a1c1c] font-black text-[10px] uppercase rounded-xl ${coupon.isExpired ? 'cursor-not-allowed opacity-40' : 'cursor-pointer hover:bg-gray-100'}`}>
            {copiedCode === coupon.code ? 'COPIED ' : 'COPY '}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function OffersView({ onApplyCoupon, showToast, setCurrentPage }) {
  const [copiedCode, setCopiedCode] = useState('');

  const handleCopyCode = (code) => {
    setCopiedCode(code);
    if (navigator.clipboard) navigator.clipboard.writeText(code);
    if (showToast) showToast(`Coupon ${code} copied to clipboard! ️`, 'success');
    setTimeout(() => setCopiedCode(''), 3000);
  };

  const handleApply = (coupon) => {
    if (onApplyCoupon) onApplyCoupon({ code: coupon.code, discountPercent: coupon.value, discountType: coupon.discountType, maxDiscount: coupon.maxDiscount });
    if (showToast) showToast(`Coupon ${coupon.code} saved to cart! Head to checkout. ️`, 'success');
    if (setCurrentPage) setCurrentPage('cart');
  };

  return (
    <div className="w-full py-8 flex flex-col items-center relative z-10 text-[#1a1c1c] max-w-6xl mx-auto px-4">
      {/* Header Marketplace Banner */}
      <div className="w-full bg-[#FFD23F] border-4 border-[#1a1c1c] shadow-[8px_8px_0px_0px_#111111] rounded-3xl p-6 md:p-8 text-center mb-8">
        <span className="bg-[#FF0055] text-white border-2 border-[#1a1c1c] px-4 py-1 rounded-full text-xs font-black uppercase inline-block mb-2 rotate-[-2deg]">
          ELMORE HIGH MARKETPLACE
        </span>
        <h1 className="font-display-xl text-3xl md:text-5xl font-black uppercase tracking-tight">
          OFFERS & CARTOON COUPONS
        </h1>
        <p className="text-xs font-bold mt-1">FLASH SALES, FESTIVAL DEALS, BOGO & FREE DISPATCH!</p>
      </div>

      {/* Flash Sales Banner with Live Timer */}
      <div className="w-full bg-[#FF0055] text-white border-4 border-[#1a1c1c] shadow-[8px_8px_0px_0px_#111111] rounded-3xl p-6 md:p-8 mb-8 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex flex-col gap-2">
          <span className="bg-[#FFD23F] text-[#1a1c1c] border-2 border-[#1a1c1c] px-3 py-0.5 rounded-full text-xs font-black uppercase w-max">
             COMIC50 — FESTIVAL DEAL EXPIRES TODAY!
          </span>
          <h2 className="font-display-xl text-2xl md:text-4xl font-black uppercase">
            50% OFF TOON SHAKES TODAY!
          </h2>
          <p className="text-xs font-bold text-yellow-200">
            Grab any Toon Shake or Waffle Box for half price before midnight!
          </p>
        </div>
        <button type="button" onClick={() => handleApply(COUPON_CATALOG.find(c => c.code === 'COMIC50'))}
          className="px-6 py-3.5 bg-white text-[#1a1c1c] border-3 border-[#1a1c1c] shadow-[4px_4px_0px_0px_#FFD23F] font-black text-xs uppercase rounded-xl hover:bg-yellow-100 cursor-pointer shrink-0">
          CLAIM 50% COUPON ️
        </button>
      </div>

      {/* Full Coupon Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
        {COUPON_CATALOG.map((coupon, i) => (
          <CouponCard
            key={i}
            coupon={coupon}
            copiedCode={copiedCode}
            onCopyCode={handleCopyCode}
            onApply={!coupon.isExpired ? handleApply : null}
          />
        ))}
      </div>
    </div>
  );
}
