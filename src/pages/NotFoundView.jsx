import React from 'react';

export default function NotFoundView({ onGoHome, onBrowseMenu }) {
  return (
    <div className="w-full py-12 flex flex-col items-center justify-center relative z-10 text-[#1a1c1c] max-w-xl mx-auto px-4 min-h-[70vh]">
      {/* 404 Card */}
      <div className="w-full bg-[#FFD23F] border-4 border-[#1a1c1c] shadow-[8px_8px_0px_0px_#111111] rounded-3xl p-8 md:p-12 text-center flex flex-col items-center gap-5 relative overflow-hidden">
        <div className="w-20 h-20 bg-white text-[#1a1c1c] rounded-full border-4 border-[#1a1c1c] shadow-[4px_4px_0px_0px_#111111] flex items-center justify-center font-black text-3xl shrink-0 animate-bounce">
          <span className="material-symbols-outlined text-5xl">explore_off</span>
        </div>

        <div className="bg-[#FF0055] text-white border-2 border-[#1a1c1c] px-4 py-1 rounded-full text-xs font-black uppercase tracking-widest rotate-[-3deg]">
          CARTOON DIMENSION ERROR 404
        </div>

        <h1 className="font-display-xl text-3xl md:text-5xl uppercase font-black tracking-tight text-[#1a1c1c]">
          LOST IN TOON CITY 404
        </h1>

        <p className="font-body-lg text-sm font-bold text-gray-900 max-w-md">
          YIKES! You've wandered off the cartoon map into the uncharted Ooo Multiverse! Let's get you back to the burger bistro!
        </p>

        <div className="flex flex-col sm:flex-row gap-3 w-full mt-4 justify-center">
          <button
            type="button"
            onClick={onGoHome}
            className="py-3.5 px-6 bg-[#1a1c1c] text-white border-3 border-[#1a1c1c] shadow-[4px_4px_0px_0px_#FFFFFF] font-black text-sm uppercase rounded-xl hover:bg-gray-800 cursor-pointer flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-lg">home</span>
            <span>BACK TO HOME HQ</span>
          </button>

          <button
            type="button"
            onClick={onBrowseMenu}
            className="py-3.5 px-6 bg-white text-[#1a1c1c] border-3 border-[#1a1c1c] shadow-[4px_4px_0px_0px_#111111] font-black text-sm uppercase rounded-xl hover:bg-gray-100 cursor-pointer flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-lg">restaurant_menu</span>
            <span>GRAB BURGERS</span>
          </button>
        </div>
      </div>
    </div>
  );
}
