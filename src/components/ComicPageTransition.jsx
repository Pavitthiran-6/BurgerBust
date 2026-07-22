import React, { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';

const COMIC_BURSTS = [
  "SWOOSH!",
  "POW!",
  "ZIP!",
  "BAM!",
  "WHAM!",
  "BOOM!"
];

export default function ComicPageTransition({ isTransitioning }) {
  const [burstText, setBurstText] = useState("SWOOSH!");
  const panelRef = useRef(null);
  const textRef = useRef(null);

  useEffect(() => {
    if (isTransitioning) {
      // Pick random comic action word
      const randomWord = COMIC_BURSTS[Math.floor(Math.random() * COMIC_BURSTS.length)];
      setBurstText(randomWord);

      // GSAP Comic Panel Sweep & Page Flip Animation (1.0+ Second Duration)
      if (panelRef.current && textRef.current) {
        const tl = gsap.timeline();
        
        tl.fromTo(
          panelRef.current,
          { xPercent: -100, skewX: -12, opacity: 1 },
          { xPercent: 0, skewX: 0, duration: 0.38, ease: "power3.out" }
        )
        .fromTo(
          textRef.current,
          { scale: 0.3, rotate: -15, opacity: 0 },
          { scale: 1.1, rotate: 5, opacity: 1, duration: 0.28, ease: "back.out(2)" },
          "-=0.2"
        )
        .to(panelRef.current, {
          xPercent: 100,
          skewX: 12,
          duration: 0.38,
          ease: "power3.in",
          delay: 0.35
        });
      }
    }
  }, [isTransitioning]);

  if (!isTransitioning) return null;

  return (
    <div className="fixed inset-0 z-[99999] pointer-events-none overflow-hidden">
      {/* Cartoon Speed-Stripe Wipe Panel */}
      <div 
        ref={panelRef}
        className="w-full h-full bg-[#FFD23F] border-y-8 border-[#1a1c1c] flex items-center justify-center relative shadow-[0_0_50px_rgba(0,0,0,0.5)]"
      >
        {/* Bold Comic Action Speed Lines (No Dots) */}
        <div className="absolute inset-0 opacity-15 bg-[repeating-linear-gradient(45deg,#1a1c1c_0px,#1a1c1c_15px,transparent_15px,transparent_35px)]"></div>

        {/* High-Contrast Diagonal Comic Strip Accent */}
        <div className="absolute inset-x-0 h-20 bg-[#FF0055] border-y-4 border-[#1a1c1c] transform -rotate-3 shadow-[0_4px_0px_rgba(0,0,0,0.2)]"></div>

        {/* Center Comic Action Burst Card */}
        <div 
          ref={textRef}
          className="relative z-10 bg-white border-6 border-[#1a1c1c] shadow-[10px_10px_0px_0px_#111111] px-10 py-5 rounded-3xl transform rotate-[-3deg]"
        >
          <span className="bg-[#00F0FF] text-[#1a1c1c] border-2 border-[#1a1c1c] px-4 py-1 rounded-full font-black text-xs uppercase block mb-1 text-center shadow-[2px_2px_0px_0px_#111111]">
            NEXT PAGE
          </span>
          <h2 className="font-display-xl text-5xl md:text-7xl font-black uppercase text-[#1a1c1c] tracking-tight text-center drop-shadow-[4px_4px_0px_#FF0055]">
            {burstText}
          </h2>
        </div>
      </div>
    </div>
  );
}
