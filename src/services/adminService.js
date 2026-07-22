import { apiDownload, apiRequest, toQueryString } from './apiClient';

export const adminService = {
  getDashboard: () => apiRequest('/admin/dashboard'),
  getAnalytics: (params = {}) => apiRequest(`/admin/analytics${toQueryString(params)}`),

  getCustomers: (params = {}) => apiRequest(`/admin/customers${toQueryString(params)}`),
  getCustomer: id => apiRequest(`/admin/customers/${id}`),
  setCustomerStatus: (id, active, reason = '') => apiRequest(`/admin/customers/${id}/status`, {
    method: 'PATCH', body: JSON.stringify({ active, reason }),
  }),
  getCustomerOrders: (id, params = {}) => apiRequest(`/admin/customers/${id}/orders${toQueryString(params)}`),

  getOrders: (params = {}) => apiRequest(`/admin/orders${toQueryString(params)}`),
  getOrder: id => apiRequest(`/admin/orders/${id}`),
  updateOrderStatus: (id, status, note = '') => apiRequest(`/admin/orders/${id}/status`, {
    method: 'PATCH', body: JSON.stringify({ status, note }),
  }),

  getProducts: (params = {}) => apiRequest(`/admin/products${toQueryString(params)}`),
  createProduct: product => apiRequest('/admin/products', {
    method: 'POST', body: JSON.stringify(product),
  }),
  updateProduct: (id, product) => apiRequest(`/admin/products/${id}`, {
    method: 'PUT', body: JSON.stringify(product),
  }),
  deleteProduct: id => apiRequest(`/admin/products/${id}`, { method: 'DELETE' }),
  bulkUpdateProducts: payload => apiRequest('/admin/products/bulk', {
    method: 'PATCH', body: JSON.stringify(payload),
  }),
  bulkDeleteProducts: productIds => apiRequest('/admin/products/bulk', {
    method: 'DELETE', body: JSON.stringify({ productIds }),
  }),
  getCategories: () => apiRequest('/admin/categories'),
  createCategory: category => apiRequest('/admin/categories', {
    method: 'POST', body: JSON.stringify(category),
  }),
  updateCategory: (id, category) => apiRequest(`/admin/categories/${id}`, {
    method: 'PUT', body: JSON.stringify(category),
  }),
  setCategoryStatus: (id, active) => apiRequest(`/admin/categories/${id}/status`, {
    method: 'PATCH', body: JSON.stringify({ active }),
  }),
  deleteCategory: id => apiRequest(`/admin/categories/${id}`, { method: 'DELETE' }),

  getInventory: () => apiRequest('/admin/inventory'),
  adjustInventory: (productId, adjustment, reason) => apiRequest(`/admin/inventory/${productId}/adjust`, {
    method: 'PATCH', body: JSON.stringify({ adjustment, reason }),
  }),

  getCoupons: () => apiRequest('/admin/coupons'),
  createCoupon: coupon => apiRequest('/admin/coupons', {
    method: 'POST', body: JSON.stringify(coupon),
  }),
  updateCoupon: (id, coupon) => apiRequest(`/admin/coupons/${id}`, {
    method: 'PUT', body: JSON.stringify(coupon),
  }),
  expireCoupon: id => apiRequest(`/admin/coupons/${id}/expire`, { method: 'PATCH' }),

  broadcast: notification => apiRequest('/admin/notifications/broadcast', {
    method: 'POST', body: JSON.stringify(notification),
  }),
  getBroadcasts: (params = {}) => apiRequest(`/admin/notifications/broadcasts${toQueryString(params)}`),

  async downloadReport(type, format, params = {}) {
    const result = await apiDownload(`/admin/reports/${type}${toQueryString({ format, ...params })}`);
    const url = URL.createObjectURL(result.blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = result.filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    return result.filename;
  },
};
