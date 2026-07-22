import React, { useState } from 'react';

export default function TermsView({ setCurrentPage }) {
  const [activeCategory, setActiveCategory] = useState('ALL');

  const categories = [
    { id: 'ALL', label: 'All Cartoon Terms', icon: 'gavel' },
    { id: 'ORDERING', label: 'Kasukabe Code', icon: 'lunch_dining' },
    { id: 'GUARANTEE', label: 'Action Mask Deals', icon: 'military_tech' },
    { id: 'PRIVACY', label: 'Privacy & Vault', icon: 'security' },
    { id: 'SHIPPING', label: 'Toon Town Shipping', icon: 'two_wheeler' }
  ];

  const sections = [
    // Ordering Code
    {
      id: "term-1",
      category: "ORDERING",
      title: "1. KASUKABE TOON ORDERING CODE",
      badge: "ACTION MASK RULE #1",
      content: "By placing an order on BurgerBurst, you agree to receive 100% fresh, hand-drawn deliciousness. Orders dispatched from the Kasukabe kitchen cannot be intercepted by Action Mask or Nohara family antics once the grill is fired up!",
      color: "bg-[#FF3B30]",
      textColor: "text-white"
    },
    {
      id: "term-5",
      category: "ORDERING",
      title: "2. NO FEEDING CHOCOBI TO REAL DOGS",
      badge: "SHIRO'S PET CODE",
      content: "All burgers and sidekick treats are strictly crafted for human cartoon heroes and hungry adventurers. Please ensure Shiro receives his official dog food and not Action Mask's spicy dragon sauce!",
      color: "bg-[#FFCC00]",
      textColor: "text-[#1a1c1c]"
    },

    // Action Mask Guarantees
    {
      id: "term-2",
      category: "GUARANTEE",
      title: "3. 30-MIN CHOCOBI DELIVERY GUARANTEE",
      badge: "30-MIN GUARANTEE",
      content: "Our delivery drivers aim for 20-30 minute delivery. If your delivery is delayed by a villain, Action Mask guarantees a 100% replacement or free Chocobi snack box voucher for your next order!",
      color: "bg-[#FFCC00]",
      textColor: "text-[#1a1c1c]"
    },
    {
      id: "term-6",
      category: "GUARANTEE",
      title: "4. REFUNDS & TOON CREDIT VAULT",
      badge: "INSTANT REFUND",
      content: "If an item is missing or mislaid by Kasukabe delivery heroes, instant full refunds are credited back to your Tom & Jerry Vault wallet with zero hassle!",
      color: "bg-[#34C759]",
      textColor: "text-white"
    },

    // Privacy & Formula Rights
    {
      id: "term-3",
      category: "PRIVACY",
      title: "5. TALISMAN TOPPINGS & FORMULA RIGHTS",
      badge: "SECRET FORMULA",
      content: "All recipe formulas, dragon breath sauces, shadow onion toppings, and comic artwork remain the exclusive intellectual property of BurstBurger Comics Inc. No copying recipes for Plankton!",
      color: "bg-[#34C759]",
      textColor: "text-white"
    },
    {
      id: "term-7",
      category: "PRIVACY",
      title: "6. TOON VAULT ENCRYPTION & DATA SHIELD",
      badge: "LASER SHIELD",
      content: "Your shipping addresses, phone numbers, and payment details are protected by Action Mask's laser beam shield. We never sell your data to evil syndicates!",
      color: "bg-[#70D6FF]",
      textColor: "text-[#1a1c1c]"
    },

    // Shipping & Force Majeure
    {
      id: "term-4",
      category: "SHIPPING",
      title: "7. HERO CODE OF CONDUCT & MISAE SCOLDING",
      badge: "ACTION BASTA!",
      content: "Be respectful to all toon delivery heroes and kitchen staff. Any mischievous behavior will result in a friendly scolding from Misae (Shin-chan's Mom) and account suspension!",
      color: "bg-[#70D6FF]",
      textColor: "text-[#1a1c1c]"
    },
    {
      id: "term-8",
      category: "SHIPPING",
      title: "8. SUPERHERO KAIJU FORCE MAJEURE",
      badge: "KAIJU IMMUNITY",
      content: "Delays caused by giant monster attacks, Godzilla sightings, or alien space wars in Kasukabe City are covered under Superhero Force Majeure. Stay safe in your hideout!",
      color: "bg-[#FF3B30]",
      textColor: "text-white"
    }
  ];

  const filteredSections = sections.filter(s => activeCategory === 'ALL' || s.category === activeCategory);

  return (
    <div className="w-full py-8 flex flex-col items-center relative z-10 text-[#1a1c1c] max-w-5xl mx-auto px-4">
      {/* Shin-chan Header Banner */}
      <div className="w-full bg-[#FF3B30] border-4 border-[#1a1c1c] shadow-[8px_8px_0px_0px_#111111] rounded-3xl p-6 md:p-8 relative overflow-hidden mb-8 text-white text-center flex flex-col items-center gap-3">
        <div className="bg-[#FFCC00] text-[#1a1c1c] border-3 border-[#1a1c1c] shadow-[4px_4px_0px_0px_#111111] px-4 py-1 rotate-[-2deg] font-black text-xs uppercase tracking-widest">
          ACTION MASK APPROVED TERMS
        </div>
        <h1 className="font-display-xl text-3xl md:text-5xl uppercase font-black tracking-tight text-white drop-shadow-[3px_3px_0px_#1a1c1c]">
          SHIN-CHAN TERMS & CONDITIONS
        </h1>
        <p className="text-xs font-black uppercase tracking-wider text-yellow-200 bg-[#1a1c1c] border-2 border-white px-4 py-1 rounded-full shadow-[2px_2px_0px_0px_#FFCC00]">
          ACTION BASTA CARTOON CODE & KASUKABE RULES SECTIONS!
        </p>
      </div>

      {/* Category Filter Tabs */}
      <div className="w-full mb-8 flex flex-wrap justify-center gap-3">
        {categories.map(cat => (
          <button
            key={cat.id}
            type="button"
            onClick={() => setActiveCategory(cat.id)}
            className={`px-4 py-2.5 rounded-2xl border-3 border-[#1a1c1c] font-black text-xs uppercase transition-all cursor-pointer flex items-center gap-2 ${
              activeCategory === cat.id
                ? 'bg-[#FFCC00] text-[#1a1c1c] shadow-[4px_4px_0px_0px_#111111] -translate-y-0.5'
                : 'bg-white text-gray-800 shadow-[2px_2px_0px_0px_#111111] hover:bg-gray-100'
            }`}
          >
            <span className="material-symbols-outlined text-base">{cat.icon}</span>
            <span>{cat.label}</span>
          </button>
        ))}
      </div>

      {/* Terms Sections Grid */}
      <div className="w-full flex flex-col gap-6 mb-10">
        {filteredSections.map((section) => (
          <div
            key={section.id}
            className="bg-white border-4 border-[#1a1c1c] shadow-[6px_6px_0px_0px_#111111] rounded-3xl p-6 md:p-8 flex flex-col gap-3 relative overflow-hidden group hover:-translate-y-0.5 transition-all"
          >
            <div className="flex justify-between items-center border-b-3 border-[#1a1c1c] pb-3">
              <h2 className="font-headline-md text-xl md:text-2xl font-black uppercase text-[#1a1c1c]">
                {section.title}
              </h2>
              <span className={`${section.color} ${section.textColor} border-2 border-[#1a1c1c] px-3 py-1 rounded-full text-xs font-black uppercase shadow-[2px_2px_0px_0px_#111111]`}>
                {section.badge}
              </span>
            </div>

            <p className="font-mono text-xs md:text-sm font-semibold text-gray-800 leading-relaxed">
              {section.content}
            </p>
          </div>
        ))}
      </div>

      {/* Acceptance Box */}
      <div className="w-full bg-[#FFCC00] border-4 border-[#1a1c1c] shadow-[8px_8px_0px_0px_#111111] p-6 rounded-3xl text-center flex flex-col items-center gap-3">
        <span className="material-symbols-outlined text-4xl text-[#1a1c1c] font-black">
          verified
        </span>
        <h3 className="font-headline-md text-2xl font-black uppercase text-[#1a1c1c]">
          YOU ARE NOW ACTION MASK CERTIFIED!
        </h3>
        <p className="text-xs font-bold text-gray-800 max-w-md">
          By ordering from BurgerBurst, you accept these terms with full Action Mask energy!
        </p>

        <button
          type="button"
          onClick={() => setCurrentPage && setCurrentPage('menu')}
          className="mt-2 bg-[#1a1c1c] text-white border-3 border-[#1a1c1c] shadow-[4px_4px_0px_0px_#FFFFFF] px-8 py-3.5 font-black text-sm uppercase rounded-xl hover:bg-gray-800 cursor-pointer flex items-center gap-2"
        >
          <span>ACCEPT & GRAB BURGERS</span>
          <span className="material-symbols-outlined font-bold">arrow_forward</span>
        </button>
      </div>
    </div>
  );
}
