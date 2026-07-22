import { apiRequest, toQueryString } from './apiClient';

export const reviewService = {
  create: review => apiRequest('/reviews', { method: 'POST', body: JSON.stringify(review) }),
  update: (id, review) => apiRequest(`/reviews/${id}`, { method: 'PUT', body: JSON.stringify(review) }),
  remove: id => apiRequest(`/reviews/${id}`, { method: 'DELETE' }),
  getProductReviews: (productId, page = 0, size = 20) =>
    apiRequest(`/products/${productId}/reviews${toQueryString({ page, size })}`),
};
