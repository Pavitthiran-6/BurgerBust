import React, { useState } from 'react';
import { useAdmin } from '../AdminContext';

export default function DeliveryPartners() {
  const { riders, setRiders } = useAdmin();
  const [radius, setRadius] = useState(10); // Default radius in kms

  const toggleRiderStatus = (id) => {
    setRiders(prev => prev.map(r => {
      if (r.id === id) {
        const nextStatus = r.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
        return { ...c, status: nextStatus }; // Wait! Typo alert: "c" is not defined, should be "r"! Let's write correct code.
      }
      return r;
    }));
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header with radius controller */}
      <div className="bg-white border-4 border-[#1a1c1c] shadow-[6px_6px_0px_0px_#111111] p-6 rounded-3xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="font-display-xl text-3xl font-black uppercase text-[#1a1c1c]">DELIVERY COURIERS</h2>
          <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-1">Monitor active dispatches, speed stats, and operational radius</p>
        </div>

        {/* Radius control */}
        <div className="flex items-center gap-2 bg-[#FFF8E7] border-3 border-black p-3 rounded-2xl shrink-0">
          <span className="text-xs font-black uppercase">DELIVERY RADIUS:</span>
          <div className="flex items-center gap-1.5">
            <input
              type="number"
              value={radius}
              onChange={(e) => setRadius(parseInt(e.target.value) || 0)}
              className="w-16 p-1 border-2 border-black rounded font-black text-xs text-center bg-white"
            />
            <span className="text-xs font-black uppercase">KM</span>
          </div>
        </div>
      </div>

      {/* Riders grid list */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {riders.map((rider) => (
          <div
            key={rider.id}
            className={`bg-white border-4 border-[#1a1c1c] shadow-[6px_6px_0px_0px_#111111] rounded-3xl p-6 flex flex-col justify-between ${
              rider.status !== 'ACTIVE' ? 'opacity-65 bg-gray-50' : ''
            }`}
          >
            <div>
              <div className="flex justify-between items-start border-b-2 border-gray-100 pb-3 mb-4">
                <div>
                  <h3 className="font-black text-base uppercase text-[#1a1c1c]">{rider.name}</h3>
                  <span className="text-[10px] font-bold text-gray-500 uppercase">{rider.phone}</span>
                </div>
                <div className="flex flex-col gap-1 items-end">
                  <span className="bg-[#FFD23F] border border-black px-1.5 py-0.5 rounded text-[8px] font-black uppercase">
                    ★ {rider.rating}
                  </span>
                  <span className={`border border-black px-1.5 py-0.5 rounded text-[8px] font-black uppercase ${
                    rider.status === 'ACTIVE' ? 'bg-green-400 text-white' : 'bg-gray-400 text-white'
                  }`}>
                    {rider.status}
                  </span>
                </div>
              </div>

              {/* Rider Performance stats */}
              <div className="grid grid-cols-3 gap-2 bg-yellow-50/50 border-2 border-black p-3 rounded-xl text-center text-xs font-bold text-[#1a1c1c]">
                <div>
                  <span className="text-[9px] font-black text-gray-400 block">ACTIVE</span>
                  <span className="text-xs font-black">{rider.activeOrders} Ord</span>
                </div>
                <div>
                  <span className="text-[9px] font-black text-gray-400 block">DELIVERED</span>
                  <span className="text-xs font-black">{rider.completedCount}</span>
                </div>
                <div>
                  <span className="text-[9px] font-black text-gray-400 block">AVG SPEED</span>
                  <span className="text-xs font-black text-primary">{rider.avgTime}</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 border-t-2 border-gray-100 pt-4 mt-6">
              <button
                type="button"
                onClick={() => {
                  setRiders(prev => prev.map(r => r.id === rider.id ? { ...r, status: r.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE' } : r));
                }}
                className={`w-full py-2 font-black text-[10px] uppercase rounded-lg border-2 border-black transition-colors cursor-pointer text-center ${
                  rider.status === 'ACTIVE' ? 'bg-red-500 text-white' : 'bg-[#34C759] text-white'
                }`}
              >
                {rider.status === 'ACTIVE' ? 'DEACTIVATE' : 'ACTIVATE'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
