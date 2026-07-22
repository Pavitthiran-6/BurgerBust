import { apiRequest } from './apiClient';

function adaptCart(cart) {
  return {
    items: (cart?.items || []).map(item => ({
      cartUniqueId: item.itemId,
      itemId: item.itemId,
      id: item.productId,
      productId: item.productId,
      name: item.name,
      image: item.imageUrl || '/foods/burger-classic.png',
      category: item.category,
      price: Number(item.unitPrice),
      previousPrice: Number(item.previousUnitPrice),
      quantity: item.quantity,
      lineTotal: Number(item.lineTotal),
      priceChanged: item.priceChanged,
      available: item.productAvailable && item.stockAvailable,
      availableStock: item.availableStock,
    })),
    coupon: cart?.couponCode ? { code: cart.couponCode } : null,
    summary: cart ? {
      cartId: cart.cartId,
      itemCount: cart.itemCount,
      totalQuantity: cart.totalQuantity,
      subtotal: Number(cart.subtotal),
      couponDiscount: Number(cart.couponDiscount),
      taxRate: Number(cart.taxRate),
      tax: Number(cart.tax),
      deliveryFee: Number(cart.deliveryFee),
      total: Number(cart.total),
      minimumOrderAmount: Number(cart.minimumOrderAmount),
      minimumOrderMet: cart.minimumOrderMet,
      valid: cart.valid,
      currency: cart.currency,
    } : null,
  };
}

export const cartService = {
  getCart: async () => adaptCart(await apiRequest('/cart')),
  addItem: async (productId, quantity = 1) => adaptCart(await apiRequest('/cart/items', {
    method: 'POST', body: JSON.stringify({ productId, quantity }),
  })),
  updateItem: async (itemId, quantity) => adaptCart(await apiRequest(`/cart/items/${itemId}`, {
    method: 'PUT', body: JSON.stringify({ quantity }),
  })),
  removeItem: async itemId => adaptCart(await apiRequest(`/cart/items/${itemId}`, { method: 'DELETE' })),
  clear: () => apiRequest('/cart', { method: 'DELETE' }),
  applyCoupon: async code => adaptCart(await apiRequest('/cart/coupon', {
    method: 'POST', body: JSON.stringify({ code }),
  })),
  removeCoupon: async () => adaptCart(await apiRequest('/cart/coupon', { method: 'DELETE' })),
  adaptCart,
};

