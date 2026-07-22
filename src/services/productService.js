import { apiRequest, toQueryString } from './apiClient';

function toMenuItem(product) {
  return {
    id: product.uuid,
    uuid: product.uuid,
    name: product.name,
    category: product.categoryName,
    categoryUuid: product.categoryUuid,
    price: Number(product.effectivePrice ?? product.offerPrice ?? product.price),
    originalPrice: Number(product.price),
    offerPrice: product.offerPrice == null ? null : Number(product.offerPrice),
    rating: Number(product.rating || 0),
    desc: product.description || '',
    image: product.imageUrl || '/foods/burger-classic.png',
    tag: product.veg ? 'Veg' : 'Non-Veg',
    popular: product.popular,
    featured: product.featured,
    recommended: product.recommended,
    bestseller: product.bestseller,
    stockStatus: product.available ? 'AVAILABLE' : 'OUT_OF_STOCK',
    prepTime: `${product.preparationTime} mins`,
    preparationTime: product.preparationTime,
    calories: product.calories,
    veg: product.veg,
    reviewCount: product.reviewCount,
    availableHours: 'ALL_DAY',
  };
}

function mapPage(page) {
  return {
    items: (page?.content || []).map(toMenuItem),
    pagination: {
      page: page?.page || 0,
      size: page?.size || 0,
      totalElements: page?.totalElements || 0,
      totalPages: page?.totalPages || 0,
      first: page?.first ?? true,
      last: page?.last ?? true,
    },
  };
}

export const productService = {
  async getProducts(params = {}) {
    return mapPage(await apiRequest(`/products${toQueryString({ page: 0, size: 100, ...params })}`));
  },
  async searchProducts(params = {}) {
    return mapPage(await apiRequest(`/products/search${toQueryString({ page: 0, size: 100, ...params })}`));
  },
  async getProduct(id) {
    return toMenuItem(await apiRequest(`/products/${id}`));
  },
  async addProduct(product) {
    return apiRequest('/admin/products', { method: 'POST', body: JSON.stringify(product) });
  },
  async updateProduct(id, fields) {
    return apiRequest(`/admin/products/${id}`, { method: 'PUT', body: JSON.stringify(fields) });
  },
  async deleteProduct(id) {
    return apiRequest(`/admin/products/${id}`, { method: 'DELETE' });
  }
};
