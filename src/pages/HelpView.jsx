import React, { useState } from 'react';

export default function HelpView({ setCurrentPage }) {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [openIndex, setOpenIndex] = useState(0);

  const categories = [
    { id: 'ALL', label: 'All FAQ Sections', icon: 'auto_awesome' },
    { id: 'ORDERING', label: 'Ordering & Formulas', icon: 'lunch_dining' },
    { id: 'DELIVERY', label: 'Bikini Bottom Delivery', icon: 'two_wheeler' },
    { id: 'PAYMENT', label: 'Payment & Omnitrix', icon: 'account_balance_wallet' },
    { id: 'REWARDS', label: 'Rewards & Coupons', icon: 'military_tech' }
  ];

  const faqs = [
    // Ordering & Formulas
    {
      category: 'ORDERING',
      q: "Is this BurstBurger or Patrick's House?",
      a: "No, this is Patrick! But BurstBurger delivers the freshest Secret Formula Krabby Patty style burgers right to your underwater address!"
    },
    {
      category: 'ORDERING',
      q: "Can I customize Secret Sauces & Talisman Toppings?",
      a: "Aye Aye Captain! You can add Extra Cheese, Shadow Onions, Jalapeños, and Uncle's Secret Sauces on any burger order in the food detail view."
    },
    {
      category: 'ORDERING',
      q: "Can I place group orders for Elmore High or Titans Tower?",
      a: "Absolutely! You can add multiple items to your cart, apply combo discount vouchers, and send orders to any cartoon coordinate!"
    },

    // Delivery & Tracking
    {
      category: 'DELIVERY',
      q: "How fast is Krusty Krab Delivery?",
      a: "Our delivery drivers zoom faster than SpongeBob driving the Patty Wagon! Average delivery takes 20-30 minutes."
    },
    {
      category: 'DELIVERY',
      q: "What if Plankton steals my delivery order?",
      a: "Don't worry! Our Secret Formula Guarantee protects your order with 100% free replacement if any villain touches your food."
    },
    {
      category: 'DELIVERY',
      q: "Can I track my order status in real-time?",
      a: "Yes! Click the 'Orders' link in the top menu to view live comic timeline status (Placed, Preparing, Cooking, Out for Delivery, Delivered)."
    },

    // Payment & Omnitrix
    {
      category: 'PAYMENT',
      q: "What payment tools are supported?",
      a: "We support Digital UPI (GPay, PhonePe, Paytm), Credit/Debit Cards, and Cash on Delivery (COD) in Ben 10 alien green theme!"
    },
    {
      category: 'PAYMENT',
      q: "Is Cash on Delivery (COD) available for all orders?",
      a: "Yes! Cash on Delivery is available for all cartoon food delivery orders with zero extra fees."
    },
    {
      category: 'PAYMENT',
      q: "Are my card and payment details secure?",
      a: "100% Omnitrix Encrypted! Your transaction is protected with military-grade cartoon encryption."
    },

    // Rewards & Coupons
    {
      category: 'REWARDS',
      q: "How do I earn Pokéball points and Gym Badges?",
      a: "Every order earns Trainer Points! Visit the 'Rewards' page in the footer to track your Kanto Gym Badges and redeem free sidekick treats."
    },
    {
      category: 'REWARDS',
      q: "Where do I apply discount coupons like ELMORE40?",
      a: "Check the 'Offers' page in the footer to copy codes like ELMORE40 (40% OFF) or DARWIN20, then apply them at checkout!"
    },
    {
      category: 'REWARDS',
      q: "How does Jerry's Cheese Vault work for saved treats?",
      a: "Click the heart button on any food item to save it into the Tom & Jerry Vault (Favorites). Click the heart icon in the navbar anytime to view your stash!"
    }
  ];

  const filteredFaqs = faqs.filter(faq => {
    const matchesCategory = activeCategory === 'ALL' || faq.category === activeCategory;
    const matchesSearch = faq.q.toLowerCase().includes(search.toLowerCase()) || faq.a.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="w-full py-8 flex flex-col items-center relative z-10 text-[#1a1c1c] max-w-6xl mx-auto px-4">
      {/* SpongeBob Bikini Bottom Header */}
      <div className="w-full bg-[#00B4D8] border-4 border-[#1a1c1c] shadow-[8px_8px_0px_0px_#111111] rounded-3xl p-6 md:p-8 relative overflow-hidden mb-8 text-center flex flex-col items-center gap-3">
        <div className="bg-[#FFD23F] text-[#1a1c1c] border-3 border-[#1a1c1c] shadow-[4px_4px_0px_0px_#111111] px-4 py-1 rotate-[-2deg] font-black text-xs uppercase tracking-widest">
          BIKINI BOTTOM SUPPORT CENTER
        </div>
        <h1 className="font-display-xl text-3xl md:text-5xl uppercase font-black tracking-tight text-white drop-shadow-[3px_3px_0px_#1a1c1c]">
          SPONGEBOB HELP & FAQ
        </h1>
        <p className="text-xs font-black uppercase tracking-wider text-[#1a1c1c] bg-white border-2 border-[#1a1c1c] px-4 py-1 rounded-full shadow-[2px_2px_0px_0px_#111111]">
          UNDERWATER KRUSTY KRAB HELP & FAQ SECTIONS!
        </p>

        {/* Search Bar */}
        <div className="w-full max-w-xl mt-4 relative">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search FAQ Questions (e.g. Delivery, Payment, Krabby Patty)..."
            className="w-full p-4 pl-12 bg-white text-[#1a1c1c] border-4 border-[#1a1c1c] rounded-2xl font-bold text-sm shadow-[4px_4px_0px_0px_#111111] focus:outline-none focus:border-[#FFD23F]"
          />
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-black text-[#1a1c1c]">
            search
          </span>
        </div>
      </div>

      {/* Category Section Tabs */}
      <div className="w-full mb-8 flex flex-wrap justify-center gap-3">
        {categories.map(cat => (
          <button
            key={cat.id}
            type="button"
            onClick={() => setActiveCategory(cat.id)}
            className={`px-4 py-2.5 rounded-2xl border-3 border-[#1a1c1c] font-black text-xs uppercase transition-all cursor-pointer flex items-center gap-2 ${
              activeCategory === cat.id
                ? 'bg-[#FFD23F] text-[#1a1c1c] shadow-[4px_4px_0px_0px_#111111] -translate-y-0.5'
                : 'bg-white text-gray-800 shadow-[2px_2px_0px_0px_#111111] hover:bg-gray-100'
            }`}
          >
            <span className="material-symbols-outlined text-base">{cat.icon}</span>
            <span>{cat.label}</span>
          </button>
        ))}
      </div>

      {/* FAQ Accordion Section & Support Sidebar */}
      <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: FAQ Accordion List */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          <div className="flex justify-between items-center mb-1">
            <h2 className="font-headline-md text-xl font-black uppercase text-[#1a1c1c] flex items-center gap-2">
              <span className="material-symbols-outlined text-2xl text-[#00B4D8] font-black">help_center</span>
              FAQ KNOWLEDGE BASE ({filteredFaqs.length})
            </h2>
            <span className="text-xs font-black uppercase bg-[#FFD23F] border-2 border-[#1a1c1c] px-3 py-0.5 rounded-full">
              {activeCategory} SECTION
            </span>
          </div>

          {filteredFaqs.length === 0 ? (
            <div className="bg-white border-4 border-[#1a1c1c] p-8 rounded-2xl text-center shadow-[4px_4px_0px_0px_#111111]">
              <span className="material-symbols-outlined text-5xl text-gray-400 font-black mb-2 block">
                search_off
              </span>
              <h3 className="font-black text-lg uppercase text-[#1a1c1c]">No FAQ Matches Found</h3>
              <p className="text-xs font-bold text-gray-600 mt-1">
                Try searching for another keyword or switch category sections above!
              </p>
            </div>
          ) : (
            filteredFaqs.map((faq, idx) => (
              <div key={idx} className="bg-white border-4 border-[#1a1c1c] shadow-[6px_6px_0px_0px_#111111] rounded-2xl overflow-hidden transition-all">
                <button
                  type="button"
                  onClick={() => setOpenIndex(openIndex === idx ? -1 : idx)}
                  className="w-full p-5 bg-[#FFD23F] border-b-4 border-[#1a1c1c] flex justify-between items-center text-left font-black text-sm md:text-base uppercase text-[#1a1c1c] cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-lg">help</span>
                    {faq.q}
                  </span>
                  <span className="material-symbols-outlined text-2xl font-black shrink-0">
                    {openIndex === idx ? 'keyboard_arrow_up' : 'keyboard_arrow_down'}
                  </span>
                </button>

                {openIndex === idx && (
                  <div className="p-5 font-bold text-xs md:text-sm text-gray-800 bg-white leading-relaxed">
                    {faq.a}
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Right Column: Krusty Krab Live Support Hotline */}
        <div className="lg:col-span-4 bg-[#FF70A6] border-4 border-[#1a1c1c] shadow-[8px_8px_0px_0px_#111111] p-6 rounded-3xl text-white flex flex-col gap-4 sticky top-28">
          <div className="bg-white text-[#1a1c1c] border-3 border-[#1a1c1c] p-3 rounded-2xl shadow-[3px_3px_0px_0px_#111111] flex items-center gap-3">
            <span className="material-symbols-outlined text-3xl font-black text-[#FF70A6]">support_agent</span>
            <div>
              <span className="font-black text-sm uppercase block">KRUSTY KRAB HOTLINE</span>
              <span className="text-xs font-bold text-gray-700">24/7 Underwater Agent</span>
            </div>
          </div>

          <p className="text-xs font-black uppercase text-gray-900 bg-white/90 p-3 border-2 border-[#1a1c1c] rounded-xl leading-relaxed">
            Need urgent help with your order? Our Krusty Krab support agents are ready to assist!
          </p>

          <button
            type="button"
            onClick={() => alert("Connecting to Bikini Bottom Agent! Aye Aye Captain!")}
            className="w-full py-3.5 bg-[#FFD23F] text-[#1a1c1c] border-3 border-[#1a1c1c] shadow-[4px_4px_0px_0px_#111111] font-black text-base uppercase rounded-xl hover:bg-yellow-400 cursor-pointer flex items-center justify-center gap-2"
          >
            <span>LIVE CHAT SUPPORT</span>
            <span className="material-symbols-outlined text-xl font-bold">chat</span>
          </button>
        </div>
      </div>
    </div>
  );
}
