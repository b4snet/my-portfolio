import React from 'react';
import { motion, useReducedMotion } from 'motion/react';

export const HeroSection: React.FC = () => {
  const shouldReduceMotion = useReducedMotion();

  const marqueeItems = [
    'DIPSON BASNET',
    'DIPSON BASNET',
    'DIPSON BASNET',
    'DIPSON BASNET',
    'DIPSON BASNET',
    'DIPSON BASNET',
  ];

  return (
    <section
      id="hero"
      className="relative w-full bg-[#f5f5f7] p-[14px] select-none"
    >
      {/* Inset Rounded Hero Frame */}
      <div className="relative w-full h-[calc(100svh-28px)] min-h-[calc(100svh-28px)] rounded-[28px] overflow-hidden bg-[#5b6066] text-[#f5f5f7] flex flex-col justify-end">
        {/* Layer 1: Giant Scrolling Name in Inter Tight (BEHIND the photo) */}
        <div className="absolute inset-x-0 top-[40%] sm:top-[42%] md:top-[44%] -translate-y-1/2 z-0 pointer-events-none overflow-hidden whitespace-nowrap">
          <div className={`flex items-center ${shouldReduceMotion ? 'overflow-x-hidden' : 'animate-marquee-seamless-slow'}`}>
            {marqueeItems.concat(marqueeItems).map((name, index) => (
              <span
                key={index}
                className="text-[18vw] sm:text-[19vw] lg:text-[20vw] font-semibold uppercase tracking-[-0.03em] text-[#f5f5f7]/85 leading-none px-6 sm:px-12 select-none"
                style={{ fontFamily: "'Inter Tight', Inter, system-ui, sans-serif" }}
              >
                {name}
              </span>
            ))}
          </div>
        </div>

        {/* Layer 2: Enlarged Cutout clearing the notched nav panel, never cropped */}
        <div className="relative z-10 w-full h-full flex items-end justify-center pointer-events-none pb-4 pt-[64px] min-[900px]:pt-[76px]">
          <motion.img
            initial={shouldReduceMotion ? false : { opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.8, ease: [0.28, 0.11, 0.32, 1] }}
            src="/assets/aistudio/DIPRr._s_ddc12349.png"
            alt="Dipson Basnet seated portrait"
            className="h-[92%] sm:h-[93%] lg:h-[95%] max-h-full w-auto max-w-[96%] object-contain object-bottom drop-shadow-[0_20px_45px_rgba(0,0,0,0.5)]"
            referrerPolicy="no-referrer"
          />
        </div>
      </div>
    </section>
  );
};
