import { useState, useEffect } from 'react';
import { getCouponSecondsLeft } from '../data/coupons';

/**
 * useCouponCountdown — tracks remaining seconds for a coupon.
 * @param {object|null} coupon - A coupon object with expiresAt field
 * @returns {{ secondsLeft: number, formattedTime: string }}
 */
export function useCouponCountdown(coupon) {
  const [secondsLeft, setSecondsLeft] = useState(() => getCouponSecondsLeft(coupon));

  useEffect(() => {
    if (!coupon) return;
    const interval = setInterval(() => {
      setSecondsLeft(getCouponSecondsLeft(coupon));
    }, 1000);
    return () => clearInterval(interval);
  }, [coupon]);

  const hours = Math.floor(secondsLeft / 3600);
  const minutes = Math.floor((secondsLeft % 3600) / 60);
  const seconds = secondsLeft % 60;

  const formattedTime = secondsLeft > 0
    ? `${String(hours).padStart(2, '0')}h : ${String(minutes).padStart(2, '0')}m : ${String(seconds).padStart(2, '0')}s`
    : 'EXPIRED';

  return { secondsLeft, formattedTime };
}
