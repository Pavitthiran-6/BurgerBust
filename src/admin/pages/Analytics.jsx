import React, { useEffect, useMemo, useState } from 'react';
import { adminService } from '../../services/adminService';

const money = value => `$${Number(value || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const isoStart = days => new Date(Date.now() - days * 86400000).toISOString();

export default function Analytics() {
  const [range, setRange] = useState(30);
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [download, setDownload] = useState('');
  const params = useMemo(() => ({ from: isoStart(range), to: new Date().toISOString() }), [range]);

  useEffect(() => {
    let active = true;
    setLoading(true); setError('');
    adminService.getAnalytics(params).then(value => active && setData(value))
      .catch(requestError => active && setError(requestError.message))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [params]);

  const maxRevenue = Math.max(1, ...(data?.revenueSeries || []).map(point => Number(point.revenue)));
  const exportReport = async (type, format) => {
    setDownload(`${type}-${format}`); setError('');
    try { await adminService.downloadReport(type, format, params); }
    catch (requestError) { setError(requestError.message); }
    finally { setDownload(''); }
  };

  return (
    <div className="space-y-7 animate-fadeIn">
      <header className="bg-white border-4 border-black shadow-[6px_6px_0_#111] p-6 rounded-3xl flex flex-col lg:flex-row gap-4 justify-between lg:items-center">
        <div><h2 className="font-display-xl text-3xl font-black uppercase">Analytics & Reports</h2><p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Revenue, demand, growth, and conversion</p></div>
        <select value={range} onChange={event => setRange(Number(event.target.value))} className="border-3 border-black rounded-xl p-3 font-black text-xs bg-[#FFD23F]"><option value={7}>Last 7 days</option><option value={30}>Last 30 days</option><option value={90}>Last 90 days</option><option value={365}>Last year</option></select>
      </header>
      {error && <div className="p-4 bg-red-100 border-3 border-red-700 rounded-xl font-bold text-red-800">{error}</div>}
      {loading && <div className="p-8 bg-white border-4 border-black rounded-3xl font-black">Loading analytics…</div>}
      {data && <>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {[['Revenue', money(data.revenue)], ['Orders', data.orders], ['Average order', money(data.averageOrderValue)]].map(([label, value]) => <div key={label} className="bg-[#FFD23F] border-3 border-black rounded-2xl p-5 shadow-[4px_4px_0_#111]"><p className="text-[10px] uppercase font-black">{label}</p><p className="text-2xl font-black mt-1">{value}</p></div>)}
        </div>
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-7">
          <section className="xl:col-span-8 bg-white border-4 border-black p-6 rounded-3xl shadow-[6px_6px_0_#111]">
            <h3 className="font-black uppercase border-b-3 border-black pb-2">Recognized revenue</h3>
            <div className="h-72 flex items-end gap-2 overflow-x-auto pt-5">
              {data.revenueSeries.map(point => <div key={point.period} className="min-w-12 flex-1 h-full flex flex-col justify-end items-center gap-2" title={`${point.period}: ${money(point.revenue)}`}><span className="text-[8px] font-black">{money(point.revenue)}</span><div className="w-full border-2 border-black bg-[#00F0FF] rounded-t" style={{ height: `${Math.max(5, Number(point.revenue) / maxRevenue * 82)}%` }} /><span className="text-[8px] font-bold whitespace-nowrap">{point.period}</span></div>)}
              {!data.revenueSeries.length && <p className="m-auto text-sm text-gray-400 font-bold">No delivered revenue in this period.</p>}
            </div>
          </section>
          <section className="xl:col-span-4 bg-white border-4 border-black p-6 rounded-3xl shadow-[6px_6px_0_#111]">
            <h3 className="font-black uppercase border-b-3 border-black pb-2">Conversion funnel</h3>
            <div className="mt-4 space-y-3 text-xs font-bold">
              <Funnel label="Visitors" value={data.conversion.visitors} rate="100%" />
              <Funnel label="Product viewers" value={data.conversion.productViewers} />
              <Funnel label="Cart sessions" value={data.conversion.cartSessions} rate={`${data.conversion.viewToCartRate}%`} />
              <Funnel label="Checkout sessions" value={data.conversion.checkoutSessions} rate={`${data.conversion.cartToCheckoutRate}%`} />
              <Funnel label="Ordering sessions" value={data.conversion.orderingSessions} rate={`${data.conversion.checkoutToOrderRate}%`} />
            </div>
          </section>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-7">
          <MetricList title="Top products" values={data.topSellingProducts.map(item => `${item.name} · ${item.quantity} · ${money(item.revenue)}`)} />
          <MetricList title="Peak UTC hours" values={data.peakOrderHours.slice(0, 8).map(item => `${String(item.hour).padStart(2, '0')}:00 · ${item.orders} orders · ${money(item.revenue)}`)} />
          <MetricList title="Category performance" values={data.categoryPerformance.map(item => `${item.category} · ${item.quantity} · ${money(item.revenue)}`)} />
        </div>
      </>}
      <section className="bg-white border-4 border-black p-6 rounded-3xl shadow-[6px_6px_0_#111]">
        <h3 className="font-black uppercase">Exports</h3><p className="text-xs text-gray-500 font-bold mt-1">Download the selected period. Inventory is an as-of-now snapshot.</p>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 mt-4">{['SALES','PRODUCTS','CUSTOMERS','INVENTORY','PAYMENTS'].map(type => <div key={type} className="border-2 border-black rounded-xl p-3 bg-[#FFF8E7]"><p className="text-[10px] font-black mb-2">{type}</p><div className="flex gap-2"><ExportButton label="CSV" busy={download === `${type}-CSV`} onClick={() => exportReport(type, 'CSV')} /><ExportButton label="XLSX" busy={download === `${type}-XLSX`} onClick={() => exportReport(type, 'XLSX')} /></div></div>)}</div>
      </section>
    </div>
  );
}

function Funnel({ label, value, rate }) { return <div className="p-3 border-2 border-black rounded-xl bg-[#FFF8E7] flex justify-between"><span>{label}</span><span>{value}{rate ? ` · ${rate}` : ''}</span></div>; }
function MetricList({ title, values }) { return <section className="bg-white border-4 border-black p-5 rounded-3xl shadow-[5px_5px_0_#111]"><h3 className="font-black uppercase border-b-3 border-black pb-2">{title}</h3><ul className="mt-3 space-y-2">{values.map(value => <li key={value} className="text-xs font-bold">{value}</li>)}</ul>{!values.length && <p className="text-xs text-gray-400 mt-3">No data.</p>}</section>; }
function ExportButton({ label, busy, onClick }) { return <button disabled={busy} onClick={onClick} className="flex-1 px-2 py-2 border-2 border-black rounded-lg bg-[#FFD23F] font-black text-[9px] disabled:opacity-50">{busy ? '…' : label}</button>; }
