import React, { useEffect, useMemo, useState } from 'react';

const DEMO_INTERVAL_MS = 60_000;

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
          <h1 className="font-headline-lg text-3xl font-black">No Order to Track!</h1>
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
    : Math.max(1, 60 - Math.floor(((clock - demoStart.startedAt) % DEMO_INTERVAL_MS) / 1_000));
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
    <div className="relative mx-auto w-full max-w-6xl overflow-hidden px-1 pb-24 pt-6 text-on-surface">
      <div className="pointer-events-none absolute left-2 top-12 -z-10 h-32 w-32 rounded-full border-4 border-[#111111] bg-primary-container opacity-50" />
      <div className="pointer-events-none absolute bottom-20 right-5 -z-10 h-44 w-44 rotate-12 rounded-3xl border-4 border-[#111111] bg-error-container opacity-50" />

      <header className="mb-5 text-center md:mb-8">
        <h1 className="font-headline-xl text-4xl font-black tracking-tight md:text-6xl">Tracking Your Grub!</h1>
        <p className="comic-border comic-shadow mt-4 inline-block rounded-xl bg-primary-container px-5 py-2 font-body-lg text-sm font-bold text-on-surface-variant md:text-lg">
          Order #{currentOrder.orderNumber || currentOrder.id}
        </p>
        <div className="mt-4">
          <span className={`comic-border inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-black uppercase ${
            cancelled ? 'bg-red-500 text-white' : delivered ? 'bg-green-500 text-white' : 'bg-white'
          }`}>
            <span className="material-symbols-outlined text-base">
              {cancelled ? 'cancel' : delivered ? 'check_circle' : 'schedule'}
            </span>
            {cancelled ? 'Order cancelled' : delivered ? 'Delivery complete' : `Next stage in 00:${String(secondsToNext).padStart(2, '0')}`}
          </span>
        </div>
      </header>

      <section aria-label="Order progress" className="w-full overflow-hidden px-0 py-2 sm:px-2">
        <div className="relative h-[330px] w-full">
          <div className="absolute left-[8%] right-[8%] top-[108px] z-0 h-1.5 -translate-y-1/2 rounded-full bg-[#111111] sm:h-2" />
          <div className="relative z-10 grid h-full w-full grid-cols-5">
            {STEPS.map((step, index) => {
              const completed = !cancelled && index < visualProgress;
              const active = !cancelled && index === visualProgress && visualProgress < STEPS.length;
              const showBubble = active || (!cancelled && delivered && index === STEPS.length - 1);

              return (
                <article key={step.label} className="relative flex min-w-0 justify-center text-center">
                  {showBubble && (
                    <div className="absolute left-1/2 top-0 z-30 w-[94%] max-w-36 -translate-x-1/2 animate-bounce">
                      <div className="speech-bubble rounded-lg border-2 border-black bg-white p-1.5 text-center text-[7px] font-black leading-[1.05] shadow-[3px_3px_0px_0px_#111111] sm:text-[9px] md:rounded-xl md:text-xs">
                        “{step.bubble}”
                      </div>
                    </div>
                  )}

                  <div className={`absolute left-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full transition-all duration-700 ease-out ${
                    completed
                      ? 'top-[210px] h-[clamp(3.25rem,7vw,5.5rem)] w-[clamp(3.25rem,7vw,5.5rem)] bg-primary-container'
                      : active
                        ? 'top-[108px] h-[clamp(4rem,9vw,7rem)] w-[clamp(4rem,9vw,7rem)] bg-white'
                        : 'top-[108px] h-[clamp(3.25rem,7vw,5.5rem)] w-[clamp(3.25rem,7vw,5.5rem)] bg-surface-variant grayscale'
                  } comic-border comic-shadow-lg`}>
                    <span
                      className={`material-symbols-outlined text-[clamp(1.5rem,4vw,2.75rem)] ${active ? 'text-primary' : completed ? 'text-on-primary-container' : 'text-on-surface-variant'}`}
                      style={{ fontVariationSettings: completed || active ? "'FILL' 1" : "'FILL' 0" }}
                    >
                      {step.icon}
                    </span>
                    {completed && (
                      <span className="comic-border absolute -bottom-2 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-white text-green-600 sm:h-9 sm:w-9">
                        <span className="material-symbols-outlined text-lg sm:text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                      </span>
                    )}
                  </div>

                  <h2 className={`absolute left-1/2 w-[105%] -translate-x-1/2 px-0.5 font-headline-lg font-black leading-tight transition-all duration-700 ${
                    completed
                      ? 'top-[266px] text-[9px] text-on-surface sm:text-xs md:text-base'
                      : active
                        ? 'top-[174px] text-[10px] text-primary sm:text-sm md:text-lg'
                        : 'top-[164px] text-[9px] text-on-surface-variant opacity-60 sm:text-xs md:text-base'
                  }`}>
                    {step.label}
                  </h2>
                </article>
              );
            })}
          </div>
        </div>

        <p className="-mt-8 text-center text-xs font-bold text-on-surface-variant sm:text-sm">
          Showcase mode: one stage completes every minute without changing the database status.
        </p>
      </section>

      <section aria-label="Order actions" className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
        <button
          type="button"
          onClick={handleInvoice}
          className="comic-border comic-shadow w-full rounded-full bg-primary-container px-8 py-3 font-black uppercase transition-all hover:translate-x-1 hover:translate-y-1 hover:shadow-none sm:w-auto"
        >
          <span className="material-symbols-outlined mr-2 align-middle">receipt_long</span>
          View Invoice
        </button>
        <button
          type="button"
          onClick={handleCancel}
          disabled={!canCancel || isCancelling}
          className="comic-border comic-shadow w-full rounded-full bg-error px-8 py-3 font-black uppercase text-white transition-all hover:translate-x-1 hover:translate-y-1 hover:shadow-none disabled:cursor-not-allowed disabled:bg-surface-variant disabled:text-on-surface-variant disabled:opacity-60 disabled:shadow-none sm:w-auto"
        >
          <span className="material-symbols-outlined mr-2 align-middle">cancel</span>
          {cancelled ? 'Order Cancelled' : isCancelling ? 'Cancelling…' : canCancel ? 'Cancel Order' : 'Cancellation Closed'}
        </button>
      </section>

      <section className="comic-border comic-shadow-lg relative mt-16 rounded-[2rem] bg-white p-5 md:p-8">
        <div className="comic-border comic-shadow absolute -left-2 -top-6 -rotate-[5deg] rounded-xl bg-primary-container px-6 py-2 font-headline-lg text-xl font-black text-on-primary-container md:-left-6 md:text-2xl">
          Your Order
        </div>

        <div className="mt-7 flex flex-col gap-8 md:flex-row">
          <div className="min-w-0 flex-1">
            <ul className="space-y-4">
              {(currentOrder.items || []).map(item => (
                <li key={item.id || item.productId} className="flex items-center justify-between gap-4 border-b-4 border-on-surface pb-4">
                  <div className="flex min-w-0 items-center gap-4">
                    <div className="comic-border flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-surface-container">
                      <img src={item.image || '/foods/burger-classic.png'} alt={item.name} className="h-full w-full object-contain p-1" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="truncate font-headline-lg text-lg font-black">{item.name}</h3>
                      <span className="comic-border mt-1 inline-block rounded-lg bg-surface-container px-2 py-0.5 text-xs font-bold">
                        {item.quantity} × {money(item.price)}
                      </span>
                    </div>
                  </div>
                  <strong className="shrink-0 font-headline-lg text-lg">{money(item.lineTotal ?? item.price * item.quantity)}</strong>
                </li>
              ))}
            </ul>

            <dl className="mt-6 space-y-2 border-t-2 border-on-surface pt-4 text-sm">
              <div className="flex justify-between"><dt>Subtotal</dt><dd className="font-bold">{money(currentOrder.subtotal)}</dd></div>
              <div className="flex justify-between"><dt>Delivery</dt><dd className="font-bold">{money(currentOrder.deliveryFee)}</dd></div>
              {Number(currentOrder.discount || 0) > 0 && (
                <div className="flex justify-between text-red-600"><dt>Discount</dt><dd className="font-bold">−{money(currentOrder.discount)}</dd></div>
              )}
              <div className="flex justify-between border-t border-dashed border-on-surface pt-3 text-base">
                <dt className="font-black">Grand Total</dt>
                <dd className="font-headline-lg text-xl font-black text-primary">{money(currentOrder.total)}</dd>
              </div>
            </dl>
          </div>

          <aside className="comic-border flex min-h-64 flex-1 flex-col items-center justify-center overflow-hidden rounded-3xl bg-surface-container-low p-7 text-center">
            <span className={`material-symbols-outlined mb-4 text-7xl ${delivered ? 'text-green-600' : outForDelivery ? 'text-primary' : 'text-on-surface-variant'}`}>
              {delivered ? 'check_circle' : outForDelivery ? 'two_wheeler' : 'map'}
            </span>
            <h3 className="font-headline-lg text-xl font-black">
              {delivered ? 'Order successfully delivered!' : outForDelivery ? 'Your rider is navigating to you!' : 'Map will appear when the driver is assigned.'}
            </h3>
            <p className="mt-3 max-w-sm text-sm font-medium text-on-surface-variant">Delivering to: {address}</p>
          </aside>
        </div>
      </section>
    </div>
  );
}
