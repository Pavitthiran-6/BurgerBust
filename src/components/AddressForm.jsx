import React, { useState } from 'react';

const TAGS = ['HOME BASE', 'WORK BASE', 'FRIENDS BASE', 'SECRET DEN'];

export default function AddressForm({ profile = {}, onSave, onCancel, submitLabel = 'SAVE DELIVERY ADDRESS' }) {
  const [form, setForm] = useState({
    recipientName: profile.name || '',
    phone: profile.phone || '',
    label: '',
    tag: 'HOME BASE',
    addressLine1: '',
    apartment: '',
    floor: '',
    city: '',
    state: '',
    postalCode: '',
    landmark: '',
    deliveryInstructions: '',
  });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const update = (field, value) => setForm(previous => ({ ...previous, [field]: value }));

  const handleSubmit = async event => {
    event.preventDefault();
    setError('');
    if (!/^\d{5,6}$/.test(form.postalCode.trim())) {
      setError('PIN code must contain 5-6 digits.');
      return;
    }

    const addressLine2 = [
      form.apartment.trim(),
      form.floor.trim() ? `Floor ${form.floor.trim()}` : '',
      form.landmark.trim() ? `Near ${form.landmark.trim()}` : '',
    ].filter(Boolean).join(', ');

    setSaving(true);
    try {
      await onSave({
        label: form.label.trim() || form.tag,
        title: form.label.trim() || form.tag,
        tag: form.tag,
        recipientName: form.recipientName.trim(),
        phone: form.phone.trim(),
        addressLine1: form.addressLine1.trim(),
        addressLine2,
        address: [form.addressLine1.trim(), addressLine2].filter(Boolean).join(', '),
        city: form.city.trim(),
        state: form.state.trim(),
        postalCode: form.postalCode.trim(),
        pincode: form.postalCode.trim(),
        deliveryInstructions: form.deliveryInstructions.trim(),
        deliveryNotes: form.deliveryInstructions.trim(),
      });
    } catch (saveError) {
      setError(saveError.message || 'Unable to save this address.');
    } finally {
      setSaving(false);
    }
  };

  const inputClass = 'w-full p-3 border-2 border-[#1a1c1c] rounded-xl font-body-md font-bold text-xs bg-white text-[#1a1c1c]';

  return (
    <form onSubmit={handleSubmit} className="bg-[#FFF8E7] border-3 border-[#1a1c1c] p-5 rounded-2xl space-y-3 font-body-md">
      <div>
        <h4 className="font-headline-md font-black text-base uppercase text-[#1a1c1c]">ADD YOUR DELIVERY ADDRESS</h4>
        <p className="font-body-md text-xs font-semibold text-gray-600">Saved securely to your BurgerBurst account for future checkout.</p>
      </div>

      {error && <p className="rounded-xl border-2 border-red-600 bg-red-50 p-3 text-xs font-headline-md font-black text-red-700">{error}</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <input type="text" placeholder="Recipient Name *" value={form.recipientName} onChange={event => update('recipientName', event.target.value)} required className={inputClass} />
        <input type="tel" placeholder="Phone Number *" value={form.phone} onChange={event => update('phone', event.target.value)} required pattern="[+0-9][0-9 ()-]{6,19}" className={inputClass} />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <input type="text" placeholder="Address Label (e.g. Home)" value={form.label} onChange={event => update('label', event.target.value)} maxLength="60" className={inputClass} />
        <select value={form.tag} onChange={event => update('tag', event.target.value)} className={inputClass}>
          {TAGS.map(tag => <option key={tag} value={tag}>{tag}</option>)}
        </select>
      </div>
      <input type="text" placeholder="Street Address *" value={form.addressLine1} onChange={event => update('addressLine1', event.target.value)} required maxLength="200" className={inputClass} />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <input type="text" placeholder="Apartment / Suite" value={form.apartment} onChange={event => update('apartment', event.target.value)} className={inputClass} />
        <input type="text" placeholder="Floor No." value={form.floor} onChange={event => update('floor', event.target.value)} className={inputClass} />
        <input type="text" placeholder="PIN Code *" value={form.postalCode} onChange={event => update('postalCode', event.target.value.replace(/\D/g, '').slice(0, 6))} required inputMode="numeric" className={inputClass} />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <input type="text" placeholder="City *" value={form.city} onChange={event => update('city', event.target.value)} required className={inputClass} />
        <input type="text" placeholder="State *" value={form.state} onChange={event => update('state', event.target.value)} required className={inputClass} />
      </div>
      <input type="text" placeholder="Landmark (near hospital, school...)" value={form.landmark} onChange={event => update('landmark', event.target.value)} className={inputClass} />
      <textarea placeholder="Delivery notes (e.g. Ring bell twice, leave at door...)" value={form.deliveryInstructions} onChange={event => update('deliveryInstructions', event.target.value)} rows={2} maxLength="500" className={`${inputClass} resize-none`} />

      <div className="flex flex-wrap gap-3 pt-1">
        <button type="submit" disabled={saving} className="px-6 py-3 bg-[#10B981] text-white border-2 border-[#1a1c1c] font-headline-md font-black text-xs uppercase rounded-xl cursor-pointer disabled:opacity-60 hover:bg-green-600 transition-all">
          {saving ? 'SAVING ADDRESS...' : submitLabel}
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel} disabled={saving} className="px-5 py-3 bg-white border-2 border-[#1a1c1c] font-headline-md font-black text-xs uppercase rounded-xl cursor-pointer hover:bg-gray-100 transition-all">
            CANCEL
          </button>
        )}
      </div>
    </form>
  );
}
