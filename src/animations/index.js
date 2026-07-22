import { gsap } from "gsap";

/**
 * Reusable GSAP Animation Helpers for Toon Components & UI
 */

// 1. Pop & Bounce Entrance
export const animateBounceIn = (element, options = {}) => {
  if (!element) return;
  return gsap.fromTo(
    element,
    { scale: 0.2, opacity: 0 },
    {
      scale: 1,
      opacity: 1,
      duration: 0.6,
      ease: "back.out(1.7)",
      ...options,
    }
  );
};

// 2. Pulse Yoyo Effect
export const animatePulseGlow = (element, options = {}) => {
  if (!element) return;
  return gsap.to(element, {
    scale: 1.06,
    repeat: -1,
    yoyo: true,
    duration: 0.8,
    ease: "power1.inOut",
    ...options,
  });
};

// 3. Directional Slide
export const animateSlideIn = (element, direction = "left", options = {}) => {
  if (!element) return;
  const xOffset = direction === "left" ? -80 : 80;
  return gsap.fromTo(
    element,
    { x: xOffset, opacity: 0 },
    {
      x: 0,
      opacity: 1,
      duration: 0.5,
      ease: "power2.out",
      ...options,
    }
  );
};

// Export raw gsap instance for direct usage in any component
export { gsap };
