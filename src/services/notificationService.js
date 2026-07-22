import { apiRequest, toQueryString } from './apiClient';

const categoryFor = type => {
  if (type?.startsWith('PAYMENT')) return 'PAYMENTS';
  if (type === 'COUPON') return 'OFFERS';
  return 'DELIVERY';
};

const adapt = notification => ({
  id: notification.id,
  title: notification.title,
  desc: notification.message,
  category: categoryFor(notification.type),
  read: notification.read,
  time: notification.createdAt ? new Date(notification.createdAt).toLocaleString() : '',
  date: notification.createdAt,
  orderId: notification.orderId,
});

export const notificationService = {
  async getNotifications(page = 0, size = 50) {
    const data = await apiRequest(`/notifications${toQueryString({ page, size })}`);
    return { items: (data?.content || []).map(adapt), pagination: data };
  },
  markRead: async id => adapt(await apiRequest(`/notifications/${id}/read`, { method: 'PATCH' })),
};
