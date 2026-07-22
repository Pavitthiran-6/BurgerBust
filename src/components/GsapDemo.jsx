import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { animateBounceIn, animatePulseGlow } from '../animations';

export default function GsapDemo() {
  const containerRef = useRef(null);
  const badgeRef = useRef(null);

  useEffect(() => {
    if (containerRef.current && badgeRef.current) {
      const ctx = gsap.context(() => {
        animateBounceIn(containerRef.current, { delay: 0.1 });
        animatePulseGlow(badgeRef.current, { delay: 0.5 });
      });

      return () => ctx.revert();
    }
  }, []);

  return (
    <div
      ref={containerRef}
      className="p-4 bg-[#FFD23F] comic-border shadow-[4px_4px_0px_0px_#111111] rounded-2xl flex items-center justify-between my-4 text-[#1a1c1c]"
    >
      <div className="flex items-center gap-3">
        <div
          ref={badgeRef}
          className="w-10 h-10 bg-[#FF0055] text-white border-2 border-[#1a1c1c] rounded-full flex items-center justify-center font-black text-lg shadow-[2px_2px_0px_0px_#111111]"
        >

        </div>
        <div>
          <span className="font-black text-sm block uppercase tracking-wide">
            GSAP ENGINE CONFIGURED
          </span>
          <span className="text-xs font-bold opacity-80">
            Imported via `import &#123; gsap &#125; from "gsap";`
          </span>
        </div>
      </div>
      <span className="bg-[#00FF00] text-[#1a1c1c] border-2 border-[#1a1c1c] px-3 py-1 rounded-full text-xs font-black uppercase shadow-[2px_2px_0px_0px_#111111]">
        VERIFIED
      </span>
    </div>
  );
}
