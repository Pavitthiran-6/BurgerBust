// Restaurant Availability Configuration
// This is the single source of truth for restaurant operational status.
// Replace with API call for Spring Boot integration.

const now = new Date();
const hour = now.getHours();

// Operating hours: Open 08:00 - 23:00
const OPEN_HOUR = 8;
const CLOSE_HOUR = 23;
const BUSY_HOURS = [12, 13, 19, 20]; // Lunch rush & dinner rush

export const RESTAURANT_CONFIG = {
  name: "BurgerBurst HQ",
  tagline: "CARTOON UNIVERSE FOOD DELIVERY",
  phone: "+1-555-BURST-99",
  email: "orders@burgerburst.toon",
  openHour: OPEN_HOUR,
  closeHour: CLOSE_HOUR,
  busyHours: BUSY_HOURS,
  minOrderValue: 5.00,
  maxOrderValue: 500.00,
  deliveryRadiusKm: 10,
  freeDeliveryThreshold: 30.00,
  baseDeliveryFee: 3.99,
  expressDeliveryFee: 7.99,
  averageRating: 4.8,
  totalReviews: 2847,

  // Override: set these to manually control restaurant status
  forceStatus: null, // null | 'OPEN' | 'CLOSED' | 'BUSY' | 'MAINTENANCE' | 'HOLIDAY'
  maintenanceMessage: "We're upgrading the Krabby Patty formula! Back in 30 mins.",
  holidayMessage: "Happy Cartoon Day! We resume service tomorrow at 8:00 AM.",
};

/**
 * Returns the current restaurant operational status.
 * @returns {{ status: string, label: string, color: string, message: string, canOrder: boolean }}
 */
export function getRestaurantStatus() {
  if (RESTAURANT_CONFIG.forceStatus === 'MAINTENANCE') {
    return {
      status: 'MAINTENANCE',
      label: 'MAINTENANCE MODE',
      color: 'bg-orange-500',
      message: RESTAURANT_CONFIG.maintenanceMessage,
      canOrder: false,
    };
  }

  if (RESTAURANT_CONFIG.forceStatus === 'HOLIDAY') {
    return {
      status: 'HOLIDAY',
      label: 'HOLIDAY CLOSED',
      color: 'bg-purple-600',
      message: RESTAURANT_CONFIG.holidayMessage,
      canOrder: false,
    };
  }

  if (hour < OPEN_HOUR || hour >= CLOSE_HOUR) {
    const nextOpen = hour >= CLOSE_HOUR
      ? `Tomorrow at ${OPEN_HOUR}:00 AM`
      : `Today at ${OPEN_HOUR}:00 AM`;
    return {
      status: 'CLOSED',
      label: 'CURRENTLY CLOSED',
      color: 'bg-gray-700',
      message: `We're closed right now. Opens ${nextOpen}.`,
      canOrder: false,
    };
  }

  if (BUSY_HOURS.includes(hour)) {
    return {
      status: 'BUSY',
      label: ' HIGH ORDER VOLUME',
      color: 'bg-orange-400',
      message: 'Kitchen is super busy! Expect 15-20 min extra on delivery time.',
      canOrder: true,
    };
  }

  return {
    status: 'OPEN',
    label: ' OPEN & DELIVERING',
    color: 'bg-[#34C759]',
    message: `Open until ${CLOSE_HOUR}:00 PM. Fast Anywhere Door delivery!`,
    canOrder: true,
  };
}

/**
 * Calculate delivery fee based on distance.
 * @param {number} distanceKm
 * @param {boolean} isExpress
 * @param {number} subtotal
 * @returns {number}
 */
export function calculateDeliveryFee(distanceKm = 2.5, isExpress = false, subtotal = 0) {
  if (subtotal >= RESTAURANT_CONFIG.freeDeliveryThreshold) return 0;
  if (isExpress) return RESTAURANT_CONFIG.expressDeliveryFee;
  if (distanceKm > RESTAURANT_CONFIG.deliveryRadiusKm) return -1; // Not serviceable
  return RESTAURANT_CONFIG.baseDeliveryFee;
}

/**
 * Estimate delivery time in minutes.
 * @param {string} restaurantStatus
 * @param {number} distanceKm
 * @returns {string}
 */
export function estimateDeliveryTime(restaurantStatus = 'OPEN', distanceKm = 2.5) {
  const baseTime = 15;
  const distanceTime = Math.round(distanceKm * 3);
  const busyExtra = restaurantStatus === 'BUSY' ? 15 : 0;
  const total = baseTime + distanceTime + busyExtra;
  return `${total}-${total + 5} mins`;
}
