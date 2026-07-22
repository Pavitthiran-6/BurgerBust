import React, { useState } from 'react';

export default function StoryView({ onBrowseMenu, setCurrentPage }) {
  const [activeFrame, setActiveFrame] = useState(0);

  const frames = [
    { title: "ISSUE #1: THE BIRTH OF THE BURST", year: "1999", desc: "Popeye & Chef Spongebob teamed up in Bikini Bottom to build the ultimate cartoon burger bistro!", image: "/foods/burger-boss.png", bg: "bg-[#FFD23F]" },
    { title: "ISSUE #2: DEXTER'S LAB FORMULA", year: "2010", desc: "Dexter invented the 100% pure cheese stretchy formula in his secret underground laboratory!", image: "/foods/pizza-cheesy.png", bg: "bg-[#FF0055] text-white" },
    { title: "ISSUE #3: DORAEMON 4D DISPATCH", year: "2026", desc: "Doraemon unlocked the Anywhere Door, teleporting hot burgers straight to your doorstep in 8 mins!", image: "/foods/pizza-pepperoni.png", bg: "bg-[#00F0FF]" }
  ];

  const teamMembers = [
    { name: "CHEF SPONGEBOB", role: "MASTER FRY COOK", badge: "KRABBY LEGEND" },
    { name: "POPEYE THE SAILOR", role: "SPINACH BURGER ARCHITECT", badge: "STRENGTH MASTER" },
    { name: "DEXTER THE GENIUS", role: "LABORATORY SCIENTIST", badge: "FORMULA CREATOR" }
  ];

  return (
    <div className="w-full py-8 flex flex-col items-center relative z-10 text-[#1a1c1c] max-w-6xl mx-auto px-4">
      {/* 1. Header Banner */}
      <div className="w-full bg-[#FF70A6] text-white border-4 border-[#1a1c1c] shadow-[8px_8px_0px_0px_#111111] rounded-3xl p-6 md:p-8 text-center mb-8">
        <span className="bg-[#FFD23F] text-[#1a1c1c] border-2 border-[#1a1c1c] px-4 py-1 rounded-full text-xs font-black uppercase inline-block mb-2 rotate-[-2deg]">
          VINTAGE COMIC ISSUE #100
        </span>
        <h1 className="font-display-xl text-3xl md:text-5xl font-black uppercase">
          THE BURGERBURST SAGA
        </h1>
        <p className="text-xs font-bold text-yellow-200">FOUNDER'S STORY, KITCHEN BLUEPRINT, TEAM & FUTURE VISION!</p>
      </div>

      {/* 2. Founder's Story — Newspaper Clipping Layout */}
      <section className="w-full bg-[#FFF8E7] border-4 border-[#1a1c1c] shadow-[10px_10px_0px_0px_#111111] rounded-3xl p-6 md:p-10 mb-10 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="flex flex-col items-start gap-3 max-w-lg">
          <span className="bg-[#FF0055] text-white border-2 border-[#1a1c1c] px-3 py-0.5 rounded-full text-xs font-black uppercase">
             DAILY BUGLE EXCLUSIVE • 1999
          </span>
          <h2 className="font-display-xl text-3xl md:text-4xl font-black uppercase text-[#1a1c1c]">
            FOUNDER'S SECRET NEWSPAPER CLIPPING
          </h2>
          <p className="text-xs font-bold text-gray-800 leading-relaxed font-mono">
            "It all started when Popeye got tired of eating plain spinach! He teamed up with Chef Spongebob and Dexter to create food that heals 100 HP instantly!"
          </p>
        </div>

        <div className="w-64 h-64 bg-white border-4 border-[#1a1c1c] p-4 rounded-2xl shadow-[6px_6px_0px_0px_#111111] rotate-[3deg] shrink-0 flex flex-col justify-between">
          <img src="/foods/burger-boss.png" alt="Founder Burger" className="w-full h-40 object-contain" />
          <span className="font-black text-center text-xs uppercase border-t-2 border-dashed border-[#1a1c1c] pt-2">FIRST BURGER BUST 1999</span>
        </div>
      </section>

      {/* 3. Interactive Comic Timeline */}
      <section className="w-full mb-10">
        <h2 className="font-headline-md text-2xl font-black uppercase text-[#1a1c1c] mb-6 flex items-center gap-2">
          <span className="material-symbols-outlined text-2xl text-[#FF0055]">auto_stories</span>
          INTERACTIVE COMIC TIMELINE
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {frames.map((f, i) => (
            <div key={i} className={`border-4 border-[#1a1c1c] shadow-[8px_8px_0px_0px_#111111] rounded-3xl p-6 flex flex-col justify-between min-h-[260px] ${f.bg}`}>
              <div>
                <span className="bg-white text-[#1a1c1c] border-2 border-[#1a1c1c] px-3 py-0.5 rounded-full font-black text-xs uppercase inline-block mb-2">
                  {f.year}
                </span>
                <h3 className="font-display-xl text-xl font-black uppercase mb-2">{f.title}</h3>
                <p className="text-xs font-bold opacity-90">{f.desc}</p>
              </div>
              <img src={f.image} alt={f.title} className="w-28 h-28 object-contain mx-auto mt-4" />
            </div>
          ))}
        </div>
      </section>

      {/* 4. Kitchen Tour & Ingredient Blueprint */}
      <section className="w-full bg-[#1a1c1c] text-white border-4 border-[#1a1c1c] shadow-[10px_10px_0px_0px_#00F0FF] rounded-3xl p-6 md:p-10 mb-10">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="space-y-3 max-w-lg">
            <span className="bg-[#00F0FF] text-[#1a1c1c] border-2 border-white px-3 py-0.5 rounded-full text-xs font-black uppercase">
               BLUEPRINT SPECIFICATION
            </span>
            <h2 className="font-display-xl text-3xl font-black uppercase text-white">
              SECRET KITCHEN BLUEPRINT
            </h2>
            <p className="text-xs font-bold text-gray-300">
              100% Organic Land of Ooo Vegetables, 48-Hour Aged Toon Cheddar, and Flame-Grilled Beef Patties!
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 w-full md:w-auto">
            <div className="bg-gray-900 border border-cyan-400 p-3 rounded-xl text-center text-xs font-bold">
              <span className="text-cyan-400 font-black block">0% ARTIFICIAL</span>
              <span>NATURAL INGREDIENTS</span>
            </div>
            <div className="bg-gray-900 border border-cyan-400 p-3 rounded-xl text-center text-xs font-bold">
              <span className="text-[#34C759] font-black block">100% FRESH</span>
              <span>DAILY PREPARATION</span>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Behind the Scenes & Meet the Team — Polaroid Collage */}
      <section className="w-full bg-[#FFD23F] border-4 border-[#1a1c1c] shadow-[8px_8px_0px_0px_#111111] rounded-3xl p-6 md:p-8">
        <h2 className="font-display-xl text-3xl font-black uppercase text-[#1a1c1c] mb-6 text-center">
          MEET THE CARTOON CHEF TEAM
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {teamMembers.map((tm, idx) => (
            <div key={idx} className="bg-white border-4 border-[#1a1c1c] p-5 rounded-2xl shadow-[6px_6px_0px_0px_#111111] text-center flex flex-col justify-between">
              <div>
                <span className="bg-[#FF0055] text-white border border-[#1a1c1c] px-2.5 py-0.5 rounded text-[10px] font-black uppercase inline-block mb-2">
                  {tm.badge}
                </span>
                <h4 className="font-black text-lg uppercase text-[#1a1c1c]">{tm.name}</h4>
                <p className="text-xs font-bold text-gray-600">{tm.role}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
