import React from 'react';
import { useAdmin } from '../AdminContext';

export default function Reviews() {
  const { reviews, updateReviewStatus } = useAdmin();

  // Average Rating
  const avgRating = (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header with Stats */}
      <div className="bg-white border-4 border-[#1a1c1c] shadow-[6px_6px_0px_0px_#111111] p-6 rounded-3xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="font-display-xl text-3xl font-black uppercase text-[#1a1c1c]">REVIEW MODERATION</h2>
          <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-1">Audit customer comments and visibility parameters</p>
        </div>

        <div className="bg-[#FFF8E7] border-3 border-black p-3 rounded-2xl shrink-0 flex items-center gap-2">
          <span className="text-xs font-black uppercase">AVERAGE RATING:</span>
          <span className="text-sm font-black text-primary">★ {avgRating} / 5.0</span>
        </div>
      </div>

      {/* Review List */}
      <div className="bg-white border-4 border-[#1a1c1c] shadow-[6px_6px_0px_0px_#111111] p-6 rounded-3xl">
        <ul className="flex flex-col gap-4">
          {reviews.map((rev) => (
            <li
              key={rev.id}
              className={`border-2 border-black p-4 rounded-2xl flex flex-col sm:flex-row justify-between gap-4 items-start sm:items-center transition-colors ${
                rev.status === 'HIDDEN' ? 'bg-gray-100 opacity-60' : 'bg-yellow-50/50'
              }`}
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-black text-xs uppercase text-[#1a1c1c]">{rev.customerName}</span>
                  <span className="text-[10px] font-bold text-gray-400">{rev.date}</span>
                </div>
                <div className="flex gap-2 items-center mt-1">
                  <span className="bg-yellow-300 border border-black px-1.5 py-0.5 rounded text-[8px] font-black uppercase">
                    ★ {rev.rating}
                  </span>
                  <span className="text-xs font-black uppercase text-gray-700">{rev.itemName}</span>
                </div>
                <p className="text-xs font-semibold text-gray-600 mt-2">"{rev.comment}"</p>
              </div>

              <div className="flex gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => updateReviewStatus(rev.id, rev.status === 'VISIBLE' ? 'HIDDEN' : 'VISIBLE')}
                  className={`px-2.5 py-1.5 font-black text-[9px] uppercase border-2 border-black rounded-lg cursor-pointer ${
                    rev.status === 'VISIBLE' ? 'bg-red-500 text-white' : 'bg-[#34C759] text-white'
                  }`}
                >
                  {rev.status === 'VISIBLE' ? 'HIDE BITE' : 'RESTORE BITE'}
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
