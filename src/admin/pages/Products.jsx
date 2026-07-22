import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { adminService } from '../../services/adminService';

const blankProduct = categoryUuid => ({ name: '', description: '', price: '', offerPrice: '', imageUrl: '', categoryUuid: categoryUuid || '', available: true, visible: true, featured: false, recommended: false, bestseller: false, popular: false, rating: 0, reviewCount: 0, preparationTime: 15, calories: '', veg: false });

export default function Products() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selected, setSelected] = useState([]);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState(null);
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      const [productPage, categoryList] = await Promise.all([adminService.getProducts({ page: 0, size: 100, search: search || undefined }), adminService.getCategories()]);
      setProducts(productPage.content || []);
      setCategories(categoryList || []);
    } catch (requestError) { setError(requestError.message); }
  }, [search]);
  useEffect(() => { const timer = setTimeout(load, 200); return () => clearTimeout(timer); }, [load]);

  const allSelected = products.length > 0 && products.every(product => selected.includes(product.uuid));
  const selectedCount = selected.length;
  const toggle = id => setSelected(current => current.includes(id) ? current.filter(value => value !== id) : [...current, id]);
  const toggleAll = () => setSelected(allSelected ? [] : products.map(product => product.uuid));

  const mutateSelected = async changes => {
    if (!selectedCount) return;
    setBusy(true); setError('');
    try { await adminService.bulkUpdateProducts({ productIds: selected, ...changes }); setSelected([]); await load(); }
    catch (requestError) { setError(requestError.message); }
    finally { setBusy(false); }
  };
  const removeSelected = async () => {
    if (!selectedCount || !window.confirm(`Soft delete ${selectedCount} selected product(s)?`)) return;
    setBusy(true); setError('');
    try { await adminService.bulkDeleteProducts(selected); setSelected([]); await load(); }
    catch (requestError) { setError(requestError.message); }
    finally { setBusy(false); }
  };

  const startCreate = () => { setEditing(null); setForm(blankProduct(categories[0]?.uuid)); };
  const startEdit = product => { setEditing(product.uuid); setForm({ ...product, price: String(product.price), offerPrice: product.offerPrice == null ? '' : String(product.offerPrice), calories: product.calories == null ? '' : String(product.calories) }); };
  const save = async event => {
    event.preventDefault(); setBusy(true); setError('');
    const payload = { ...form, price: Number(form.price), offerPrice: form.offerPrice === '' ? null : Number(form.offerPrice), rating: Number(form.rating), reviewCount: Number(form.reviewCount), preparationTime: Number(form.preparationTime), calories: form.calories === '' ? null : Number(form.calories) };
    try { if (editing) await adminService.updateProduct(editing, payload); else await adminService.createProduct(payload); setForm(null); setEditing(null); await load(); }
    catch (requestError) { setError(requestError.message); }
    finally { setBusy(false); }
  };

  const selectedLabel = useMemo(() => selectedCount ? `${selectedCount} selected` : 'Select products for bulk actions', [selectedCount]);
  return <div className="space-y-6 animate-fadeIn">
    <section className="bg-white border-4 border-black shadow-[6px_6px_0_#111] p-6 rounded-3xl">
      <div className="flex flex-col md:flex-row justify-between gap-4"><div><h2 className="font-display-xl text-3xl font-black uppercase">Product catalog</h2><p className="text-xs font-bold text-gray-500 uppercase mt-1">{selectedLabel}</p></div><div className="flex gap-2"><input value={search} onChange={event => setSearch(event.target.value)} placeholder="Search products" className="p-3 border-2 border-black rounded-xl font-bold text-xs"/><button onClick={startCreate} className="px-5 py-3 bg-[#FFD23F] border-2 border-black rounded-xl font-black text-xs uppercase">Add product</button></div></div>
      {error && <p className="mt-4 p-3 bg-red-100 border-2 border-red-700 rounded-xl text-xs font-bold text-red-800">{error}</p>}
      <div className="flex flex-wrap gap-2 mt-5 items-center"><label className="flex gap-2 items-center text-[10px] font-black uppercase"><input type="checkbox" checked={allSelected} onChange={toggleAll}/> Select page</label><BulkButton disabled={!selectedCount || busy} onClick={() => mutateSelected({ available: true, visible: true })}>Make available</BulkButton><BulkButton disabled={!selectedCount || busy} onClick={() => mutateSelected({ available: false })}>Unavailable</BulkButton><BulkButton disabled={!selectedCount || busy} onClick={() => mutateSelected({ featured: true })}>Feature</BulkButton><BulkButton disabled={!selectedCount || busy} onClick={() => mutateSelected({ visible: false })}>Hide</BulkButton><BulkButton danger disabled={!selectedCount || busy} onClick={removeSelected}>Delete</BulkButton></div>
    </section>
    <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {products.map(product => <article key={product.uuid} className={`bg-white border-4 border-black shadow-[5px_5px_0_#111] rounded-3xl p-5 ${!product.visible ? 'opacity-60' : ''}`}>
        <div className="flex justify-between gap-3"><label><input type="checkbox" checked={selected.includes(product.uuid)} onChange={() => toggle(product.uuid)} aria-label={`Select ${product.name}`}/></label><div className="flex gap-1 flex-wrap justify-end">{product.veg && <Badge color="bg-green-200">Veg</Badge>}{product.featured && <Badge color="bg-yellow-200">Featured</Badge>}{product.popular && <Badge color="bg-pink-200">Popular</Badge>}</div></div>
        <div className="flex gap-4 mt-4"><div className="w-20 h-20 border-2 border-black rounded-2xl bg-gray-50 overflow-hidden shrink-0">{product.imageUrl && <img src={product.imageUrl} alt="" className="w-full h-full object-cover"/>}</div><div className="min-w-0"><p className="text-[9px] font-black text-gray-500 uppercase">{product.categoryName}</p><h3 className="font-black uppercase truncate">{product.name}</h3><p className="font-black text-[#FF0055]">₹{Number(product.effectivePrice).toFixed(2)}</p><p className="text-[10px] text-gray-500 line-clamp-2">{product.description}</p></div></div>
        <div className="flex gap-2 mt-4 pt-3 border-t-2 border-gray-100"><span className={`px-2 py-1 rounded border border-black text-[9px] font-black uppercase ${product.available ? 'bg-green-500 text-white' : 'bg-gray-300'}`}>{product.available ? 'Available' : 'Unavailable'}</span><button onClick={() => startEdit(product)} className="ml-auto px-3 py-1 bg-[#00F0FF] border border-black rounded font-black text-[9px] uppercase">Edit</button></div>
      </article>)}
      {!products.length && <p className="text-sm text-gray-500">No products found.</p>}
    </section>
    {form && <ProductDialog form={form} setForm={setForm} categories={categories} editing={editing} busy={busy} onClose={() => setForm(null)} onSubmit={save}/>} 
  </div>;
}

