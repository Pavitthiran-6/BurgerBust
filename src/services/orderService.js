import { apiRequest, toQueryString } from './apiClient';
import { cartService } from './cartService';

const titleStatus = status => status?.split('_').map(part => part[0] + part.slice(1).toLowerCase()).join(' ');

function adaptOrder(order) {
  return {
    id: order.id,
    orderNumber: order.orderNumber,
    status: titleStatus(order.status),
    statusCode: order.status,
    paymentMethod: order.paymentMethod,
    date: order.createdAt ? new Date(order.createdAt).toLocaleDateString() : '',
    time: order.createdAt ? new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '',
    items: (order.items || []).map(item => ({
      id: item.productId,
      productId: item.productId,
      name: item.name,
      image: item.imageUrl,
      quantity: item.quantity,
      price: Number(item.unitPrice),
      lineTotal: Number(item.lineTotal),
    })),
    subtotal: Number(order.subtotal),
    discount: Number(order.couponDiscount) + Number(order.rewardDiscount),
    couponDiscount: Number(order.couponDiscount),
    rewardDiscount: Number(order.rewardDiscount),
    tax: Number(order.tax),
    deliveryFee: Number(order.deliveryFee),
    total: Number(order.total),
    currency: order.currency,
    rewardPointsUsed: order.rewardPointsUsed,
    rewardPointsEarned: order.rewardPointsEarned,
    address: order.address,
    shipping: { address: [order.address?.addressLine1, order.address?.city].filter(Boolean).join(', ') },
    timeline: order.timeline || [],
    placedAt: order.placedAt,
  };
}

export const orderService = {
  async createOrder(address, paymentMethod = 'COD', rewardPoints = 0) {
    return adaptOrder(await apiRequest('/orders', {
      method: 'POST', body: JSON.stringify({ address, paymentMethod, rewardPoints }),
    }));
  },
  async getOrders(page = 0, size = 50) {
    const data = await apiRequest(`/orders${toQueryString({ page, size })}`);
    return { items: (data?.content || []).map(adaptOrder), pagination: data };
  },
  getOrder: async id => adaptOrder(await apiRequest(`/orders/${id}`)),
  cancelOrder: async (id, reason = '') => adaptOrder(await apiRequest(`/orders/${id}/cancel`, {
    method: 'POST', body: JSON.stringify({ reason }),
  })),
  reorder: async id => cartService.adaptCart(await apiRequest(`/orders/${id}/reorder`, { method: 'POST' })),
};

