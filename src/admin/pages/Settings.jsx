import React, { useState } from 'react';
import { useAdmin } from '../AdminContext';

export default function Settings() {
  const { settings, setSettings, logActivity } = useAdmin();
  const [hours, setHours] = useState(settings.restaurantHours);
  const [radius, setRadius] = useState(settings.deliveryRadius);
  const [minOrder, setMinOrder] = useState(settings.minimumOrder);
  const [charges, setCharges] = useState(settings.deliveryCharges);

  const handleSave = (e) => {
    e.preventDefault();
    setSettings(prev => ({
      ...prev,
      restaurantHours: hours,
      deliveryRadius: parseFloat(radius) || 0,
      minimumOrder: parseFloat(minOrder) || 0,
      deliveryCharges: parseFloat(charges) || 0
    }));
    logActivity('Modified Global settings parameters');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fadeIn">
      {/* Left: General Settings Form */}
      <form onSubmit={handleSave} className="lg:col-span-7 bg-white border-4 border-[#1a1c1c] p-6 rounded-3xl shadow-[6px_6px_0px_0px_#111111] space-y-6 text-xs font-bold text-gray-700">
        <h3 className="font-headline-md text-xl font-black uppercase text-[#1a1c1c] border-b-4 border-black pb-2 mb-4">
          SYSTEM PARAMETERS
        </h3>

        <div className="flex flex-col gap-1.5">
          <label className="uppercase text-[10px] font-black text-gray-500">Restaurant Operations Hours</label>
          <input
            type="text"
            required
            value={hours}
            onChange={(e) => setHours(e.target.value)}
            className="p-3 border-2 border-black rounded-xl font-bold bg-white text-[#1a1c1c] focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="uppercase text-[10px] font-black text-gray-500">Delivery Limit (KM)</label>
            <input
              type="number"
              required
              value={radius}
              onChange={(e) => setRadius(e.target.value)}
              className="p-3 border-2 border-black rounded-xl font-bold bg-white text-[#1a1c1c] focus:outline-none"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="uppercase text-[10px] font-black text-gray-500">Min Order ($)</label>
            <input
              type="number"
              step="0.01"
              required
              value={minOrder}
              onChange={(e) => setMinOrder(e.target.value)}
              className="p-3 border-2 border-black rounded-xl font-bold bg-white text-[#1a1c1c] focus:outline-none"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="uppercase text-[10px] font-black text-gray-500">Charges ($)</label>
            <input
              type="number"
              step="0.01"
              required
              value={charges}
              onChange={(e) => setCharges(e.target.value)}
              className="p-3 border-2 border-black rounded-xl font-bold bg-white text-[#1a1c1c] focus:outline-none"
            />
          </div>
        </div>

        <button
          type="submit"
          className="px-6 py-3.5 bg-[#34C759] text-white border-3 border-black font-black text-xs uppercase rounded-xl cursor-pointer hover:bg-green-600 active:scale-95 transition-all shadow-[2px_2px_0px_0px_#111111]"
        >
          APPLY PARAMETER ADJUSTMENTS
        </button>
      </form>

      {/* Right: Emergency Override Locks */}
      <div className="lg:col-span-5 bg-white border-4 border-[#1a1c1c] p-6 rounded-3xl shadow-[6px_6px_0px_0px_#111111] space-y-6">
        <h3 className="font-headline-md text-xl font-black uppercase text-[#1a1c1c] border-b-4 border-black pb-2 mb-4">
          EMERGENCY COOLDOWNS
        </h3>
        
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-[#FFF8E7] border-2 border-black p-4 rounded-2xl">
            <div>
              <span className="text-xs font-black uppercase block">MAINTENANCE OVERRIDE</span>
              <span className="text-[9px] font-bold text-gray-500 uppercase">Lock out all customer actions instantly</span>
            </div>
            <button
              onClick={() => setSettings(prev => ({ ...prev, maintenanceMode: !prev.maintenanceMode }))}
              className={`px-3 py-1.5 font-black text-[10px] uppercase rounded-lg border-2 border-black cursor-pointer transition-colors ${
                settings.maintenanceMode ? 'bg-red-500 text-white' : 'bg-white hover:bg-gray-50'
              }`}
            >
              {settings.maintenanceMode ? 'LOCKED' : 'ENGAGE'}
            </button>
          </div>

          <div className="flex justify-between items-center bg-[#FFF8E7] border-2 border-black p-4 rounded-2xl">
            <div>
              <span className="text-xs font-black uppercase block">HOLIDAY SHUTDOWN</span>
              <span className="text-[9px] font-bold text-gray-500 uppercase">Show holiday banner & pause dispatches</span>
            </div>
            <button
              onClick={() => setSettings(prev => ({ ...prev, holidayMode: !prev.holidayMode }))}
              className={`px-3 py-1.5 font-black text-[10px] uppercase rounded-lg border-2 border-black cursor-pointer transition-colors ${
                settings.holidayMode ? 'bg-[#FFD23F] text-[#1a1c1c]' : 'bg-white hover:bg-gray-50'
              }`}
            >
              {settings.holidayMode ? 'ENGAGED' : 'ENGAGE'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
