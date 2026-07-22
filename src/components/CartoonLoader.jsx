import React, { useState, useEffect, useRef } from 'react';
import ben10Sound from '../assets/ben 10 sound.mp3';

const ALIEN_MESSAGES = [
  "TRANSFORMING INTO HEATBLAST...",
  "POWERING UP FOUR ARMS...",
  "SPEEDING UP WITH XLR8...",
  "OMNITRIX FULLY CHARGED!"
];

const OMNITRIX_MP3_URL = ben10Sound;
const OMNITRIX_FALLBACK_URL = ben10Sound;

export default function CartoonLoader({ isVisible = true, onFinish }) {
  const [msgIndex, setMsgIndex] = useState(0);
  // phase: 'watch' -> 'flash' -> 'fadeout'
  const [phase, setPhase] = useState('watch');
  const audioRef = useRef(null);
  const finishedRef = useRef(false);

  useEffect(() => {
    if (!isVisible) {
      setPhase('watch');
      finishedRef.current = false;
      return;
    }

    finishedRef.current = false;

    // Initialize Audio object with local MP3 and fallback URL
    const audio = new Audio(OMNITRIX_MP3_URL);
    audio.preload = 'auto';
    audioRef.current = audio;

    // Handle fallback if local audio fails
    audio.onerror = () => {
      if (audio.src !== OMNITRIX_FALLBACK_URL) {
        audio.src = OMNITRIX_FALLBACK_URL;
        audio.play().catch(() => {});
      }
    };

    // Cycle alien status text
    const textInterval = setInterval(() => {
      setMsgIndex((prev) => (prev + 1) % ALIEN_MESSAGES.length);
    }, 600);

    // Function to trigger end of splash at exact moment sound ends
    const finishSplash = () => {
      if (finishedRef.current) return;
      finishedRef.current = true;
      setPhase('fadeout');
      setTimeout(() => {
        if (onFinish) onFinish();
      }, 400);
    };

    // When audio finishes playing, end flash and show home page at the exact same instant!
    audio.onended = () => {
      finishSplash();
    };

    // Monitor timeupdate to trigger green flash screen for final portion of audio
    audio.ontimeupdate = () => {
      if (audio.duration && !isNaN(audio.duration)) {
        const remainingTime = audio.duration - audio.currentTime;
        // Trigger green flash when remaining audio time is <= 2.0 seconds
        if (remainingTime <= 2.0 && remainingTime > 0.3) {
          setPhase((prev) => (prev === 'watch' ? 'flash' : prev));
        }
      }
    };

    // Attempt audio playback
    audio.play().catch(() => {
      // Browser autoplay blocked until user gesture: fallback timers
    });

    // Safety fallback timers in case audio is blocked or interrupted (8.0 seconds total)
    const fallbackFlashTimer = setTimeout(() => {
      setPhase((prev) => (prev === 'watch' ? 'flash' : prev));
    }, 6200);

    const fallbackEndTimer = setTimeout(() => {
      finishSplash();
    }, 8000);

    return () => {
      clearInterval(textInterval);
      clearTimeout(fallbackFlashTimer);
      clearTimeout(fallbackEndTimer);
      if (audio) {
        audio.onended = null;
        audio.ontimeupdate = null;
        audio.pause();
        audio.currentTime = 0;
      }
    };
  }, [isVisible, onFinish]);

  // Unlocks and plays audio on user gesture if autoplay was initially restricted by browser
  const handleUserInteraction = () => {
    if (audioRef.current && audioRef.current.paused) {
      audioRef.current.play().catch(() => {});
    }
  };

  if (!isVisible) return null;

  /* ── GREEN FLASH PHASE ── */
  if (phase === 'flash' || phase === 'fadeout') {
    return (
      <div
        className="fixed inset-0 z-[999999] bg-[#00FF00] flex flex-col items-center justify-center text-[#000000] text-center select-none"
        style={{
          opacity: phase === 'fadeout' ? 0 : 1,
          transition: phase === 'fadeout' ? 'opacity 0.4s ease-in-out' : 'opacity 0.15s ease-in',
        }}
      >
        {/* Big Omnitrix Symbol */}
        <svg width="140" height="140" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="mb-6">
          <circle cx="100" cy="100" r="95" fill="#000000" stroke="#000000" strokeWidth="8" />
          <circle cx="100" cy="100" r="70" fill="#111111" stroke="#000000" strokeWidth="6" />
          <polygon points="100,100 68,60 132,60" fill="#00FF00" stroke="#000000" strokeWidth="3" />
          <polygon points="100,100 68,140 132,140" fill="#00FF00" stroke="#000000" strokeWidth="3" />
          <circle cx="100" cy="100" r="7" fill="#FFFFFF" />
        </svg>

        <h1 style={{ fontFamily: 'Impact, Arial Black, sans-serif', letterSpacing: '4px' }}
          className="text-6xl md:text-8xl font-black uppercase text-[#000000]">
          IT'S EATING TIME!
        </h1>
      </div>
    );
  }

  /* ── DARK WATCH PHASE ── */
  return (
    <div
      className="fixed inset-0 z-[999999] bg-[#000000] flex flex-col items-center justify-center p-6 text-center select-none"
      onClick={handleUserInteraction}
      onTouchStart={handleUserInteraction}
      onMouseMove={handleUserInteraction}
    >
      {/* Top badge — OMNITRIX INITIALIZING */}
      <div className="bg-[#00FF00] text-[#000000] border-2 border-[#000000] px-6 py-2 rounded-full font-black text-sm uppercase tracking-widest flex items-center gap-2 mb-10">
        <span className="material-symbols-outlined text-base font-black">watch</span>
        OMNITRIX INITIALIZING
      </div>

      {/* Omnitrix Watch Vector */}
      <svg
        width="200"
        height="230"
        viewBox="0 0 200 230"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="mb-10"
      >
        {/* Strap Top */}
        <path d="M70 10 H130 L125 45 H75 Z" fill="#00c853" stroke="#000000" strokeWidth="6" strokeLinejoin="round" />
        <rect x="85" y="10" width="30" height="22" fill="#000000" />

        {/* Strap Bottom */}
        <path d="M75 185 H125 L130 220 H70 Z" fill="#00c853" stroke="#000000" strokeWidth="6" strokeLinejoin="round" />
        <rect x="85" y="198" width="30" height="22" fill="#000000" />

        {/* Side Plungers */}
        <rect x="18" y="105" width="22" height="20" rx="4" fill="#888888" stroke="#000000" strokeWidth="5" />
        <rect x="160" y="105" width="22" height="20" rx="4" fill="#888888" stroke="#000000" strokeWidth="5" />

        {/* Watch Casing */}
        <path d="M40 75 C40 45 160 45 160 75 L172 115 L160 155 C160 185 40 185 40 155 L28 115 Z" fill="#00e65c" stroke="#000000" strokeWidth="7" strokeLinejoin="round" />

        {/* Corner Accents */}
        <path d="M48 65 L68 45 M152 65 L132 45 M48 165 L68 185 M152 165 L132 185" stroke="#000000" strokeWidth="5" strokeLinecap="round" />

        {/* Bezel Rings */}
        <circle cx="100" cy="115" r="54" fill="#777777" stroke="#000000" strokeWidth="6" />
        <circle cx="100" cy="115" r="45" fill="#444444" stroke="#000000" strokeWidth="5" />
        <circle cx="100" cy="115" r="37" fill="#000000" />

        {/* Pulsing Hourglass Symbol */}
        <g className="animate-pulse">
          <polygon points="100,115 71,83 129,83" fill="#00FF00" stroke="#000000" strokeWidth="4" />
          <polygon points="100,115 71,147 129,147" fill="#00FF00" stroke="#000000" strokeWidth="4" />
        </g>

        {/* Core */}
        <circle cx="100" cy="115" r="4" fill="#FFFFFF" />
      </svg>

      {/* Rotating alien message */}
      <p className="text-sm font-black uppercase tracking-widest text-[#00FF00] border-2 border-[#00FF00] px-6 py-2 rounded-2xl">
        {ALIEN_MESSAGES[msgIndex]}
      </p>
    </div>
  );
}
