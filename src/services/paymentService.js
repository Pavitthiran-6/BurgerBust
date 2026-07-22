import { apiRequest } from './apiClient';

export const paymentService = {
  createOrder: (orderId, idempotencyKey) => apiRequest('/payments/create-order', {
    method: 'POST',
    headers: { 'Idempotency-Key': idempotencyKey },
    body: JSON.stringify({ orderId }),
  }),
  verify: payment => apiRequest('/payments/verify', {
    method: 'POST',
    body: JSON.stringify({
      razorpayOrderId: payment.razorpay_order_id,
      razorpayPaymentId: payment.razorpay_payment_id,
      razorpaySignature: payment.razorpay_signature,
    }),
  }),
  getHistory: orderId => apiRequest(`/payments/${orderId}`),
};

