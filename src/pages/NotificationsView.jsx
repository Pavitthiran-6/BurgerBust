import React, { useState } from 'react';

const CATEGORY_ICONS = {
  DELIVERY: '',
  OFFERS: '️',
  REWARDS: '',
  PAYMENTS: '',
  SYSTEM: '',
};

function groupByDate(list) {
  const today = new Date().toDateString();
  const yesterday = new Date(Date.now() - 86400000).toDateString();
  const groups = { 'TODAY': [], 'YESTERDAY': [], 'OLDER': [] };

  list.forEach(n => {
    const d = n.date ? new Date(n.date).toDateString() : null;
    if (!d || d === today) groups.TODAY.push(n);
    else if (d === yesterday) groups.YESTERDAY.push(n);
    else groups.OLDER.push(n);
  });

  return groups;
}

export default function NotificationsView({
  notifications = [],
  setNotifications,
  onMarkRead,
  onMarkAllRead,
  onDeleteNotif
}) {
  const [filter, setFilter] = useState('ALL');
  const [prefs, setPrefs] = useState({ DELIVERY: true, OFFERS: true, REWARDS: true, PAYMENTS: true, SYSTEM: true });
  const [showPrefs, setShowPrefs] = useState(false);

  const list = notifications;

  // Apply category preferences + filter
  const filtered = list.filter(n => {
    if (!prefs[n.category]) return false;
    if (filter === 'ALL') return true;
    return n.category === filter;
  });

  // Pinned first, then rest
  const pinned = filtered.filter(n => n.pinned);
  const unpinned = filtered.filter(n => !n.pinned);
  const grouped = groupByDate(unpinned);

  const handleArchive = (id) => {
    if (setNotifications) setNotifications(prev => prev.map(n => n.id === id ? { ...n, archived: true } : n));
  };

  const renderCard = (n) => (
    <div
      key={n.id}
      onClick={() => onMarkRead && onMarkRead(n.id)}
      className={`border-3 border-[#1a1c1c] p-4 rounded-2xl shadow-[3px_3px_0px_0px_#111111] flex items-start justify-between gap-4 cursor-pointer transition-all ${
        n.pinned ? 'bg-[#FFF0A0] border-l-8 border-l-[#FFD23F]' :
        n.read ? 'bg-[#fcfbf7] opacity-80' : 'bg-[#FFF8E7] border-l-8 border-l-[#FF0055]'
      }`}
    >
      <div className="flex items-start gap-4">
        <div className={`w-10 h-10 border-2 border-[#1a1c1c] rounded-xl flex items-center justify-center font-black text-lg shrink-0 ${n.pinned ? 'bg-[#FFD23F]' : 'bg-[#00F0FF]'}`}>
          {CATEGORY_ICONS[n.category] || '️'}
        </div>
        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="bg-[#FF0055] text-white border border-[#1a1c1c] px-2 py-0.5 rounded text-[10px] font-black uppercase">{n.category}</span>
            {n.pinned && <span className="bg-[#FFD23F] text-[#1a1c1c] text-[9px] font-black px-1.5 py-0.5 rounded border border-black"> PINNED</span>}
            {!n.read && <span className="bg-cyan-400 text-black px-1.5 py-0.5 rounded text-[9px] font-black uppercase">NEW</span>}
            <span className="text-[10px] font-bold text-gray-500">{n.time}</span>
          </div>
          <h4 className="font-black text-sm uppercase text-[#1a1c1c]">{n.title}</h4>
          <p className="text-xs font-bold text-gray-700 mt-1">{n.desc}</p>
        </div>
      </div>

      <div className="flex flex-col gap-1 shrink-0">
        {onDeleteNotif && (
          <button type="button" onClick={(e) => { e.stopPropagation(); onDeleteNotif(n.id); }}
            className="text-gray-400 hover:text-red-600 font-black text-sm p-1 cursor-pointer" title="Delete"></button>
        )}
        <button type="button" onClick={(e) => { e.stopPropagation(); handleArchive(n.id); }}
          className="text-gray-400 hover:text-blue-600 font-black text-[10px] cursor-pointer" title="Archive"></button>
      </div>
    </div>
  );

  return (
    <div className="w-full py-8 flex flex-col items-center relative z-10 text-[#1a1c1c] max-w-4xl mx-auto px-4">
      {/* Header */}
      <div className="w-full bg-[#FF0055] text-white border-4 border-[#1a1c1c] shadow-[8px_8px_0px_0px_#111111] rounded-3xl p-6 md:p-8 text-center mb-8 flex flex-col items-center gap-3">
        <span className="bg-[#00F0FF] text-[#1a1c1c] border-2 border-[#1a1c1c] px-3 py-0.5 rounded-full text-xs font-black uppercase inline-block">
          CLASSIFIED DISPATCH MAILBOX
        </span>
        <h1 className="font-display-xl text-3xl md:text-5xl font-black uppercase">TITANS HERO MAILBOX</h1>
        <p className="text-xs font-bold text-yellow-200">SEALED MISSION ENVELOPES & SYSTEM ANNOUNCEMENTS!</p>
        <div className="flex gap-2 flex-wrap justify-center">
          {onMarkAllRead && (
            <button type="button" onClick={onMarkAllRead}
              className="px-4 py-2 bg-[#FFD23F] text-[#1a1c1c] border-2 border-[#1a1c1c] font-black text-xs uppercase rounded-xl cursor-pointer shadow-[2px_2px_0px_0px_#111111]">
              MARK ALL READ ️
            </button>
          )}
          <button type="button" onClick={() => setShowPrefs(!showPrefs)}
            className="px-4 py-2 bg-white text-[#1a1c1c] border-2 border-[#1a1c1c] font-black text-xs uppercase rounded-xl cursor-pointer shadow-[2px_2px_0px_0px_#111111]">
             PREFERENCES
          </button>
        </div>
      </div>

      {/* Preferences Panel */}
      {showPrefs && (
        <div className="w-full bg-white border-4 border-[#1a1c1c] shadow-[4px_4px_0px_0px_#111111] rounded-2xl p-5 mb-6 animate-fadeIn">
          <h4 className="font-black text-sm uppercase mb-3">NOTIFICATION PREFERENCES</h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {Object.keys(prefs).map(cat => (
              <label key={cat} className="flex items-center justify-between p-3 border-2 border-[#1a1c1c] rounded-xl bg-[#fcfbf7] font-bold text-xs cursor-pointer">
                <span>{CATEGORY_ICONS[cat]} {cat}</span>
                <input type="checkbox" checked={prefs[cat]} onChange={() => setPrefs(prev => ({ ...prev, [cat]: !prev[cat] }))} className="w-4 h-4 accent-[#FF0055]" />
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-3 mb-6 no-scrollbar w-full">
        {['ALL', 'DELIVERY', 'OFFERS', 'REWARDS', 'PAYMENTS', 'SYSTEM'].map((cat) => (
          <button key={cat} type="button" onClick={() => setFilter(cat)}
            className={`px-4 py-2 border-2 border-[#1a1c1c] font-black text-xs uppercase rounded-xl shrink-0 cursor-pointer ${filter === cat ? 'bg-[#FFD23F] text-[#1a1c1c]' : 'bg-white text-gray-700'}`}>
            {CATEGORY_ICONS[cat] || ''} {cat}
          </button>
        ))}
      </div>

      {/* Notification Groups */}
      <div className="w-full space-y-6">
        {/* Pinned */}
        {pinned.length > 0 && (
          <div>
            <h4 className="font-black text-xs uppercase text-gray-500 mb-3 flex items-center gap-2"> PINNED MISSIONS</h4>
            <div className="space-y-3">{pinned.map(renderCard)}</div>
          </div>
        )}

        {/* Grouped by date */}
        {Object.entries(grouped).map(([group, items]) => items.length > 0 && (
          <div key={group}>
            <h4 className="font-black text-xs uppercase text-gray-500 mb-3 flex items-center gap-2">
              {group === 'TODAY' ? ' TODAY' : group === 'YESTERDAY' ? '⏰ YESTERDAY' : '️ OLDER'}
            </h4>
            <div className="space-y-3">{items.map(renderCard)}</div>
          </div>
        ))}

        {/* Empty state */}
        {pinned.length === 0 && Object.values(grouped).every(g => g.length === 0) && (
          <div className="bg-white border-4 border-[#1a1c1c] shadow-[8px_8px_0px_0px_#111111] p-10 text-center rounded-3xl">
            <div className="text-4xl mb-3">️</div>
            <h3 className="font-black text-lg uppercase">MAILBOX EMPTY!</h3>
            <p className="text-xs font-bold text-gray-600 mt-1">No notifications in this category. Place an order to start receiving updates!</p>
          </div>
        )}
      </div>
    </div>
  );
}
