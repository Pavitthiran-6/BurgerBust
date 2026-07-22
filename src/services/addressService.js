import { apiRequest } from './apiClient';

export function adaptAddress(address) {
  const addressLine2 = address.addressLine2 || '';
  return {
    id: address.id,
    title: address.label,
    label: address.label,
    tag: address.tag,
    recipientName: address.recipientName,
    phone: address.phone,
    addressLine1: address.addressLine1,
    addressLine2,
    address: [address.addressLine1, addressLine2].filter(Boolean).join(', '),
    city: address.city,
    state: address.state,
    postalCode: address.postalCode,
    pincode: address.postalCode,
    deliveryInstructions: address.deliveryInstructions || '',
    deliveryNotes: address.deliveryInstructions || '',
    default: Boolean(address.defaultAddress),
    serviceable: true,
  };
}

const toRequest = address => ({
  label: address.label || address.title || address.tag,
  tag: address.tag,
  recipientName: address.recipientName,
  phone: address.phone,
  addressLine1: address.addressLine1,
  addressLine2: address.addressLine2 || null,
  city: address.city,
  state: address.state,
  postalCode: address.postalCode || address.pincode,
  deliveryInstructions: address.deliveryInstructions || address.deliveryNotes || null,
  defaultAddress: Boolean(address.default),
});

export const addressService = {
  list: async () => (await apiRequest('/addresses') || []).map(adaptAddress),
  create: async address => adaptAddress(await apiRequest('/addresses', {
    method: 'POST',
    body: JSON.stringify(toRequest(address)),
  })),
  setDefault: async id => adaptAddress(await apiRequest(`/addresses/${id}/default`, { method: 'PATCH' })),
  delete: id => apiRequest(`/addresses/${id}`, { method: 'DELETE' }),
};
