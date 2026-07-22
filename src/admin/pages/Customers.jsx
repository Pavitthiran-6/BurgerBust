import React, { useCallback, useEffect, useState } from 'react';
import { adminService } from '../../services/adminService';

const money = value => `$${Number(value || 0).toFixed(2)}`;

export default function Customers() {
  const [query, setQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('');
  const [page, setPage] = useState(0);
  const [data, setData] = useState({ content: [], totalElements: 0, totalPages: 0 });
  const [selected, setSelected] = useState(null);
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState('');

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try { setData(await adminService.getCustomers({ search: query, active: activeFilter, page, size: 25 })); }
    catch (requestError) { setError(requestError.message); }
    finally { setLoading(false); }
  }, [query, activeFilter, page]);

  useEffect(() => { const timer = setTimeout(load, 250); return () => clearTimeout(timer); }, [load]);

  const toggle = async customer => {
    setBusy(customer.id); setError('');
    try { await adminService.setCustomerStatus(customer.id, !customer.active, customer.active ? 'Suspended by administrator' : 'Reactivated by administrator'); await load(); }
    catch (requestError) { setError(requestError.message); }
    finally { setBusy(''); }
  };

  const showOrders = async customer => {
    setSelected(customer); setOrders([]); setError('');
    try { setOrders((await adminService.getCustomerOrders(customer.id, { page: 0, size: 50 })).content || []); }
    catch (requestError) { setError(requestError.message); }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <header className="bg-white border-4 border-black shadow-[6px_6px_0_#111] p-6 rounded-3xl flex flex-col lg:flex-row gap-4 justify-between lg:items-center">
        <div><h2 className="font-display-xl text-3xl font-black uppercase">Customer Management</h2><p className="text-xs font-bold text-gray-500 uppercase tracking-widest">{data.totalElements} PostgreSQL customer accounts</p></div>
        <div className="flex flex-col sm:flex-row gap-3"><input value={query} onChange={event => { setQuery(event.target.value); setPage(0); }} placeholder="Search name or email" className="p-3 border-3 border-black rounded-xl font-bold text-xs" /><select value={activeFilter} onChange={event => { setActiveFilter(event.target.value); setPage(0); }} className="p-3 border-3 border-black rounded-xl font-black text-xs bg-white"><option value="">All statuses</option><option value="true">Active</option><option value="false">Suspended</option></select></div>
      </header>
      {error && <div className="p-4 bg-red-100 border-3 border-red-700 rounded-xl font-bold text-red-800">{error}</div>}
      <div className="bg-white border-4 border-black shadow-[6px_6px_0_#111] rounded-3xl overflow-hidden">
        <div className="overflow-x-auto"><table className="w-full text-left text-xs"><thead><tr className="bg-[#FFF8E7] border-b-4 border-black uppercase text-[10px]"><th className="p-4">Customer</th><th className="p-4">Orders</th><th className="p-4">Spend</th><th className="p-4">Rewards</th><th className="p-4">Coupons</th><th className="p-4">Status</th><th className="p-4">Actions</th></tr></thead><tbody className="divide-y-2 divide-gray-100">
          {data.content.map(customer => <tr key={customer.id} className="hover:bg-yellow-50"><td className="p-4"><p className="font-black">{customer.name}</p><p className="text-gray-500">{customer.email}</p></td><td className="p-4 font-black">{customer.ordersCount}</td><td className="p-4 font-black">{money(customer.totalSpent)}</td><td className="p-4">{customer.rewardPoints}</td><td className="p-4">{customer.couponsUsed}</td><td className="p-4"><span className={`px-2 py-1 border border-black rounded font-black text-[9px] ${customer.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{customer.active ? 'ACTIVE' : 'SUSPENDED'}</span></td><td className="p-4"><div className="flex gap-2"><button onClick={() => showOrders(customer)} className="px-2 py-1.5 border-2 border-black rounded-lg bg-[#00F0FF] font-black text-[9px]">ORDERS</button><button disabled={busy === customer.id} onClick={() => toggle(customer)} className={`px-2 py-1.5 border-2 border-black rounded-lg font-black text-[9px] text-white ${customer.active ? 'bg-red-600' : 'bg-green-600'}`}>{busy === customer.id ? '…' : customer.active ? 'SUSPEND' : 'ACTIVATE'}</button></div></td></tr>)}
          {!loading && !data.content.length && <tr><td colSpan="7" className="p-8 text-center font-bold text-gray-400">No matching customers.</td></tr>}
        </tbody></table></div>
        {loading && <p className="p-5 font-black">Loading customers…</p>}
        <div className="p-4 border-t-3 border-black flex justify-between items-center"><button disabled={page === 0} onClick={() => setPage(value => value - 1)} className="px-3 py-2 border-2 border-black rounded-lg font-black text-xs disabled:opacity-30">Previous</button><span className="text-xs font-black">Page {page + 1} / {Math.max(1, data.totalPages)}</span><button disabled={page >= data.totalPages - 1} onClick={() => setPage(value => value + 1)} className="px-3 py-2 border-2 border-black rounded-lg font-black text-xs disabled:opacity-30">Next</button></div>
      </div>
      {selected && <section className="bg-white border-4 border-black shadow-[6px_6px_0_#111] rounded-3xl p-6"><div className="flex justify-between"><h3 className="font-black uppercase">{selected.name} · order history</h3><button onClick={() => setSelected(null)} className="font-black">×</button></div><div className="mt-4 grid gap-3 md:grid-cols-2">{orders.map(entry => <div key={entry.order.id} className="p-3 bg-[#FFF8E7] border-2 border-black rounded-xl"><div className="flex justify-between"><b>{entry.order.orderNumber}</b><b>{entry.order.status}</b></div><p className="text-xs mt-1">{money(entry.order.total)} · {new Date(entry.order.createdAt).toLocaleString()}</p></div>)}{!orders.length && <p className="text-xs text-gray-400">No orders.</p>}</div></section>}
    </div>
  );
}
