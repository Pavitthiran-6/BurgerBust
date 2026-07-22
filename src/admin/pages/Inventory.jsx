import React, { useEffect, useState } from 'react';
import { adminService } from '../../services/adminService';

export default function Inventory() {
  const [inventory, setInventory] = useState([]);
  const [adjustments, setAdjustments] = useState({});
  const [reasons, setReasons] = useState({});
  const [history, setHistory] = useState([]);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState(null);

  const load = async () => {
    try { setInventory(await adminService.getInventory()); }
    catch (requestError) { setError(requestError.message); }
  };
  useEffect(() => { load(); }, []);

  const adjust = async item => {
    const amount = Number(adjustments[item.productUuid]);
    const reason = (reasons[item.productUuid] || '').trim();
    if (!Number.isInteger(amount) || amount === 0 || !reason) { setError('Enter a non-zero whole-number adjustment and a reason.'); return; }
    setBusyId(item.productUuid); setError('');
    try {
      const updated = await adminService.adjustInventory(item.productUuid, amount, reason);
      setHistory(current => [{ id: `${item.productUuid}-${Date.now()}`, productName: item.productName, amount, reason, at: new Date() }, ...current].slice(0, 20));
      setInventory(current => current.map(value => value.productUuid === item.productUuid ? updated : value));
      setAdjustments(current => ({ ...current, [item.productUuid]: '' }));
      setReasons(current => ({ ...current, [item.productUuid]: '' }));
    } catch (requestError) { setError(requestError.message); }
    finally { setBusyId(null); }
  };

  return <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 animate-fadeIn">
    <section className="xl:col-span-9 bg-white border-4 border-black p-6 rounded-3xl shadow-[6px_6px_0_#111]">
      <h2 className="font-display-xl text-xl font-black uppercase border-b-4 border-black pb-2">Product inventory</h2>
      {error && <p className="mt-4 p-3 bg-red-100 border-2 border-red-700 rounded-xl text-xs font-bold text-red-800">{error}</p>}
      <div className="overflow-x-auto mt-5"><table className="w-full min-w-[850px] text-left text-xs"><thead><tr className="bg-[#FFF8E7] border-b-4 border-black text-[10px] font-black uppercase"><th className="p-3">Product</th><th className="p-3 text-center">Stock</th><th className="p-3 text-center">Status</th><th className="p-3">Adjustment</th><th className="p-3">Reason</th><th className="p-3">Action</th></tr></thead><tbody className="divide-y-2 divide-gray-100">
        {inventory.map(item => <tr key={item.productUuid}><td className="p-3"><b className="block uppercase">{item.productName}</b><span className="text-[9px] text-gray-500">{item.categoryName} · threshold {item.lowStockThreshold}</span></td><td className="p-3 text-center text-lg font-black">{item.stockQuantity}</td><td className="p-3 text-center"><Status item={item}/></td><td className="p-3"><input type="number" step="1" placeholder="+10 or -3" value={adjustments[item.productUuid] || ''} onChange={event => setAdjustments(current => ({ ...current, [item.productUuid]: event.target.value }))} className="w-24 p-2 border-2 border-black rounded-lg font-black"/></td><td className="p-3"><input maxLength="250" placeholder="Stock count correction" value={reasons[item.productUuid] || ''} onChange={event => setReasons(current => ({ ...current, [item.productUuid]: event.target.value }))} className="w-full min-w-48 p-2 border-2 border-black rounded-lg font-bold"/></td><td className="p-3"><button disabled={busyId === item.productUuid} onClick={() => adjust(item)} className="px-3 py-2 bg-[#34C759] text-white border-2 border-black rounded-lg font-black text-[9px] uppercase disabled:opacity-50">Apply</button></td></tr>)}
      </tbody></table>{!inventory.length && <p className="p-5 text-gray-500">No inventory records.</p>}</div>
    </section>
    <aside className="xl:col-span-3 bg-white border-4 border-black p-6 rounded-3xl shadow-[6px_6px_0_#111] h-max"><h2 className="font-display-xl text-xl font-black uppercase border-b-4 border-black pb-2">This session</h2><div className="space-y-3 mt-4">{history.map(item => <article key={item.id} className="bg-[#FFF8E7] border-2 border-black p-3 rounded-xl"><div className="flex justify-between gap-2"><b className="text-[10px] uppercase">{item.productName}</b><span className={`text-[10px] font-black ${item.amount > 0 ? 'text-green-700' : 'text-red-700'}`}>{item.amount > 0 ? '+' : ''}{item.amount}</span></div><p className="text-[9px] text-gray-600 mt-1">{item.reason}</p><time className="text-[8px] text-gray-400">{item.at.toLocaleTimeString()}</time></article>)}{!history.length && <p className="text-xs text-gray-500">Adjustments made here will appear in the database audit history.</p>}</div></aside>
  </div>;
}

function Status({ item }) {
  const label = item.outOfStock ? 'Out of stock' : item.lowStock ? 'Low stock' : 'In stock';
  const color = item.outOfStock ? 'bg-red-600 text-white' : item.lowStock ? 'bg-orange-400' : 'bg-green-500 text-white';
  return <span className={`${color} px-2 py-1 border border-black rounded text-[9px] font-black uppercase`}>{label}</span>;
}
