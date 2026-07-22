import { apiRequest } from './apiClient';

export const inventoryService = {
  getInventory: () => apiRequest('/admin/inventory'),
  updateInventory: (productId, inventory) => apiRequest(`/admin/inventory/${productId}`, {
    method: 'PUT',
    body: JSON.stringify(inventory),
  }),
  updateStock: (productId, quantity, reason = '') => apiRequest(`/admin/inventory/${productId}/stock`, {
    method: 'PATCH',
    body: JSON.stringify({ quantity, reason }),
  }),
};
