import React from 'react';

export default function OrderConfirmation({ order, onTrack }) {
  if (!order) return null;

  return (
    <div className="fixed inset-0 z-[100000] bg-[#1a1c1c]/70 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="order-confirmed-title">
      <section className="w-full max-w-lg bg-[#FFF8E7] border-4 border-[#1a1c1c] shadow-[12px_12px_0px_0px_#34C759] rounded-[2rem] p-7 text-center relative overflow-hidden">
        <div className="mx-auto mb-4 w-20 h-20 rounded-full border-4 border-[#1a1c1c] bg-[#34C759] text-white flex items-center justify-center text-4xl font-black shadow-[4px_4px_0px_0px_#111111]">✓</div>
        <span className="inline-block bg-[#FFD23F] border-2 border-[#1a1c1c] rounded-full px-4 py-1 text-xs font-black uppercase mb-3">Payment verified</span>
        <h2 id="order-confirmed-title" className="font-display-xl text-3xl md:text-5xl font-black uppercase">ORDER CONFIRMED!</h2>
        <p className="mt-3 text-sm font-black">{order.orderNumber}</p>
        <p className="mt-2 text-xs font-bold text-gray-700">Your order is confirmed. Opening live tracking now…</p>
        <button type="button" onClick={onTrack} className="mt-6 w-full bg-[#00F0FF] border-3 border-[#1a1c1c] shadow-[4px_4px_0px_0px_#111111] rounded-xl px-6 py-3 font-black text-xs uppercase cursor-pointer">
          TRACK ORDER NOW
        </button>
      </section>
    </div>
  );
}
