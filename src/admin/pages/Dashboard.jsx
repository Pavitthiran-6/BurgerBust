import React, { useEffect, useMemo, useState } from 'react';
import { adminService } from '../../services/adminService';

const money = value => `$${Number(value || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export default function Dashboard({ setActivePage }) {
  const [dashboard, setDashboard] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      setDashboard(await adminService.getDashboard());
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);
  const maxRevenue = useMemo(() => Math.max(1, ...(dashboard?.dailySales || []).map(point => Number(point.revenue))), [dashboard]);

  if (loading) return <Panel>Loading live operations data…</Panel>;
  if (error) return <Panel><p className="text-red-700 font-black">{error}</p><button onClick={load} className="comic-button mt-4">Retry</button></Panel>;

  const cards = [
    ['Today Revenue', money(dashboard.revenue.today), 'payments', '#FFD23F'],
    ['Today Orders', dashboard.orders.today, 'receipt_long', '#00F0FF'],
    ['Pending Orders', dashboard.orders.pending, 'pending_actions', '#FF8A00'],
    ['Active Customers', dashboard.activeCustomers, 'group', '#34C759'],
    ['Month Revenue', money(dashboard.revenue.thisMonth), 'calendar_month', '#FF7AB6'],
    ['Average Order', money(dashboard.revenue.averageOrderValue), 'monitoring', '#B8A1FF'],
  ];

  return (
    <div className="space-y-7 animate-fadeIn">
      <div className="bg-white border-4 border-black rounded-3xl p-6 shadow-[6px_6px_0_#111] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div><h2 className="font-display-xl text-3xl font-black uppercase">Production Dashboard</h2><p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Live PostgreSQL commerce metrics</p></div>
        <button onClick={load} className="px-4 py-2 border-2 border-black rounded-xl bg-[#FFD23F] font-black text-xs uppercase">Refresh</button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
        {cards.map(([label, value, icon, color]) => (
          <div key={label} className="border-3 border-black rounded-2xl p-5 shadow-[4px_4px_0_#111]" style={{ backgroundColor: color }}>
            <span className="material-symbols-outlined text-3xl">{icon}</span><p className="text-[10px] font-black uppercase mt-2">{label}</p><p className="text-2xl font-black mt-1">{value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-7">
        <section className="xl:col-span-7 bg-white border-4 border-black rounded-3xl p-6 shadow-[6px_6px_0_#111]">
          <h3 className="font-black uppercase border-b-3 border-black pb-2">Recognized revenue · last 14 days</h3>
          <div className="h-64 flex items-end gap-2 mt-6 overflow-x-auto pb-2">
            {(dashboard.dailySales || []).map(point => (
              <div key={point.period} className="min-w-11 flex-1 flex flex-col justify-end items-center h-full gap-2" title={`${point.period}: ${money(point.revenue)}`}>
                <span className="text-[9px] font-black">{money(point.revenue)}</span>
                <div className="w-full bg-[#FFD23F] border-2 border-black rounded-t-md" style={{ height: `${Math.max(6, Number(point.revenue) / maxRevenue * 82)}%` }} />
                <span className="text-[8px] font-bold rotate-[-35deg] origin-top-left whitespace-nowrap">{point.period.slice(5)}</span>
              </div>
            ))}
            {!dashboard.dailySales?.length && <p className="m-auto text-sm font-bold text-gray-400">No delivered sales yet.</p>}
          </div>
        </section>
        <section className="xl:col-span-5 bg-white border-4 border-black rounded-3xl p-6 shadow-[6px_6px_0_#111]">
          <div className="flex justify-between"><h3 className="font-black uppercase">Pending queue</h3><button onClick={() => setActivePage?.('orders')} className="text-[10px] font-black text-[#FF0055] uppercase">View all</button></div>
          <div className="space-y-3 mt-4 max-h-64 overflow-y-auto">
            {dashboard.pendingOrders.map(order => <div key={order.orderId} className="p-3 border-2 border-black rounded-xl bg-[#FFF8E7]"><div className="flex justify-between gap-2"><span className="font-black text-xs">{order.orderNumber}</span><span className="text-[9px] font-black text-orange-700">{order.status}</span></div><p className="text-[10px] text-gray-600 mt-1">{order.customerName} · {money(order.total)}</p></div>)}
            {!dashboard.pendingOrders.length && <p className="text-xs font-bold text-gray-400">Queue is clear.</p>}
          </div>
        </section>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-7">
        <ListCard title="Best sellers" items={dashboard.bestSellingProducts.map(item => `${item.name} · ${item.quantity} sold · ${money(item.revenue)}`)} empty="No delivered product sales." />
        <ListCard title="Low stock" items={dashboard.lowStockProducts.map(item => `${item.name} · ${item.stock}/${item.threshold}${item.outOfStock ? ' · OUT' : ''}`)} empty="No low-stock products." />
        <ListCard title="Quality & loyalty" items={[
          `${dashboard.reviews.totalReviews} reviews · ${dashboard.reviews.averageRating} average`,
          `${dashboard.coupons.redemptions} coupon uses · ${money(dashboard.coupons.totalDiscount)} granted`,
          `${dashboard.rewards.outstanding} reward points outstanding`,
          `${dashboard.rewards.redeemed} reward points redeemed`,
        ]} />
      </div>
    </div>
  );
}

function Panel({ children }) {
  return <div className="bg-white border-4 border-black rounded-3xl p-8 shadow-[6px_6px_0_#111] font-bold">{children}</div>;
}

function ListCard({ title, items, empty }) {
  return <section className="bg-white border-4 border-black rounded-3xl p-5 shadow-[5px_5px_0_#111]"><h3 className="font-black uppercase border-b-3 border-black pb-2">{title}</h3><ul className="mt-3 space-y-2">{items.map(item => <li key={item} className="text-xs font-bold p-2 rounded-lg bg-[#FFF8E7] border border-black">{item}</li>)}</ul>{!items.length && <p className="text-xs text-gray-400 mt-3">{empty}</p>}</section>;
}
