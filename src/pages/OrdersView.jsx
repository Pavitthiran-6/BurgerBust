import React from 'react';

export default function OrdersView({ orders, onBrowseMenu }) {
  if (!orders || orders.length === 0) {
    return (
      <div className="flex-grow flex items-center justify-center py-20 w-full">
        <div className="bg-white rounded-[2rem] comic-border comic-shadow p-12 text-center max-w-xl mx-auto w-full">
          <span className="material-symbols-outlined text-8xl text-primary font-bold block mb-4">history</span>
          <h2 className="font-headline-lg text-3xl mb-4">No Orders Found!</h2>
          <p className="font-body-lg text-on-surface-variant mb-8">You haven't ordered any cartoon goodness yet. Place your first order today!</p>
          <button 
            onClick={onBrowseMenu}
            className="bg-primary-container text-on-primary-container font-headline-lg text-headline-lg px-8 py-4 rounded-full comic-border comic-shadow hover-comic-lift active-comic-press transition-all"
          >
            Browse Menu
          </button>
        </div>
      </div>
    );
  }

  // Track the most recent order at the top
  const activeOrder = orders[0];

  const getOptionsText = (options) => {
    if (!options) return "Standard Customization";
    const desc = [];
    if (options.ExtraCheese) desc.push("Extra Cheese");
    if (options.Bacon) desc.push("Crispy Bacon");
    if (options.BeverageSize && options.BeverageSize !== 'None') {
      desc.push(`${options.BeverageSize} Drink`);
    }
    if (options.Spiciness && options.Spiciness !== 'Normal') {
      desc.push(`${options.Spiciness} Spicy`);
    }
    return desc.length > 0 ? desc.join(", ") : "Standard Customization";
  };

  // Define steps
  const steps = [
    {
      key: 'Placed',
      label: 'Order Received',
      icon: 'receipt_long',
      bubble: 'Got it! Printing ticket now!'
    },
    {
      key: 'Preparing',
      label: 'Preparing Food',
      icon: 'restaurant',
      bubble: 'Chopping the freshest veggies!'
    },
    {
      key: 'Cooking',
      label: 'Cooking',
      icon: 'local_fire_department',
      bubble: 'Sizzle sizzle! Flipping the burgers!'
    },
    {
      key: 'Out for Delivery',
      label: 'Out For Delivery',
      icon: 'two_wheeler',
      bubble: 'Vroom! Zooming to your coordinate!'
    },
    {
      key: 'Delivered',
      label: 'Delivered',
      icon: 'home',
      bubble: 'Ding Dong! Order successfully delivered!'
    }
  ];

  // Helper to determine step status
  const getStepStatus = (stepKey, currentStatus) => {
    const statusOrder = ['Placed', 'Preparing', 'Cooking', 'Out for Delivery', 'Delivered'];
    const stepIndex = statusOrder.indexOf(stepKey);
    const currentIndex = statusOrder.indexOf(currentStatus);

    if (stepKey === currentStatus) {
      return 'active';
    } else if (stepIndex < currentIndex) {
      return 'completed';
    } else {
      return 'pending';
    }
  };

  return (
    <div className="flex-grow max-w-6xl mx-auto w-full relative pb-32">
      {/* Header Section */}
      <div className="text-center mb-16 mt-6">
        <h1 className="font-headline-xl text-headline-xl text-on-surface mb-4">Tracking Your Grub!</h1>
        <p className="font-body-lg text-body-lg text-on-surface-variant bg-primary-container inline-block px-6 py-2 rounded-xl comic-border comic-shadow">
          Order #{activeOrder.id}
        </p>
      </div>

      {/* Comic Timeline */}
      <div className="relative w-full h-[400px] mt-10">
        {/* The Connecting Line running through middle */}
        <div className="timeline-line"></div>
        
        <div className="grid grid-cols-5 gap-4 h-full relative z-10">
          {steps.map(step => {
            const status = getStepStatus(step.key, activeOrder.status);

            return (
              <div key={step.key} className="flex flex-col h-full relative">
                
                {/* 1. UPPER SLOT (Above the line) - Render Active or Pending (Waiting) steps */}
                <div className="h-[196px] flex flex-col justify-end items-center pb-3 relative">
                  {(status === 'active' || status === 'pending') && (
                    <div className="flex flex-col items-center w-full">
                      {status === 'active' && (
                        <>
                          {/* Comic Message Speech Bubble */}
                          <div className="absolute -top-12 w-full flex justify-center animate-bounce z-30">
                            <div className="speech-bubble w-44 text-center font-label-bold text-label-bold bg-white text-xs border-2 border-black p-1.5 rounded-xl shadow-[3px_3px_0px_0px_#111111]">
                              "{step.bubble}"
                            </div>
                          </div>

                          {/* Title text */}
                          <h3 className="font-headline-lg text-headline-lg text-center text-sm text-primary mb-3 font-bold">{step.label}</h3>
                          
                          {/* Icon Circle (Active) */}
                          <div className="w-28 h-28 bg-white rounded-full comic-border-thick comic-shadow-lg flex items-center justify-center animate-pulse border-primary shrink-0">
                            <span className="material-symbols-outlined text-5xl text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
                              {step.icon}
                            </span>
                          </div>
                        </>
                      )}

                      {status === 'pending' && (
                        <div className="flex flex-col items-center opacity-50 grayscale">
                          {/* Title text */}
                          <h3 className="font-headline-lg text-headline-lg text-center text-sm text-on-surface-variant mb-3">{step.label}</h3>
                          
                          {/* Icon Circle (Pending) */}
                          <div className="w-20 h-20 bg-surface-container rounded-full comic-border comic-shadow flex items-center justify-center shrink-0">
                            <span className="material-symbols-outlined text-3xl text-on-surface-variant">
                              {step.icon}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* 2. MIDDLE LINE POINT (8px line gap spacer) */}
                <div className="h-[8px] w-full shrink-0"></div>

                {/* 3. LOWER SLOT (Below the line) - Render Completed steps */}
                <div className="h-[196px] flex flex-col justify-start items-center pt-3 relative">
                  {status === 'completed' && (
                    <div className="flex flex-col items-center w-full">
                      {/* Icon Circle (Completed) */}
                      <div className="w-20 h-20 bg-primary-container rounded-full comic-border comic-shadow-lg flex items-center justify-center relative transition-transform hover:translate-y-1 cursor-pointer shrink-0">
                        <span className="material-symbols-outlined text-3xl text-on-primary-container" style={{ fontVariationSettings: "'FILL' 1" }}>
                          {step.icon}
                        </span>
                        {/* Status Check Badge */}
                        <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 comic-border flex items-center justify-center">
                          <span className="material-symbols-outlined text-green-500 font-bold text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
                            check_circle
                          </span>
                        </div>
                      </div>

                      {/* Title text */}
                      <h3 className="font-headline-lg text-headline-lg text-center text-sm text-on-surface mt-3">{step.label}</h3>
                    </div>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      </div>

      {/* Order Details Bento Card */}
      <div className="mt-24 bg-white rounded-2xl comic-border comic-shadow-lg p-8 relative">
        {/* Decorative Badge */}
        <div className="absolute -top-6 -left-6 bg-primary-container px-6 py-2 rounded-xl comic-border comic-shadow font-headline-lg text-headline-lg text-on-primary-container rotate-[-5deg]">
          Your Order
        </div>
        
        <div className="flex flex-col md:flex-row gap-8 mt-6">
          {/* Items List */}
          <div className="flex-1">
            <ul className="space-y-4">
              {activeOrder.items.map((item, idx) => (
                <li key={idx} className="flex justify-between items-center pb-4 border-b-4 border-on-surface">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-surface-container rounded-lg comic-border flex items-center justify-center overflow-hidden shrink-0">
                      <img 
                        alt={item.name} 
                        className="w-full h-full object-contain p-1" 
                        src={item.image || "/foods/burger-classic.png"}
                      />
                    </div>
                    <div>
                      <h4 className="font-headline-lg text-headline-lg text-lg text-on-surface">{item.name}</h4>
                      <span className="font-label-bold text-label-bold text-on-surface-variant bg-surface-container px-2 py-0.5 rounded comic-border text-xs inline-block mt-1">
                        {getOptionsText(item.options)}
                      </span>
                    </div>
                  </div>
                  <span className="font-headline-lg text-headline-lg text-lg text-on-surface">${(item.price * item.quantity).toFixed(2)}</span>
                </li>
              ))}
            </ul>
            
            <div className="mt-6 flex flex-col gap-2 font-body-md text-sm border-t-2 border-on-surface pt-4">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span className="font-bold">${activeOrder.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery:</span>
                <span className="font-bold">${activeOrder.deliveryFee.toFixed(2)}</span>
              </div>
              {activeOrder.discount > 0 && (
                <div className="flex justify-between text-red-600">
                  <span>Discount:</span>
                  <span className="font-bold">-${activeOrder.discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-base border-t border-dashed border-on-surface pt-2">
                <span>Grand Total:</span>
                <span className="font-bold text-primary text-lg">${activeOrder.total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Map/Driver Info Placeholder */}
          <div className="flex-grow flex-1 bg-surface-container-low rounded-xl comic-border p-8 relative overflow-hidden flex flex-col justify-center items-center">
            {activeOrder.status === "Delivered" ? (
              <>
                <span className="material-symbols-outlined text-6xl text-green-600 mb-4 animate-bounce">check_circle</span>
                <p className="font-body-lg text-body-lg text-center font-bold text-green-700">Order successfully delivered!</p>
                <p className="text-xs text-on-surface-variant text-center mt-2">Enjoy your toon-delicious grub!</p>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-6xl text-on-surface-variant mb-4 animate-pulse">map</span>
                <p className="font-body-lg text-body-lg text-center font-bold">Driver is navigating coordinates...</p>
                <p className="text-xs text-on-surface-variant text-center mt-2">Delivering to: {activeOrder.shipping?.address || 'Your Coordinates'}</p>
              </>
            )}
          </div>
        </div>
      </div>

      {/* History Grid (only show if there are more than 1 orders) */}
      {orders.length > 1 && (
        <div className="mt-20">
          <h2 className="font-headline-lg text-headline-lg text-on-surface self-start mb-6 inline-block bg-white border-4 border-on-secondary-fixed px-6 py-2 rounded-xl comic-shadow">
            Past Order History
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {orders.slice(1).map((order, idx) => (
              <div key={idx} className="bg-white rounded-xl comic-border comic-shadow p-6">
                <div className="flex justify-between items-center mb-4 border-b-2 border-on-surface pb-2">
                  <span className="font-headline-lg text-base">Order #{order.id}</span>
                  <span className="font-label-bold text-xs bg-green-100 text-green-800 comic-border px-2 py-0.5 rounded">
                    {order.status}
                  </span>
                </div>
                <div className="text-xs font-body-md text-on-surface-variant space-y-1">
                  <p>Date: {order.date}</p>
                  <p>Items: {order.items.map(it => `${it.name} (x${it.quantity})`).join(", ")}</p>
                  <p className="font-bold text-primary mt-2">Total Paid: ${order.total.toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
