import React, { useEffect, useState } from 'react';
import { adminService } from '../../services/adminService';

const emptyForm = { name: '', description: '', imageUrl: '', displayOrder: 0, active: true };

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const load = async () => { try { setCategories(await adminService.getCategories()); } catch (requestError) { setError(requestError.message); } };
  useEffect(() => { load(); }, []);

  const submit = async event => {
    event.preventDefault(); setBusy(true); setError('');
    const payload = { ...form, displayOrder: Number(form.displayOrder) };
    try { if (editing) await adminService.updateCategory(editing, payload); else await adminService.createCategory(payload); setEditing(null); setForm(emptyForm); await load(); }
    catch (requestError) { setError(requestError.message); }
    finally { setBusy(false); }
  };
  const edit = category => { setEditing(category.uuid); setForm({ name: category.name, description: category.description || '', imageUrl: category.imageUrl || '', displayOrder: category.displayOrder, active: category.active }); };
  const setStatus = async category => { setError(''); try { await adminService.setCategoryStatus(category.uuid, !category.active); await load(); } catch (requestError) { setError(requestError.message); } };
  const remove = async category => { if (!window.confirm(`Soft delete ${category.name}?`)) return; setError(''); try { await adminService.deleteCategory(category.uuid); await load(); } catch (requestError) { setError(requestError.message); } };
  const update = (key, value) => setForm(current => ({ ...current, [key]: value }));
  const input = 'w-full p-3 border-2 border-black rounded-xl font-bold bg-white text-xs';

  return <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fadeIn">
    <section className="lg:col-span-5 bg-white border-4 border-black p-6 rounded-3xl shadow-[6px_6px_0_#111] h-max"><h2 className="font-display-xl text-xl font-black uppercase border-b-4 border-black pb-2">{editing ? 'Edit category' : 'New category'}</h2>{error && <p className="mt-4 p-3 bg-red-100 border-2 border-red-700 rounded-xl text-xs font-bold text-red-800">{error}</p>}<form onSubmit={submit} className="space-y-3 mt-5"><Field label="Name"><input required maxLength="100" value={form.name} onChange={event => update('name', event.target.value)} className={input}/></Field><Field label="Description"><textarea maxLength="500" value={form.description} onChange={event => update('description', event.target.value)} className={`${input} h-20`}/></Field><Field label="Image URL"><input maxLength="1000" value={form.imageUrl} onChange={event => update('imageUrl', event.target.value)} className={input}/></Field><Field label="Display order"><input required min="0" type="number" value={form.displayOrder} onChange={event => update('displayOrder', event.target.value)} className={input}/></Field><label className="flex gap-2 items-center text-[10px] font-black uppercase"><input type="checkbox" checked={form.active} onChange={event => update('active', event.target.checked)}/> Active</label><div className="flex gap-3"><button disabled={busy} className="flex-1 py-3 bg-[#34C759] text-white border-2 border-black rounded-xl font-black text-xs uppercase">Save category</button>{editing && <button type="button" onClick={() => { setEditing(null); setForm(emptyForm); }} className="px-4 border-2 border-black rounded-xl font-black text-xs uppercase">Cancel</button>}</div></form></section>
    <section className="lg:col-span-7 bg-white border-4 border-black p-6 rounded-3xl shadow-[6px_6px_0_#111]"><h2 className="font-display-xl text-xl font-black uppercase border-b-4 border-black pb-2">Catalog categories</h2><div className="space-y-3 mt-5">{categories.map(category => <article key={category.uuid} className={`p-4 border-2 border-black rounded-2xl ${category.active ? 'bg-[#FFF8E7]' : 'bg-gray-100 opacity-70'}`}><div className="flex flex-col sm:flex-row justify-between gap-3"><div><b className="uppercase text-sm">{category.name}</b><p className="text-[10px] text-gray-500">Order {category.displayOrder} · {category.description || 'No description'}</p></div><div className="flex gap-2"><button onClick={() => setStatus(category)} className={`px-3 py-2 border border-black rounded font-black text-[9px] uppercase ${category.active ? 'bg-green-500 text-white' : 'bg-gray-300'}`}>{category.active ? 'Active' : 'Disabled'}</button><button onClick={() => edit(category)} className="px-3 py-2 bg-[#00F0FF] border border-black rounded font-black text-[9px] uppercase">Edit</button><button onClick={() => remove(category)} className="px-3 py-2 bg-red-600 text-white border border-black rounded font-black text-[9px] uppercase">Delete</button></div></div></article>)}{!categories.length && <p className="text-xs text-gray-500">No categories.</p>}</div></section>
  </div>;
}

function Field({ label, children }) { return <label className="block"><span className="block text-[9px] font-black uppercase text-gray-500 mb-1">{label}</span>{children}</label>; }
