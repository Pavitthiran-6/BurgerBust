// Full Coupon Catalog — BurgerBurst
// All coupons with validation rules, expiry, eligibility, and discount logic.

const now = new Date();

export const COUPON_CATALOG = [
  {
    code: "BURSTBURGER20",
    title: "20% OFF ALL BURGERS",
    desc: "Valid on Monster Burgers & Adventurer Combos! Min spend $15.",
    discountType: "percent",
    value: 20,
    maxDiscount: 10.00,
    minSpend: 15.00,
    category: "Burger",         // null = applies to all
    oneTimeUse: false,
    firstOrderOnly: false,
    expiresAt: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 3),
    tag: "FLASH SALE",
    color: "bg-[#FF0055] text-white",
    isExpired: false,
    usedCount: 0,
  },
  {
    code: "FREEFRIES",
    title: "FREE SIDEKICK FRIES",
    desc: "Get a free happy fry sidekick with any 2 pizzas! Min spend $20.",
    discountType: "free_item",
    value: 2.99,
    maxDiscount: 2.99,
    minSpend: 20.00,
    category: "Pizza",
    oneTimeUse: false,
    firstOrderOnly: false,
    expiresAt: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1),
    tag: "BOGO FREE",
    color: "bg-[#FFD23F] text-[#1a1c1c]",
    isExpired: false,
    usedCount: 0,
  },
  {
    code: "CYBORGFREE",
    title: "ZERO DELIVERY FEE",
    desc: "Free Anywhere Door express dispatch to your base! Min spend $10.",
    discountType: "delivery",
    value: 3.99,
    maxDiscount: 3.99,
    minSpend: 10.00,
    category: null,
    oneTimeUse: false,
    firstOrderOnly: false,
    expiresAt: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 7),
    tag: "FREE DELIVERY",
    color: "bg-[#00F0FF] text-[#1a1c1c]",
    isExpired: false,
    usedCount: 0,
  },
  {
    code: "COMIC50",
    title: "50% OFF TOON SHAKES",
    desc: "Half price on all vanilla & strawberry shakes! Min spend $8.",
    discountType: "percent",
    value: 50,
    maxDiscount: 5.00,
    minSpend: 8.00,
    category: "Drinks",
    oneTimeUse: false,
    firstOrderOnly: false,
    expiresAt: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 0, 23, 59, 59),
    tag: "FESTIVAL DEAL",
    color: "bg-[#34C759] text-white",
    isExpired: false,
    usedCount: 0,
  },
  {
    code: "NEWBURST",
    title: "FIRST ORDER: $5 OFF",
    desc: "Welcome to BurgerBurst! $5 off your very first cartoon order.",
    discountType: "flat",
    value: 5.00,
    maxDiscount: 5.00,
    minSpend: 12.00,
    category: null,
    oneTimeUse: true,
    firstOrderOnly: true,
    expiresAt: new Date(now.getFullYear() + 1, 0, 1),
    tag: "FIRST ORDER",
    color: "bg-[#FF70A6] text-white",
    isExpired: false,
    usedCount: 0,
  },
  {
    code: "OLDTOON",
    title: "EXPIRED: CARTOON CLASSIC",
    desc: "This deal has expired. Check for new offers every week!",
    discountType: "percent",
    value: 30,
    maxDiscount: 8.00,
    minSpend: 15.00,
    category: null,
    oneTimeUse: false,
    firstOrderOnly: false,
    expiresAt: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 2),
    tag: "EXPIRED",
    color: "bg-gray-400 text-gray-700",
    isExpired: true,
    usedCount: 0,
  },
];

/**
 * Validate a coupon code against cart details.
 * @param {string} code - Coupon code entered by user
 * @param {number} subtotal - Cart subtotal
 * @param {string[]} categories - Array of item categories in cart
 * @param {boolean} isFirstOrder - Whether this is the user's first order
 * @param {string[]} usedCoupons - Array of coupon codes already used
 * @returns {{ valid: boolean, coupon?: object, error?: string }}
 */
export function validateCoupon(code, subtotal, categories = [], isFirstOrder = false, usedCoupons = []) {
  const coupon = COUPON_CATALOG.find(c => c.code === code.toUpperCase());

  if (!coupon) return { valid: false, error: "Coupon code not found! Check spelling and try again." };
  if (coupon.isExpired || new Date() > coupon.expiresAt) return { valid: false, error: `Coupon ${code} has expired!` };
  if (subtotal < coupon.minSpend) return { valid: false, error: `Minimum order of $${coupon.minSpend.toFixed(2)} required for this coupon.` };
  if (coupon.firstOrderOnly && !isFirstOrder) return { valid: false, error: "This coupon is valid for first-time orders only." };
  if (coupon.oneTimeUse && usedCoupons.includes(code.toUpperCase())) return { valid: false, error: "You've already used this one-time coupon." };
  if (coupon.category && !categories.includes(coupon.category)) return { valid: false, error: `This coupon is only valid for ${coupon.category} items.` };

  return { valid: true, coupon };
}

/**
 * Calculate discount amount from a validated coupon.
 * @param {object} coupon
 * @param {number} subtotal
 * @returns {number}
 */
export function calculateCouponDiscount(coupon, subtotal) {
  if (!coupon) return 0;
  if (coupon.discountType === "percent") {
    const raw = (subtotal * coupon.value) / 100;
    return Math.min(raw, coupon.maxDiscount);
  }
  if (coupon.discountType === "flat") return Math.min(coupon.value, subtotal);
  if (coupon.discountType === "free_item") return coupon.value;
  if (coupon.discountType === "delivery") return coupon.value; // applied to delivery fee
  return 0;
}

/**
 * Get seconds until coupon expires.
 * @param {object} coupon
 * @returns {number}
 */
export function getCouponSecondsLeft(coupon) {
  if (!coupon || !coupon.expiresAt) return 0;
  return Math.max(0, Math.floor((new Date(coupon.expiresAt) - new Date()) / 1000));
}

/**
 * Auto-recommend the best applicable coupon.
 * @param {number} subtotal
 * @param {string[]} categories
 * @param {boolean} isFirstOrder
 * @returns {object|null}
 */
export function getRecommendedCoupon(subtotal, categories = [], isFirstOrder = false) {
  const valid = COUPON_CATALOG.filter(c => {
    if (c.isExpired || new Date() > c.expiresAt) return false;
    if (subtotal < c.minSpend) return false;
    if (c.firstOrderOnly && !isFirstOrder) return false;
    if (c.category && !categories.includes(c.category)) return false;
    return true;
  });

  if (!valid.length) return null;

  // Pick highest absolute savings
  const ranked = valid.map(c => ({ ...c, savings: calculateCouponDiscount(c, subtotal) }));
  ranked.sort((a, b) => b.savings - a.savings);
  return ranked[0];
}