function ProductDialog({ form, setForm, categories, editing, busy, onClose, onSubmit }) {
  const update = (key, value) => setForm(current => ({ ...current, [key]: value }));
  const input = 'w-full p-2.5 border-2 border-black rounded-xl font-bold text-xs';
  return <div className="fixed inset-0 z-[100000] bg-black/60 flex items-center justify-center p-4"><section className="bg-white border-4 border-black shadow-[10px_10px_0_#111] rounded-3xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"><h2 className="font-display-xl text-2xl font-black uppercase">{editing ? 'Edit product' : 'Add product'}</h2><form onSubmit={onSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-5"><Field label="Name"><input required maxLength="160" value={form.name} onChange={event => update('name', event.target.value)} className={input}/></Field><Field label="Category"><select required value={form.categoryUuid} onChange={event => update('categoryUuid', event.target.value)} className={input}>{categories.map(category => <option key={category.uuid} value={category.uuid}>{category.name}</option>)}</select></Field><Field label="Price"><input required min="0" step="0.01" type="number" value={form.price} onChange={event => update('price', event.target.value)} className={input}/></Field><Field label="Offer price"><input min="0" step="0.01" type="number" value={form.offerPrice} onChange={event => update('offerPrice', event.target.value)} className={input}/></Field><Field label="Preparation minutes"><input required min="1" type="number" value={form.preparationTime} onChange={event => update('preparationTime', event.target.value)} className={input}/></Field><Field label="Calories"><input min="0" type="number" value={form.calories} onChange={event => update('calories', event.target.value)} className={input}/></Field><Field label="Image URL"><input maxLength="1000" value={form.imageUrl || ''} onChange={event => update('imageUrl', event.target.value)} className={input}/></Field><div/><Field label="Description"><textarea maxLength="2000" value={form.description || ''} onChange={event => update('description', event.target.value)} className={`${input} h-20`}/></Field><div className="grid grid-cols-2 gap-2 content-start pt-5">{['available','visible','featured','recommended','bestseller','popular','veg'].map(flag => <label key={flag} className="flex gap-2 items-center text-[9px] font-black uppercase"><input type="checkbox" checked={!!form[flag]} onChange={event => update(flag, event.target.checked)}/>{flag}</label>)}</div><div className="sm:col-span-2 flex justify-end gap-3 mt-3"><button type="button" onClick={onClose} className="px-5 py-2.5 border-2 border-black rounded-xl font-black text-xs uppercase">Cancel</button><button disabled={busy} className="px-5 py-2.5 bg-[#34C759] text-white border-2 border-black rounded-xl font-black text-xs uppercase">Save product</button></div></form></section></div>;
}

function BulkButton({ children, danger, ...props }) { return <button {...props} className={`px-3 py-2 border-2 border-black rounded-lg text-[9px] font-black uppercase disabled:opacity-40 ${danger ? 'bg-red-600 text-white' : 'bg-white'}`}>{children}</button>; }
function Badge({ children, color }) { return <span className={`${color} border border-black rounded px-1.5 py-0.5 text-[8px] font-black uppercase`}>{children}</span>; }
function Field({ label, children }) { return <label className="block"><span className="block text-[9px] font-black uppercase text-gray-500 mb-1">{label}</span>{children}</label>; }
