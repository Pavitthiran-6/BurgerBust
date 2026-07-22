import { cartService } from './cartService';

export const couponService = {
  applyCoupon: code => cartService.applyCoupon(code),
  removeCoupon: () => cartService.removeCoupon(),
};

