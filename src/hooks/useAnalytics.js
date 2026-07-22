/**
 * Privacy-minimized analytics event tracker.
 * A short local history supports debugging while funnel events are sent to the backend.
 */

import { apiRequest } from '../services/apiClient';

const SESSION_KEY = 'burger_analytics_session';
const TRACKED_EVENTS = new Set([
  'PAGE_VIEWED', 'PRODUCT_VIEWED', 'PRODUCT_SEARCHED', 'CATEGORY_VIEWED',
  'ADDED_TO_CART', 'REMOVED_FROM_CART', 'CHECKOUT_STARTED', 'COUPON_APPLIED',
  'ORDER_PLACED', 'REVIEW_SUBMITTED',
]);
const PRODUCT_EVENTS = new Set(['PRODUCT_VIEWED', 'ADDED_TO_CART', 'REMOVED_FROM_CART', 'REVIEW_SUBMITTED']);
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function getSession() {
  try {
    return JSON.parse(localStorage.getItem(SESSION_KEY)) || {
      id: crypto.randomUUID(), events: [], sessionStart: Date.now(),
    };
  } catch {
    return { id: crypto.randomUUID(), events: [], sessionStart: Date.now() };
  }
}

function saveSession(session) {
  try {
    // Keep only last 100 events to prevent localStorage bloat
    session.events = session.events.slice(-100);
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  } catch {
    // silent fail
  }
}

export function track(eventName, properties = {}) {
  const event = {
    event: eventName,
    timestamp: new Date().toISOString(),
    ...properties,
  };

  // Log to console in dev
  if (import.meta.env.DEV) {
    console.log(`[Analytics] ${eventName}`, properties);
  }

  const session = getSession();
  if (!session.id) session.id = crypto.randomUUID();
  session.events.push(event);
  saveSession(session);

  if (TRACKED_EVENTS.has(eventName)) {
    const candidate = properties.id || properties.itemId;
    const productId = typeof candidate === 'string' && UUID_PATTERN.test(candidate) ? candidate : undefined;
    if (PRODUCT_EVENTS.has(eventName) && !productId) return;
    apiRequest('/analytics/events', {
      method: 'POST',
      body: JSON.stringify({ sessionId: session.id, eventType: eventName, productId }),
    }).catch(() => {});
  }
}

// Convenience named event functions
export const Analytics = {
  productViewed: (id, name) => track('PRODUCT_VIEWED', { id, name }),
  productSearched: (query) => track('PRODUCT_SEARCHED', { query }),
  categoryViewed: (category) => track('CATEGORY_VIEWED', { category }),
  addedToCart: (id, name, price) => track('ADDED_TO_CART', { id, name, price }),
  removedFromCart: (id, name) => track('REMOVED_FROM_CART', { id, name }),
  checkoutStarted: (total, itemCount) => track('CHECKOUT_STARTED', { total, itemCount }),
  couponApplied: (code, discount) => track('COUPON_APPLIED', { code, discount }),
  orderPlaced: (orderId, total) => track('ORDER_PLACED', { orderId, total }),
  rewardClaimed: (rewardName, points) => track('REWARD_CLAIMED', { rewardName, points }),
  rewardRedeemed: (rewardName, cost) => track('REWARD_REDEEMED', { rewardName, cost }),
  reviewSubmitted: (itemId, rating) => track('REVIEW_SUBMITTED', { itemId, rating }),
  notificationClicked: (notifId, title) => track('NOTIFICATION_CLICKED', { notifId, title }),
  profileUpdated: (field) => track('PROFILE_UPDATED', { field }),
  favoriteToggled: (itemId, isFavorite) => track('FAVORITE_TOGGLED', { itemId, isFavorite }),
  pageViewed: (pageName) => track('PAGE_VIEWED', { pageName }),
};

export function getAnalyticsSession() {
  return getSession();
}
