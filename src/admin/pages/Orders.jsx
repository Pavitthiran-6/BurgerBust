import React, { useCallback, useEffect, useState } from 'react';
import { adminService } from '../../services/adminService';

const NEXT = { PLACED: 'CONFIRMED', CONFIRMED: 'PREPARING', PREPARING: 'READY', READY: 'OUT_FOR_DELIVERY', OUT_FOR_DELIVERY: 'DELIVERED' };
const money = value => `$${Number(value || 0).toFixed(2)}`;

export default function Orders() {
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');
  const [data, setData] = useState({ content: [], totalElements: 0 });
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try { setData(await adminService.getOrders({ status, search, page: 0, size: 100 })); }
    catch (requestError) { setError(requestError.message); }
    finally { setLoading(false); }
  }, [status, search]);
  useEffect(() => { const timer = setTimeout(load, 250); return () => clearTimeout(timer); }, [load]);

  const transition = async (entry, nextStatus) => {
    setBusy(entry.order.id); setError('');
    try { await adminService.updateOrderStatus(entry.order.id, nextStatus, `Updated from admin order queue`); await load(); }
    catch (requestError) { setError(requestError.message); }
    finally { setBusy(''); }
  };

  return <div className="space-y-6 animate-fadeIn">
    <header className="bg-white border-4 border-black shadow-[6px_6px_0_#111] p-6 rounded-3xl flex flex-col lg:flex-row gap-4 justify-between lg:items-center"><div><h2 className="font-display-xl text-3xl font-black uppercase">Order Operations</h2><p className="text-xs font-bold text-gray-500 uppercase">{data.totalElements} matching orders</p></div><div className="flex flex-col sm:flex-row gap-3"><input value={search} onChange={event => setSearch(event.target.value)} placeholder="Order, customer, email" className="p-3 border-3 border-black rounded-xl text-xs font-bold"/><select value={status} onChange={event => setStatus(event.target.value)} className="p-3 border-3 border-black rounded-xl text-xs font-black bg-white"><option value="">All statuses</option>{['PLACED','CONFIRMED','PREPARING','READY','OUT_FOR_DELIVERY','DELIVERED','CANCELLED','REFUNDED'].map(value => <option key={value}>{value}</option>)}</select></div></header>
    {error && <div className="p-4 bg-red-100 border-3 border-red-700 rounded-xl font-bold text-red-800">{error}</div>}
    <div className="grid gap-4">{data.content.map(entry => { const order = entry.order; return <article key={order.id} className="bg-white border-3 border-black rounded-2xl p-5 shadow-[4px_4px_0_#111]"><div className="flex flex-col lg:flex-row gap-4 justify-between"><div><div className="flex flex-wrap gap-2 items-center"><h3 className="font-black">{order.orderNumber}</h3><span className="px-2 py-1 border border-black rounded bg-[#FFD23F] text-[9px] font-black">{order.status}</span><span className="text-[10px] font-black">{order.paymentMethod}</span></div><p className="text-xs text-gray-600 mt-1">{entry.customerName} · {entry.customerEmail}</p><p className="text-xs mt-2">{order.items.map(item => `${item.quantity}× ${item.name}`).join(', ')}</p></div><div className="lg:text-right"><p className="text-xl font-black">{money(order.total)}</p><p className="text-[10px] text-gray-500">{new Date(order.placedAt).toLocaleString()}</p><div className="flex lg:justify-end gap-2 mt-3">{NEXT[order.status] && <button disabled={busy === order.id} onClick={() => transition(entry, NEXT[order.status])} className="px-3 py-2 border-2 border-black rounded-lg bg-[#34C759] text-white font-black text-[9px]">{busy === order.id ? '…' : `MARK ${NEXT[order.status]}`}</button>}{['PLACED','CONFIRMED'].includes(order.status) && <button disabled={busy === order.id} onClick={() => transition(entry, 'CANCELLED')} className="px-3 py-2 border-2 border-black rounded-lg bg-red-600 text-white font-black text-[9px]">CANCEL</button>}</div></div></div></article>; })}{!loading && !data.content.length && <div className="bg-white border-4 border-black rounded-3xl p-8 text-center font-bold text-gray-400">No matching orders.</div>}</div>
    {loading && <p className="font-black">Loading orders…</p>}
  </div>;
}
