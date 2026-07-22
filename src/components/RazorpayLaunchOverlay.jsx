import React from 'react';

export default function RazorpayLaunchOverlay({ mode }) {
  if (!mode) return null;

  const verifying = mode === 'verifying';

  return (
    <div
      className="fixed inset-0 z-[99990] bg-[#1a1c1c]/45 backdrop-blur-[2px] flex items-center justify-center p-4"
      role="status"
      aria-live="polite"
      aria-label={verifying ? 'Verifying Razorpay payment' : 'Connecting to Razorpay'}
    >
      <section className="w-full max-w-md bg-[#FFF8E7] border-4 border-[#1a1c1c] shadow-[10px_10px_0px_0px_#00F0FF] rounded-[2rem] p-7 text-center">
        <div className="mx-auto mb-5 h-16 w-16 rounded-full border-4 border-[#1a1c1c] border-t-[#FF0055] bg-[#FFD23F] animate-spin" />
        <h2 className="text-2xl font-black uppercase">
          {verifying ? 'Verifying your payment' : 'Opening secure payment'}
        </h2>
        <p className="mt-2 text-xs font-black uppercase text-gray-700">
          {verifying
            ? 'Razorpay has returned. Waiting for BurgerBurst to confirm the payment.'
            : 'Keep this checkout open. Your cart is safe until payment is verified.'}
        </p>
      </section>
    </div>
  );
}
