import React from 'react';
import { useAdmin } from '../AdminContext';

export default function Dealers() {
  const { dealers, toggleDealerStatus, toggleDealerHoliday } = useAdmin();

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header bar */}
      <div className="bg-white border-4 border-[#1a1c1c] shadow-[6px_6px_0px_0px_#111111] p-6 rounded-3xl">
        <h2 className="font-display-xl text-3xl font-black uppercase text-[#1a1c1c]">FRANCHISE PARTNERS</h2>
        <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-1">Manage partner storefront status, revenue shares, and store hours</p>
      </div>

      {/* Dealers cards list */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {dealers.map((dealer) => (
          <div
            key={dealer.id}
            className={`bg-white border-4 border-[#1a1c1c] shadow-[6px_6px_0px_0px_#111111] rounded-3xl p-6 flex flex-col justify-between ${
              dealer.storePaused ? 'bg-red-50/20' : ''
            }`}
          >
            <div>
              {/* Header */}
              <div className="flex justify-between items-start border-b-2 border-gray-100 pb-3 mb-4">
                <div>
                  <h3 className="font-black text-base uppercase text-[#1a1c1c]">{dealer.name}</h3>
                  <span className="text-[10px] font-bold text-gray-500 uppercase">{dealer.location}</span>
                </div>
                <div className="flex flex-col gap-1 items-end">
                  <span className="bg-yellow-300 border border-black px-1.5 py-0.5 rounded text-[8px] font-black uppercase">
                    ★ {dealer.rating}
                  </span>
                  {dealer.storePaused && (
                    <span className="bg-red-500 text-white border border-black px-1.5 py-0.5 rounded text-[8px] font-black uppercase">
                      PAUSED
                    </span>
                  )}
                </div>
              </div>

              {/* Commission & statistics */}
              <div className="grid grid-cols-3 gap-2 bg-[#FFF8E7] border-2 border-black p-3 rounded-xl text-center text-xs font-bold">
                <div>
                  <span className="text-[9px] font-black text-gray-400 block">ORDERS</span>
                  <span className="text-sm font-black text-[#1a1c1c]">{dealer.ordersCount}</span>
                </div>
                <div>
                  <span className="text-[9px] font-black text-gray-400 block">REVENUE</span>
                  <span className="text-sm font-black text-[#1a1c1c]">${dealer.revenue.toFixed(0)}</span>
                </div>
                <div>
                  <span className="text-[9px] font-black text-gray-400 block">COMMISSION</span>
                  <span className="text-sm font-black text-[#FF0055]">${dealer.commission.toFixed(0)}</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 border-t-2 border-gray-100 pt-4 mt-6">
              <button
                onClick={() => toggleDealerStatus(dealer.id)}
                className={`flex-1 py-2 font-black text-[10px] uppercase rounded-lg border-2 border-black transition-colors cursor-pointer text-center ${
                  dealer.storePaused ? 'bg-[#34C759] text-white' : 'bg-red-500 text-white'
                }`}
              >
                {dealer.storePaused ? 'RESUME STORE' : 'PAUSE STORE'}
              </button>
              <button
                onClick={() => toggleDealerHoliday(dealer.id)}
                className={`flex-1 py-2 font-black text-[10px] uppercase rounded-lg border-2 border-black transition-colors cursor-pointer text-center ${
                  dealer.holidayMode ? 'bg-[#FFD23F] text-[#1a1c1c]' : 'bg-white hover:bg-gray-50'
                }`}
              >
                {dealer.holidayMode ? 'HOLIDAY: ON' : 'HOLIDAY MODE'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
