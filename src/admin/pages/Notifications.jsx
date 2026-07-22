import React, { useEffect, useState } from 'react';
import { adminService } from '../../services/adminService';

export default function Notifications() {
  const [broadcasts, setBroadcasts] = useState([]);
  const [category, setCategory] = useState('ANNOUNCEMENT');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState('');

  const load = async () => {
    try {
      const page = await adminService.getBroadcasts({ page: 0, size: 50 });
      setBroadcasts(page.content || []);
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  useEffect(() => { load(); }, []);

  const submit = async event => {
    event.preventDefault();
    setBusy(true);
    setError('');
    setResult('');
    try {
      const broadcast = await adminService.broadcast({ category, title: title.trim(), message: message.trim() });
      setResult(`Delivered to ${broadcast.recipientCount} active customers.`);
      setTitle('');
      setMessage('');
      await load();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  };

  return <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fadeIn">
    <section className="lg:col-span-5 bg-white border-4 border-black p-6 rounded-3xl shadow-[6px_6px_0_#111] h-max">
      <h2 className="font-display-xl text-xl font-black uppercase border-b-4 border-black pb-2">Broadcast alert</h2>
      {error && <p className="mt-4 p-3 bg-red-100 border-2 border-red-700 rounded-xl text-xs font-bold text-red-800">{error}</p>}
      {result && <p className="mt-4 p-3 bg-green-100 border-2 border-green-700 rounded-xl text-xs font-bold text-green-800">{result}</p>}
      <form onSubmit={submit} className="space-y-4 mt-5 text-xs">
        <Field label="Category"><select value={category} onChange={event => setCategory(event.target.value)} className="w-full p-3 border-2 border-black rounded-xl font-bold bg-white"><option value="ANNOUNCEMENT">Announcement</option><option value="OFFERS">Special offer</option><option value="MAINTENANCE">Maintenance</option></select></Field>
        <Field label="Title"><input required maxLength="160" value={title} onChange={event => setTitle(event.target.value)} className="w-full p-3 border-2 border-black rounded-xl font-bold" /></Field>
        <Field label="Message"><textarea required maxLength="2000" value={message} onChange={event => setMessage(event.target.value)} className="w-full p-3 border-2 border-black rounded-xl font-bold h-28 resize-y" /></Field>
        <button disabled={busy} className="w-full py-3.5 bg-[#FFD23F] border-3 border-black font-black uppercase rounded-xl shadow-[2px_2px_0_#111] disabled:opacity-60">{busy ? 'Sending...' : 'Dispatch broadcast'}</button>
      </form>
    </section>
    <section className="lg:col-span-7 bg-white border-4 border-black p-6 rounded-3xl shadow-[6px_6px_0_#111]">
      <h2 className="font-display-xl text-xl font-black uppercase border-b-4 border-black pb-2">Broadcast history</h2>
      <div className="space-y-3 mt-5 max-h-[650px] overflow-y-auto">
        {broadcasts.map(item => <article key={item.id} className="bg-[#FFF8E7] border-2 border-black p-4 rounded-2xl">
          <div className="flex justify-between gap-4"><span className="bg-[#00F0FF] border border-black px-2 py-0.5 rounded text-[9px] font-black uppercase">{item.category}</span><time className="text-[9px] font-bold text-gray-500">{new Date(item.createdAt).toLocaleString()}</time></div>
          <h3 className="font-black text-xs uppercase mt-3">{item.title}</h3><p className="text-xs font-semibold text-gray-600 mt-1">{item.message}</p><p className="text-[9px] font-black uppercase text-gray-500 mt-3">{item.recipientCount} recipients</p>
        </article>)}
        {!broadcasts.length && <p className="text-xs text-gray-500">No broadcasts have been sent.</p>}
      </div>
    </section>
  </div>;
}

function Field({ label, children }) {
  return <label className="block"><span className="block text-[10px] font-black uppercase text-gray-500 mb-1.5">{label}</span>{children}</label>;
}
