import React from 'react';

const STEPS = [
  {
    label: 'Order Received',
    icon: 'receipt_long',
    bubble: 'Got it! Printing the kitchen ticket now!',
  },
  {
    label: 'Preparing Food',
    icon: 'restaurant',
    bubble: 'Chopping the freshest ingredients!',
  },
  {
    label: 'Cooking',
    icon: 'local_fire_department',
    bubble: 'Sizzle sizzle! Your feast is almost ready!',
  },
  {
    label: 'Out For Delivery',
    icon: 'two_wheeler',
    bubble: 'Vroom! Your order is heading your way!',
  },
  {
    label: 'Delivered',
    icon: 'home',
    bubble: 'Ding dong! Your cartoon feast has arrived!',
  },
];

const STATUS_STEP = {
  PAYMENT_PENDING: 0,
  PLACED: 0,
  CONFIRMED: 0,
  PREPARING: 1,
  READY: 2,
  OUT_FOR_DELIVERY: 3,
  DELIVERED: 4,
  REFUNDED: 4,
};

const normalizeStatus = order => order?.statusCode
  || order?.status?.toUpperCase().replaceAll(' ', '_')
  || 'PLACED';

export default function TrackerView({ currentOrder, setCurrentPage }) {
  if (!currentOrder) {
    return (
      <div className="flex min-h-[52vh] w-full items-center justify-center py-16">
        <section className="comic-border comic-shadow-lg w-full max-w-xl rounded-[2rem] bg-white p-10 text-center">
          <span className="material-symbols-outlined mb-4 block text-7xl text-primary">history</span>
          <h1 className="font-headline-lg text-3xl font-black">No Order to Track!</h1>
          <p className="my-4 font-body-lg text-on-surface-variant">
            Place an order and its live comic timeline will appear here.
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

  const statusCode = normalizeStatus(currentOrder);
  const activeStep = STATUS_STEP[statusCode] ?? 0;
  const cancelled = statusCode === 'CANCELLED';
  const delivered = statusCode === 'DELIVERED';
  const outForDelivery = statusCode === 'OUT_FOR_DELIVERY';
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

  const stepState = index => {
    if (cancelled) return index === 0 ? 'cancelled' : 'pending';
    if (index < activeStep) return 'completed';
    if (index === activeStep) return delivered ? 'completed' : 'active';
    return 'pending';
  };

  return (
    <div className="relative mx-auto w-full max-w-6xl overflow-hidden px-1 pb-24 pt-6 text-on-surface">
      <div className="pointer-events-none absolute left-2 top-12 -z-10 h-32 w-32 rounded-full border-4 border-[#111111] bg-primary-container opacity-50" />
      <div className="pointer-events-none absolute bottom-20 right-5 -z-10 h-44 w-44 rotate-12 rounded-3xl border-4 border-[#111111] bg-error-container opacity-50" />

      <header className="mb-12 text-center md:mb-16">
        <h1 className="font-headline-xl text-4xl font-black tracking-tight md:text-6xl">
          Tracking Your Grub!
        </h1>
        <p className="comic-border comic-shadow mt-4 inline-block rounded-xl bg-primary-container px-5 py-2 font-body-lg text-base font-bold text-on-surface-variant md:text-lg">
          Order #{currentOrder.orderNumber || currentOrder.id}
        </p>
        <div className="mt-5">
          <span className={`comic-border inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-black uppercase ${
            cancelled ? 'bg-red-500 text-white' : delivered ? 'bg-green-500 text-white' : 'bg-white'
          }`}>
            <span className="material-symbols-outlined text-base">
              {cancelled ? 'cancel' : delivered ? 'check_circle' : 'schedule'}
            </span>
            {currentOrder.status || statusCode.replaceAll('_', ' ')}
          </span>
        </div>
      </header>

      <section aria-label="Order progress" className="overflow-x-auto overflow-y-hidden px-2 pb-10 pt-28 md:overflow-visible">
        <div className="relative mx-auto min-w-[820px]">
          <div className="absolute left-[8%] right-[8%] top-16 z-0 h-2 -translate-y-1/2 bg-[#111111]" />
          <div className="relative z-10 grid grid-cols-5 gap-4">
            {STEPS.map((step, index) => {
              const state = stepState(index);
              const completed = state === 'completed';
              const active = state === 'active';
              const isCancelled = state === 'cancelled';

              return (
                <article key={step.label} className="group flex flex-col items-center text-center">
                  <div className="relative flex h-32 w-full items-center justify-center">
                    {active && (
                      <div className="absolute -top-24 left-1/2 z-30 w-48 -translate-x-1/2 animate-bounce">
                        <div className="speech-bubble bg-white p-3 text-xs font-black">
                          “{step.bubble}”
                        </div>
                      </div>
                    )}
                    {completed && (
                      <div className="absolute -top-24 left-1/2 z-30 hidden w-44 -translate-x-1/2 opacity-0 transition-opacity group-hover:opacity-100 md:block">
                        <div className="speech-bubble bg-white p-3 text-xs font-black">
                          “{step.bubble}”
                        </div>
                      </div>
                    )}

                    <div className={`relative flex items-center justify-center rounded-full transition-transform ${
                      active
                        ? 'h-32 w-32 animate-pulse border-8 border-primary bg-white shadow-[8px_8px_0px_0px_#111111]'
                        : completed
                          ? 'comic-border comic-shadow-lg h-24 w-24 bg-primary-container group-hover:-translate-y-2'
                          : isCancelled
                            ? 'comic-border comic-shadow h-24 w-24 bg-red-500 text-white'
                            : 'comic-border comic-shadow h-24 w-24 bg-surface-variant grayscale'
                    }`}>
                      <span
                        className={`material-symbols-outlined ${active ? 'text-6xl text-primary' : 'text-4xl'} ${
                          completed ? 'text-on-primary-container' : state === 'pending' ? 'text-on-surface-variant' : ''
                        }`}
                        style={{ fontVariationSettings: completed || active ? "'FILL' 1" : "'FILL' 0" }}
                      >
                        {isCancelled ? 'cancel' : step.icon}
                      </span>
                      {completed && (
                        <span className="comic-border absolute -bottom-2 -right-2 flex h-9 w-9 items-center justify-center rounded-full bg-white text-green-600">
                          <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                            check_circle
                          </span>
                        </span>
                      )}
                    </div>
                  </div>
                  <h2 className={`mt-3 font-headline-lg text-xl font-black leading-tight ${
                    active ? 'text-primary' : state === 'pending' ? 'text-on-surface-variant opacity-55' : ''
                  }`}>
                    {isCancelled ? 'Cancelled' : step.label}
                  </h2>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="comic-border comic-shadow-lg relative mt-16 rounded-[2rem] bg-white p-5 md:mt-24 md:p-8">
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
                      <img
                        src={item.image || '/foods/burger-classic.png'}
                        alt={item.name}
                        className="h-full w-full object-contain p-1"
                      />
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
              {delivered
                ? 'Order successfully delivered!'
                : outForDelivery
                  ? 'Your rider is navigating to you!'
                  : 'Map will appear when the driver is assigned.'}
            </h3>
            <p className="mt-3 max-w-sm text-sm font-medium text-on-surface-variant">
              Delivering to: {address}
            </p>
          </aside>
        </div>
      </section>
    </div>
  );
}
