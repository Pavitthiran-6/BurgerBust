import React from 'react';

export default function Footer({ setCurrentPage }) {
  return (
    <footer className="bg-[#FFD23F] text-[#1a1c1c] border-t-6 border-[#1a1c1c] py-12 w-full mt-auto relative z-30 shadow-[0_-8px_0px_0px_#111111]">
      <div className="w-full px-4 md:px-12 flex flex-col gap-10">
        {/* Main Footer Grid */}
        <div className="flex flex-col md:flex-row justify-between items-start gap-8">
          {/* Brand & Tagline */}
          <div className="flex flex-col gap-4 max-w-sm">
            <div className="bg-white text-[#1a1c1c] px-6 py-2 rounded-2xl border-4 border-[#1a1c1c] shadow-[6px_6px_0px_0px_#111111] inline-block rotate-[-2deg]">
              <span className="font-display-xl text-3xl md:text-4xl font-black tracking-tight">
                BURGER BURST
              </span>
            </div>
            <p className="font-black text-xs uppercase tracking-wider text-gray-900 leading-relaxed">
              JOIN THE CARTOON REVOLUTION. FRESH FOOD DRAWN TO PERFECTION DAILY!
            </p>

            {/* Social / Share Action Buttons */}
            <div className="flex gap-3 mt-1">
              <button
                type="button"
                onClick={() => alert("Shared! Thank you toon warrior!")}
                className="w-12 h-12 bg-white text-[#1a1c1c] rounded-2xl border-3 border-[#1a1c1c] shadow-[3px_3px_0px_0px_#111111] flex items-center justify-center hover:bg-yellow-100 hover:-translate-y-0.5 active:translate-y-1 transition-all cursor-pointer"
                title="Share BurstBurger"
              >
                <span className="material-symbols-outlined font-black text-xl">share</span>
              </button>

              <button
                type="button"
                onClick={() => alert("Liked! You are awesome!")}
                className="w-12 h-12 bg-white text-[#1a1c1c] rounded-2xl border-3 border-[#1a1c1c] shadow-[3px_3px_0px_0px_#111111] flex items-center justify-center hover:bg-yellow-100 hover:-translate-y-0.5 active:translate-y-1 transition-all cursor-pointer"
                title="Like Us"
              >
                <span className="material-symbols-outlined font-black text-xl">thumb_up</span>
              </button>
            </div>
          </div>

          {/* Navigation Links Columns */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 md:gap-12">
            {/* MISSION */}
            <div className="flex flex-col gap-2.5">
              <h4 className="font-black text-sm uppercase text-[#1a1c1c] border-b-3 border-[#1a1c1c] pb-1 w-max">
                MISSION
              </h4>
              <ul className="flex flex-col gap-1.5 font-bold text-xs">
                <li>
                  <button
                    onClick={() => setCurrentPage && setCurrentPage('story')}
                    className="hover:text-white hover:underline cursor-pointer text-left uppercase"
                  >
                    Our Story
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setCurrentPage && setCurrentPage('favorites')}
                    className="hover:text-white hover:underline cursor-pointer text-left uppercase"
                  >
                    Tom & Jerry Vault
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setCurrentPage && setCurrentPage('menu')}
                    className="hover:text-white hover:underline cursor-pointer text-left uppercase"
                  >
                    The Kitchen
                  </button>
                </li>
              </ul>
            </div>

            {/* SUPPORT */}
            <div className="flex flex-col gap-2.5">
              <h4 className="font-black text-sm uppercase text-[#1a1c1c] border-b-3 border-[#1a1c1c] pb-1 w-max">
                SUPPORT
              </h4>
              <ul className="flex flex-col gap-1.5 font-bold text-xs">
                <li>
                  <button
                    onClick={() => setCurrentPage && setCurrentPage('terms')}
                    className="hover:text-white hover:underline cursor-pointer text-left uppercase"
                  >
                    Shin-chan Terms
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setCurrentPage && setCurrentPage('offers')}
                    className="hover:text-white hover:underline cursor-pointer text-left uppercase"
                  >
                    Get Coupons
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setCurrentPage && setCurrentPage('help')}
                    className="hover:text-white hover:underline cursor-pointer text-left uppercase"
                  >
                    Bikini Bottom FAQ
                  </button>
                </li>
              </ul>
            </div>

            {/* JOIN SQUAD */}
            <div className="flex flex-col gap-2.5 col-span-2 sm:col-span-1">
              <h4 className="font-black text-sm uppercase text-[#1a1c1c] border-b-3 border-[#1a1c1c] pb-1 w-max">
                JOIN SQUAD
              </h4>
              <ul className="flex flex-col gap-1.5 font-bold text-xs">
                <li>
                  <button
                    onClick={() => setCurrentPage && setCurrentPage('rewards')}
                    className="hover:text-white hover:underline cursor-pointer text-left uppercase"
                  >
                    Pokéball Rewards
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setCurrentPage && setCurrentPage('arcade')}
                    className="hover:text-white hover:underline cursor-pointer text-left uppercase"
                  >
                    Cartoon Arcade
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setCurrentPage && setCurrentPage('tracker')}
                    className="hover:text-white hover:underline cursor-pointer text-left uppercase"
                  >
                    Hero Tracker
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Divider & Copyright */}
        <div className="pt-6 border-t-4 border-[#1a1c1c] flex flex-col sm:flex-row justify-between items-center gap-4 text-xs font-black">
          <span>© 2026 BURGER BURST COMICS INC. ALL RIGHTS RESERVED.</span>
          <span className="bg-white text-[#1a1c1c] border-2 border-[#1a1c1c] px-4 py-1 rounded-full shadow-[2px_2px_0px_0px_#111111] uppercase">
            DRAWN WITH CARTOON LOVE IN TOON TOWN
          </span>
        </div>
      </div>
    </footer>
  );
}
