import React, { useEffect, useMemo, useState } from 'react';

const DEMO_INTERVAL_MS = 120_000;

const STEPS = [
  { label: 'Order Received', icon: 'receipt_long', bubble: 'Printing your kitchen ticket!' },
  { label: 'Preparing Food', icon: 'restaurant', bubble: 'Chopping the freshest veggies!' },
  { label: 'Cooking', icon: 'local_fire_department', bubble: 'Sizzle! Your feast is cooking!' },
  { label: 'Out For Delivery', icon: 'two_wheeler', bubble: 'Vroom! Your order is on the way!' },
  { label: 'Delivered', icon: 'home', bubble: 'Ding dong! Your feast has arrived!' },
];

const STATUS_STEP = {
  PAYMENT_PENDING: 0,
  PLACED: 0,
  CONFIRMED: 0,
  PREPARING: 1,
  READY: 2,
  OUT_FOR_DELIVERY: 3,
  DELIVERED: 5,
  REFUNDED: 5,
};

const normalizeStatus = order => order?.statusCode
  || order?.status?.toUpperCase().replaceAll(' ', '_')
  || 'PLACED';

const escapeHtml = value => String(value ?? '')
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#039;');

export default function TrackerView({ currentOrder, onCancelOrder, showToast, setCurrentPage }) {
  const [clock, setClock] = useState(Date.now());
  const [isCancelling, setIsCancelling] = useState(false);

  const statusCode = normalizeStatus(currentOrder);
  const cancelled = statusCode === 'CANCELLED';
  const serverStep = STATUS_STEP[statusCode] ?? 0;

  const demoStart = useMemo(() => {
    if (!currentOrder?.id || typeof window === 'undefined') {
      return { startedAt: Date.now(), startStep: serverStep };
    }

    const storageKey = `burgerbust-tracker-demo-v2-${currentOrder.id}`;
    try {
      const saved = JSON.parse(window.sessionStorage.getItem(storageKey));
      if (Number.isFinite(saved?.startedAt) && Number.isFinite(saved?.startStep)) return saved;

      const fresh = { startedAt: Date.now(), startStep: serverStep };
      window.sessionStorage.setItem(storageKey, JSON.stringify(fresh));
      return fresh;
    } catch {
      return { startedAt: Date.now(), startStep: serverStep };
    }
  }, [currentOrder?.id, serverStep]);

  useEffect(() => {
    setClock(Date.now());
    const timer = window.setInterval(() => setClock(Date.now()), 1_000);
    return () => window.clearInterval(timer);
  }, [currentOrder?.id]);

  if (!currentOrder) {
    return (
      <div className="flex min-h-[52vh] w-full items-center justify-center py-16">
        <section className="comic-border comic-shadow-lg w-full max-w-xl rounded-[2rem] bg-white p-10 text-center">
          <span className="material-symbols-outlined mb-4 block text-7xl text-primary">history</span>
          <h1 className="font-headline-xl text-3xl font-black">No Order to Track!</h1>
          <p className="my-4 font-body-lg text-on-surface-variant">
            Place an order and its comic timeline will appear here.
          </p>
          <button
            type="button"
            onClick={() => setCurrentPage('menu')}
            className="comic-border comic-shadow rounded-full bg-primary-container px-8 py-3 font-black uppercase transition-all hover:translate-x-1 hover:translate-y-1 hover:shadow-none"
          >
            Browse Menu
          </button>
        </section>
      </div>
    );
  }

  const elapsedSteps = Math.floor(Math.max(0, clock - demoStart.startedAt) / DEMO_INTERVAL_MS);
  const visualProgress = cancelled
    ? 0
    : Math.min(STEPS.length, Math.max(serverStep, demoStart.startStep + elapsedSteps));
  const secondsToNext = visualProgress >= STEPS.length
    ? 0
    : Math.max(1, 120 - Math.floor(((clock - demoStart.startedAt) % DEMO_INTERVAL_MS) / 1_000));
  const minsToNext = Math.floor(secondsToNext / 60);
  const secsToNext = secondsToNext % 60;
  const timeFormatted = `${String(minsToNext).padStart(2, '0')}:${String(secsToNext).padStart(2, '0')}`;
  const delivered = visualProgress >= STEPS.length;
  const outForDelivery = visualProgress === 3;
  const currency = currentOrder.currency || 'INR';
  const money = value => new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(Number(value || 0));
  const address = currentOrder.shipping?.address
    || [currentOrder.address?.addressLine1, currentOrder.address?.city]
      .filter(Boolean).join(', ')
    || 'Your saved delivery address';

  const rawPaymentMethod = String(currentOrder.paymentMethod || currentOrder.payment_method || 'COD').toUpperCase();
  const isCOD = rawPaymentMethod === 'COD' || rawPaymentMethod.includes('CASH');
  const isOnlinePayment = !isCOD;
  const canViewInvoice = isOnlinePayment || delivered;

  const canCancel = visualProgress < 3
    && !['CANCELLED', 'DELIVERED', 'REFUNDED', 'OUT_FOR_DELIVERY'].includes(statusCode);

  const handleCancel = async () => {
    if (!canCancel || isCancelling) return;
    if (!window.confirm(`Cancel order #${currentOrder.orderNumber || currentOrder.id}?`)) return;

    setIsCancelling(true);
    try {
      await onCancelOrder?.(currentOrder.id);
    } finally {
      setIsCancelling(false);
    }
  };

  const handleInvoice = () => {
    const invoiceWindow = window.open('', '_blank');
    if (!invoiceWindow) {
      showToast?.('Please allow pop-ups to open the invoice.', 'error');
      return;
    }

    invoiceWindow.opener = null;
    const rows = (currentOrder.items || []).map(item => `
      <tr>
        <td>${escapeHtml(item.name)}</td>
        <td>${Number(item.quantity || 0)}</td>
        <td>${escapeHtml(money(item.price))}</td>
        <td>${escapeHtml(money(item.lineTotal ?? item.price * item.quantity))}</td>
      </tr>
    `).join('');

    invoiceWindow.document.write(`<!doctype html>
      <html lang="en"><head><meta charset="utf-8"><title>BurgerBurst Invoice</title>
      <style>
        body{font-family:Arial,sans-serif;color:#111;margin:40px}h1{margin:0;color:#ff0060}
        .top{display:flex;justify-content:space-between;gap:24px;border-bottom:4px solid #111;padding-bottom:20px}
        table{width:100%;border-collapse:collapse;margin:28px 0}th,td{padding:12px;border-bottom:2px solid #111;text-align:left}
        th{background:#ffd23f}.totals{margin-left:auto;width:min(360px,100%)}.totals p{display:flex;justify-content:space-between}
        .grand{border-top:4px solid #111;padding-top:12px;font-size:20px;font-weight:900}
        .print{margin-top:28px;border:3px solid #111;border-radius:999px;background:#ffd23f;padding:12px 24px;font-weight:900;cursor:pointer}
        @media print{.print{display:none}}
      </style></head><body>
      <div class="top"><div><h1>BurgerBurst</h1><strong>Order Invoice</strong></div>
      <div><strong>#${escapeHtml(currentOrder.orderNumber || currentOrder.id)}</strong><br>${escapeHtml(currentOrder.date || new Date().toLocaleDateString('en-IN'))}</div></div>
      <p><strong>Deliver to:</strong> ${escapeHtml(address)}</p>
      <table><thead><tr><th>Item</th><th>Qty</th><th>Price</th><th>Total</th></tr></thead><tbody>${rows}</tbody></table>
      <div class="totals">
        <p><span>Subtotal</span><strong>${escapeHtml(money(currentOrder.subtotal))}</strong></p>
        <p><span>Delivery</span><strong>${escapeHtml(money(currentOrder.deliveryFee))}</strong></p>
        ${Number(currentOrder.discount || 0) > 0 ? `<p><span>Discount</span><strong>-${escapeHtml(money(currentOrder.discount))}</strong></p>` : ''}
        <p class="grand"><span>Grand Total</span><strong>${escapeHtml(money(currentOrder.total))}</strong></p>
      </div><button class="print" onclick="window.print()">Print / Save PDF</button></body></html>`);
    invoiceWindow.document.close();
  };

  return (
    <div className="relative mx-auto w-full max-w-6xl overflow-hidden px-4 pb-20 pt-6 text-on-surface">
      {/* Decorative Background Elements */}
      <div className="pointer-events-none absolute left-10 top-10 -z-10 h-32 w-32 rounded-full border-4 border-[#111111] bg-primary-container opacity-50 blur-none" />
      <div className="pointer-events-none absolute bottom-20 right-20 -z-10 h-48 w-48 rotate-12 rounded-xl border-4 border-[#111111] bg-error-container opacity-50" />

      {/* Header Section */}
      <div className="mb-12 text-center">
        <h1 className="font-headline-xl text-3xl font-extrabold text-on-surface sm:text-5xl md:text-6xl mb-4">
          Tracking Your Grub!
        </h1>
        <p className="font-body-lg text-body-lg text-on-surface-variant bg-primary-container inline-block px-4 py-2 rounded-xl comic-border comic-shadow font-bold">
          Order #{currentOrder.orderNumber || currentOrder.id}
        </p>

        {(cancelled || delivered) && (
          <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
            <span className={`comic-border inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-black uppercase ${
              cancelled ? 'bg-red-500 text-white' : 'bg-green-500 text-white'
            }`}>
              <span className="material-symbols-outlined text-base">
                {cancelled ? 'cancel' : 'check_circle'}
              </span>
              {cancelled ? 'Order cancelled' : 'Delivery complete'}
            </span>
          </div>
        )}
      </div>

      {/* Comic Timeline */}
      <div className="relative w-full py-12 mt-6 md:mt-10 min-h-[300px]">
        {/* Connecting Line */}
        <div className="timeline-line top-[130px]" />

        <div className="grid grid-cols-5 gap-2 sm:gap-4 relative z-10 min-h-[260px]">
          {STEPS.map((step, index) => {
            const completed = !cancelled && index < visualProgress;
            const active = !cancelled && index === visualProgress && visualProgress < STEPS.length;
            const isBubbleVisible = active || (!cancelled && delivered && index === STEPS.length - 1);

            return (
              <div
                key={step.label}
                className="group flex flex-col items-center relative h-full justify-start cursor-pointer"
              >
                {/* Speech Bubble (Active/Delivered step visible by default; pops up on hover/touch for all steps) */}
                <div
                  className={`absolute -top-24 sm:-top-28 w-full flex justify-center z-30 transition-all duration-200 pointer-events-none ${
                    isBubbleVisible
                      ? 'opacity-100 scale-100 animate-bounce'
                      : 'opacity-0 scale-95 translate-y-2 group-hover:opacity-100 group-hover:scale-100 group-hover:translate-y-0'
                  }`}
                >
                  <div className="speech-bubble w-36 sm:w-48 text-center font-label-bold text-[10px] sm:text-xs md:text-sm bg-white text-on-surface leading-tight comic-shadow">
                    "{step.bubble}"
                  </div>
                </div>

                {/* Circle Icon Badge with Height Positioning */}
                <div className="relative h-[150px] w-full flex items-center justify-center">
                  {active ? (
                    <div className="w-20 h-20 sm:w-28 sm:h-28 bg-white rounded-full comic-border-thick comic-shadow-lg flex items-center justify-center relative z-10 animate-pulse border-primary transition-all duration-700 group-hover:scale-105">
                      <span className="material-symbols-outlined text-3xl sm:text-5xl text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
                        {step.icon}
                      </span>
                    </div>
                  ) : completed ? (
                    <div className="w-16 h-16 sm:w-22 sm:h-22 bg-primary-container rounded-full comic-border comic-shadow-lg flex items-center justify-center relative z-10 transition-all duration-700 ease-out group-hover:-translate-y-2 group-hover:scale-105">
                      <span className="material-symbols-outlined text-2xl sm:text-4xl text-on-primary-container" style={{ fontVariationSettings: "'FILL' 1" }}>
                        {step.icon}
                      </span>
                      <div className="absolute -bottom-1 -right-1 sm:-bottom-2 sm:-right-2 bg-white rounded-full p-0.5 sm:p-1 comic-border">
                        <span className="material-symbols-outlined text-green-500 text-sm sm:text-base" style={{ fontVariationSettings: "'FILL' 1" }}>
                          check_circle
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-surface-variant rounded-full comic-border comic-shadow flex items-center justify-center relative z-10 -translate-y-6 opacity-75 grayscale transition-all duration-700 ease-out group-hover:-translate-y-8 group-hover:scale-105">
                      <span className="material-symbols-outlined text-2xl sm:text-3xl text-on-surface-variant">
                        {step.icon}
                      </span>
                    </div>
                  )}
                </div>

                {/* Title */}
                <h3
                  className={`font-headline-lg text-headline-lg text-center transition-all duration-500 -mt-2 group-hover:text-primary ${
                    active
                      ? 'text-base sm:text-2xl text-primary font-black'
                      : completed
                        ? 'text-xs sm:text-xl font-black text-on-surface'
                        : 'text-xs sm:text-lg text-on-surface-variant font-bold opacity-60'
                  }`}
                  dangerouslySetInnerHTML={{ __html: step.label.replace(' ', '<br />') }}
                />
              </div>
            );
          })}
        </div>
      </div>

      <p className="mt-4 text-center text-xs font-bold text-on-surface-variant sm:text-sm">
        Showcase mode: stages progress automatically every 2 minutes.
      </p>

      {/* Action Buttons */}
      <div className="mt-10 flex flex-wrap items-center justify-center gap-5">
        {/* View Invoice Button */}
        <button
          type="button"
          onClick={() => {
            if (!canViewInvoice) {
              showToast?.('Invoice will be available after delivery for Cash on Delivery orders.', 'info');
              return;
            }
            handleInvoice();
          }}
          className={`font-headline-lg font-extrabold uppercase text-sm sm:text-base px-8 py-3.5 rounded-full border-4 flex items-center gap-2.5 transition-all ${
            canViewInvoice
              ? 'bg-primary-container text-on-surface border-[#111111] shadow-[4px_4px_0px_0px_#111111] hover:translate-x-1 hover:translate-y-1 hover:shadow-none cursor-pointer'
              : 'bg-[#eae7df] text-[#7a756b] border-[#7a756b] shadow-[4px_4px_0px_0px_#7a756b] opacity-75 cursor-not-allowed'
          }`}
          title={!canViewInvoice ? 'Invoice available after delivery for Cash on Delivery orders' : 'View or download invoice'}
        >
          <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>
            receipt_long
          </span>
          VIEW INVOICE
        </button>

        {/* Cancel Order Button */}
        <button
          type="button"
          onClick={handleCancel}
          disabled={!canCancel || isCancelling}
          className={`font-headline-lg font-extrabold uppercase text-sm sm:text-base px-8 py-3.5 rounded-full border-4 flex items-center gap-2.5 transition-all ${
            canCancel
              ? 'bg-error text-white border-[#111111] shadow-[4px_4px_0px_0px_#111111] hover:translate-x-1 hover:translate-y-1 hover:shadow-none cursor-pointer'
              : 'bg-[#eae7df] text-[#7a756b] border-[#7a756b] shadow-[4px_4px_0px_0px_#7a756b] opacity-80 cursor-not-allowed'
          }`}
        >
          <span className="material-symbols-outlined text-xl">
            cancel
          </span>
          {cancelled
            ? 'ORDER CANCELLED'
            : isCancelling
              ? 'CANCELLING…'
              : canCancel
                ? 'CANCEL ORDER'
                : 'CANCELLATION CLOSED'}
        </button>
      </div>

      {/* Order Details Bento Card */}
      <div className="mt-20 bg-white rounded-2xl comic-border comic-shadow-lg p-6 sm:p-8 relative">
        {/* Decorative Badge */}
        <div className="absolute -top-6 -left-4 sm:-left-6 bg-primary-container px-6 py-2 rounded-xl comic-border comic-shadow font-headline-lg text-headline-lg text-on-primary-container rotate-[-5deg] text-lg sm:text-xl">
          Your Order
        </div>

        <div className="flex flex-col md:flex-row gap-8 mt-6">
          {/* Items List */}
          <div className="flex-1">
            <ul className="space-y-4">
              {(currentOrder.items || []).map((item, idx) => (
                <li key={item.id || item.productId || idx} className="flex justify-between items-center pb-4 border-b-4 border-on-surface">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-surface-container rounded-lg comic-border flex items-center justify-center overflow-hidden shrink-0">
                      <img alt={item.name} className="w-full h-full object-contain p-1" src={item.image || '/foods/burger-classic.png'} />
                    </div>
                    <div>
                      <h4 className="font-headline-lg text-headline-lg text-base sm:text-lg font-bold">{item.name}</h4>
                      <span className="font-label-bold text-label-bold text-on-surface-variant bg-surface-container px-2 py-1 rounded comic-border text-xs inline-block mt-1">
                        {item.quantity} × {money(item.price)}
                      </span>
                    </div>
                  </div>
                  <span className="font-headline-lg text-headline-lg text-base sm:text-lg font-bold">
                    {money(item.lineTotal ?? item.price * item.quantity)}
                  </span>
                </li>
              ))}
            </ul>

            <dl className="mt-6 space-y-2 border-t-2 border-on-surface pt-4 text-sm">
              <div className="flex justify-between"><dt className="font-body-md">Subtotal</dt><dd className="font-bold">{money(currentOrder.subtotal)}</dd></div>
              <div className="flex justify-between"><dt className="font-body-md">Delivery</dt><dd className="font-bold">{money(currentOrder.deliveryFee)}</dd></div>
              {Number(currentOrder.discount || 0) > 0 && (
                <div className="flex justify-between text-red-600"><dt className="font-body-md">Discount</dt><dd className="font-bold">−{money(currentOrder.discount)}</dd></div>
              )}
              <div className="flex justify-between border-t border-dashed border-on-surface pt-3 text-base">
                <dt className="font-black font-headline-lg">Grand Total</dt>
                <dd className="font-headline-lg text-xl font-black text-primary">{money(currentOrder.total)}</dd>
              </div>
            </dl>
          </div>

          {/* Map/Driver Info Box */}
          <div className="flex-1 bg-surface-container-low rounded-xl comic-border p-6 relative overflow-hidden flex flex-col justify-center items-center text-center min-h-[220px]">
            <span className={`material-symbols-outlined text-6xl mb-4 ${delivered ? 'text-green-600' : outForDelivery ? 'text-primary' : 'text-on-surface-variant'}`}>
              {delivered ? 'check_circle' : outForDelivery ? 'two_wheeler' : 'map'}
            </span>
            <p className="font-body-lg text-body-lg font-bold text-lg mb-2">
              {delivered ? 'Order successfully delivered!' : outForDelivery ? 'Your rider is navigating to you!' : 'Map will appear when driver is assigned.'}
            </p>
            <p className="font-body-md text-sm text-on-surface-variant max-w-xs">
              Delivering to: {address}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

