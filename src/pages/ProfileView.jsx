import React, { useEffect, useState } from 'react';

const TABS = [
  { key: 'PROFILE', label: 'PROFILE', icon: 'person' },
  { key: 'ORDERS', label: 'ORDERS', icon: 'local_shipping' },
  { key: 'ADDRESSES', label: 'ADDRESSES', icon: 'map' },
];

const money = order => new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: order.currency || 'INR',
  minimumFractionDigits: 2,
}).format(Number(order.total || 0));

export default function ProfileView({
  profile = {},
  completionPercentage = 80,
  orders = [],
  addresses = [],
  rewardPoints = 0,
  onLogout,
  setCurrentPage,
  initialTab = 'PROFILE',
}) {
  const [activeTab, setActiveTab] = useState(initialTab);

  useEffect(() => setActiveTab(initialTab), [initialTab]);

  return (
    <div className="w-full py-8 flex flex-col items-center relative z-10 text-[#1a1c1c] max-w-5xl mx-auto px-4">
      <header className="w-full bg-[#70D6FF] border-4 border-[#1a1c1c] shadow-[8px_8px_0px_0px_#111111] rounded-3xl p-6 md:p-8 mb-8 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-5">
          <div className="w-20 h-20 bg-[#FFD23F] border-4 border-[#1a1c1c] shadow-[4px_4px_0px_0px_#111111] rounded-2xl flex items-center justify-center font-black text-3xl rotate-[-5deg]">
            {(profile.name || 'H').slice(0, 2).toUpperCase()}
          </div>
          <div>
            <span className="bg-[#FF70A6] text-white border-2 border-[#1a1c1c] px-3 py-0.5 rounded-full text-xs font-black uppercase inline-block mb-1">BURGERBURST HERO</span>
            <h1 className="font-display-xl text-3xl md:text-5xl uppercase font-black">{profile.name || 'Hungry Hero'}</h1>
            <p className="text-xs font-black uppercase text-gray-800">Account, orders and delivery addresses</p>
          </div>
        </div>
        <div className="bg-white border-3 border-[#1a1c1c] p-4 rounded-2xl w-full md:w-64 shadow-[4px_4px_0px_0px_#111111]">
          <div className="flex justify-between text-xs font-black mb-2"><span>PROFILE READY</span><span>{completionPercentage}%</span></div>
          <div className="h-4 bg-gray-200 border-2 border-[#1a1c1c] rounded-full overflow-hidden">
            <div className="h-full bg-[#FF70A6]" style={{ width: `${completionPercentage}%` }} />
          </div>
        </div>
      </header>

      <nav className="w-full flex flex-wrap gap-3 mb-6" aria-label="Profile sections">
        {TABS.map(tab => (
          <button key={tab.key} type="button" onClick={() => setActiveTab(tab.key)} className={`px-5 py-3 rounded-2xl font-black text-xs uppercase border-3 border-[#1a1c1c] shadow-[3px_3px_0px_0px_#111111] flex items-center gap-2 cursor-pointer ${activeTab === tab.key ? 'bg-[#FFD23F]' : 'bg-white'}`}>
            <span className="material-symbols-outlined text-base">{tab.icon}</span>{tab.label}
          </button>
        ))}
      </nav>

      <section className="w-full bg-white border-4 border-[#1a1c1c] shadow-[8px_8px_0px_0px_#111111] rounded-3xl p-6 md:p-8">
        {activeTab === 'PROFILE' && (
          <div className="space-y-6">
            <h2 className="font-headline-md text-2xl font-black uppercase">ACCOUNT DETAILS</h2>
            <dl className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Detail label="Name" value={profile.name || 'Not added'} />
              <Detail label="Email" value={profile.email || 'Not added'} />
              <Detail label="Phone" value={profile.phone || 'Add it with your delivery address'} />
              <Detail label="Orders" value={`${orders.length} placed`} />
              <Detail label="Saved addresses" value={`${addresses.length} saved`} />
              <Detail label="Reward points" value={`${rewardPoints} points`} />
            </dl>
            <div className="flex flex-wrap gap-3 pt-2">
              <button type="button" onClick={() => setActiveTab('ORDERS')} className="px-5 py-3 bg-[#00F0FF] border-3 border-[#1a1c1c] rounded-xl font-black text-xs uppercase cursor-pointer">VIEW ORDERS</button>
              <button type="button" onClick={() => setActiveTab('ADDRESSES')} className="px-5 py-3 bg-[#FFD23F] border-3 border-[#1a1c1c] rounded-xl font-black text-xs uppercase cursor-pointer">VIEW ADDRESSES</button>
              <button type="button" onClick={() => setCurrentPage('checkout')} className="px-5 py-3 bg-[#34C759] text-white border-3 border-[#1a1c1c] rounded-xl font-black text-xs uppercase cursor-pointer">GO TO CHECKOUT</button>
            </div>
          </div>
        )}

        {activeTab === 'ORDERS' && (
          <div className="space-y-4">
            <h2 className="font-headline-md text-2xl font-black uppercase">YOUR ORDERS ({orders.length})</h2>
            {orders.length === 0 ? (
              <EmptyState text="No orders yet. Your completed checkout will appear here." />
            ) : orders.map(order => (
              <article key={order.id} className="border-3 border-[#1a1c1c] p-4 rounded-2xl bg-[#FFF8E7] flex flex-col sm:flex-row justify-between sm:items-center gap-3 shadow-[3px_3px_0px_0px_#111111]">
                <div>
                  <span className="bg-[#FF0055] text-white border border-[#1a1c1c] px-2 py-0.5 rounded text-[10px] font-black uppercase">{order.orderNumber}</span>
                  <h3 className="font-black text-sm uppercase mt-2">{order.items?.map(item => item.name).join(', ') || 'BurgerBurst order'}</h3>
                  <p className="text-xs font-bold text-gray-600">{money(order)} · {order.status}</p>
                </div>
                <button type="button" onClick={() => setCurrentPage('tracker')} className="px-4 py-2 bg-[#00F0FF] border-2 border-[#1a1c1c] font-black text-xs uppercase rounded-xl cursor-pointer">TRACK ORDER</button>
              </article>
            ))}
          </div>
        )}

        {activeTab === 'ADDRESSES' && (
          <div className="space-y-4">
            <div className="flex flex-wrap justify-between items-center gap-3">
              <h2 className="font-headline-md text-2xl font-black uppercase">DELIVERY ADDRESSES ({addresses.length})</h2>
              <button type="button" onClick={() => setCurrentPage('address')} className="px-4 py-2 bg-[#FFD23F] border-2 border-[#1a1c1c] font-black text-xs uppercase rounded-xl cursor-pointer">MANAGE ADDRESSES</button>
            </div>
            {addresses.length === 0 ? (
              <EmptyState text="No saved address. You can add one directly during checkout." />
            ) : addresses.map(address => (
              <article key={address.id} className="border-2 border-[#1a1c1c] p-4 rounded-xl bg-[#fcfbf7] flex justify-between items-start gap-3">
                <div><h3 className="font-black text-sm uppercase">{address.title}</h3><p className="text-xs font-bold text-gray-600">{address.address}, {address.city}, {address.state} {address.postalCode || address.pincode}</p></div>
                {address.default && <span className="bg-[#34C759] text-white text-[9px] font-black px-2 py-1 rounded border border-black">DEFAULT</span>}
              </article>
            ))}
          </div>
        )}

        <div className="pt-6 border-t-3 border-dashed border-[#1a1c1c] mt-8 flex justify-end">
          <button type="button" onClick={onLogout} className="px-6 py-2.5 bg-red-500 text-white border-3 border-[#1a1c1c] shadow-[3px_3px_0px_0px_#111111] font-black text-xs uppercase rounded-xl cursor-pointer">LOG OUT</button>
        </div>
      </section>
    </div>
  );
}

function Detail({ label, value }) {
  return <div className="bg-[#FFF8E7] border-2 border-[#1a1c1c] rounded-xl p-4"><dt className="text-[10px] font-black uppercase text-gray-500">{label}</dt><dd className="mt-1 text-sm font-black break-words">{value}</dd></div>;
}

function EmptyState({ text }) {
  return <div className="p-8 text-center bg-gray-50 border-2 border-dashed border-[#1a1c1c] rounded-2xl text-xs font-bold text-gray-600">{text}</div>;
}
