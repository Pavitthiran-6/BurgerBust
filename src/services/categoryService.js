import { apiRequest } from './apiClient';

export const categoryService = {
  getCategories: () => apiRequest('/categories'),
  getCategory: (id) => apiRequest(`/categories/${id}`),
};
