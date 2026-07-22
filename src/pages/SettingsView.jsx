import React, { useState } from 'react';

export default function SettingsView({ showToast }) {
  const [sound, setSound] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [autoSave, setAutoSave] = useState(true);
  const [darkTheme, setDarkTheme] = useState(false);

  const handleSave = () => {
    if (showToast) showToast("Regular Show Settings Saved!", "success");
  };

  return (
    <div className="w-full py-8 flex flex-col items-center relative z-10 text-[#1a1c1c] max-w-5xl mx-auto px-4">
      {/* Regular Show Header Banner */}
      <div className="w-full bg-[#52B788] border-4 border-[#1a1c1c] shadow-[8px_8px_0px_0px_#111111] rounded-3xl p-6 md:p-8 relative overflow-hidden mb-10 text-[#1a1c1c] flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <div className="bg-[#FFD23F] text-[#1a1c1c] border-2 border-[#1a1c1c] px-3 py-0.5 rounded-full text-xs font-black uppercase inline-block mb-1">
            PARK BENCH SETTINGS HQ
          </div>
          <h1 className="font-display-xl text-3xl md:text-5xl uppercase font-black tracking-tight text-[#1a1c1c]">
            REGULAR SHOW SETTINGS
          </h1>
          <p className="text-xs font-black uppercase tracking-wider text-gray-900">
            MORDECAI & RIGBY CASSETTE TAPE CONFIGURATION!
          </p>
        </div>

        <div className="w-16 h-16 bg-white border-4 border-[#1a1c1c] shadow-[4px_4px_0px_0px_#111111] rounded-2xl flex items-center justify-center font-black text-2xl shrink-0 rotate-[4deg]">
          <span className="material-symbols-outlined text-3xl">radio</span>
        </div>
      </div>

      {/* Settings Options Card */}
      <div className="w-full bg-white border-4 border-[#1a1c1c] shadow-[8px_8px_0px_0px_#111111] rounded-3xl p-6 md:p-8 flex flex-col gap-6">
        <div className="border-b-4 border-[#1a1c1c] pb-4 flex items-center justify-between">
          <h2 className="font-headline-md text-2xl font-black uppercase text-[#1a1c1c]">Park Controls</h2>
          <span className="material-symbols-outlined text-2xl font-black text-[#52B788]">tune</span>
        </div>

        {/* Setting Items */}
        {[
          { label: "COMIC SOUND EFFECTS (OOOHHH!)", state: sound, setter: setSound, desc: "Play cartoon sound effects on actions" },
          { label: "HERO APP NOTIFICATIONS", state: notifications, setter: setNotifications, desc: "Receive order tracking & deal alerts" },
          { label: "AUTO-SAVE ADDRESSES", state: autoSave, setter: setAutoSave, desc: "Remember secret hideouts for quick checkout" },
          { label: "DARK COMIC THEME", state: darkTheme, setter: setDarkTheme, desc: "Switch to high contrast dark mode" }
        ].map((item, idx) => (
          <div key={idx} className="flex justify-between items-center py-3 border-b-2 border-dashed border-gray-300">
            <div>
              <span className="font-black text-sm uppercase text-[#1a1c1c] block">{item.label}</span>
              <span className="text-xs font-bold text-gray-600">{item.desc}</span>
            </div>

            <button
              type="button"
              onClick={() => item.setter(!item.state)}
              className={`w-14 h-8 border-3 border-[#1a1c1c] rounded-full flex items-center p-1 transition-all cursor-pointer ${
                item.state ? 'bg-[#52B788] justify-end' : 'bg-gray-300 justify-start'
              }`}
            >
              <div className="w-5 h-5 bg-white border-2 border-[#1a1c1c] rounded-full shadow-sm"></div>
            </button>
          </div>
        ))}

        <button
          type="button"
          onClick={handleSave}
          className="mt-4 bg-[#52B788] text-[#1a1c1c] border-4 border-[#1a1c1c] shadow-[6px_6px_0px_0px_#111111] py-4 px-6 font-black text-lg uppercase hover:bg-emerald-500 active:translate-y-1 transition-all rounded-2xl cursor-pointer flex items-center justify-center gap-2"
        >
          <span>SAVE PARK SETTINGS</span>
          <span className="material-symbols-outlined font-black">save</span>
        </button>
      </div>
    </div>
  );
}
