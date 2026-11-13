import React from 'react';
import { ArrowUp } from 'lucide-react';
import { motion } from 'motion/react';
import { useRevealMotion } from '../utils/useAnimationConfig';

export const Footer: React.FC = () => {
  const tilakMotion = useRevealMotion(0);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="relative bg-[#000000] text-[#86868b] border-t border-[#333336] pt-24 pb-16 overflow-hidden select-none">
      <div className="max-w-[980px] mx-auto px-6 sm:px-8 space-y-16">
        
        {/* Gaudiya Vaishnava Tilak & "HARE KRSNA" */}
        <motion.div
          {...tilakMotion}
          className="flex flex-col items-center justify-center text-center space-y-4 py-4"
        >
          {/* Authentic Gaudiya Vaishnava Tilak with golden pulsing divine glow */}
          <div className="relative group animate-tilak-glow cursor-pointer" title="Gaudiya Vaishnava Tilak">
            <svg
              width="36"
              height="72"
              viewBox="0 0 36 72"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="text-[#fbbf24] transition-all duration-300"
            >
              {/* Outer Urdhva Pundra arms in radiant gold */}
              <path
                d="M10 6 V44 C10 49 14 52 18 52 C22 52 26 49 26 44 V6"
                stroke="#fbbf24"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {/* Inner sacred space in soft golden amber */}
              <path
                d="M14 6 V41 C14 43.5 15.8 45.5 18 45.5 C20.2 45.5 22 43.5 22 41 V6"
                stroke="#f59e0b"
                strokeWidth="1.25"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeOpacity="0.75"
              />
              {/* Tulasi leaf base resting at the bridge of the nose */}
              <path
                d="M18 52 C15 57 13.5 61 18 68 C22.5 61 21 57 18 52 Z"
                fill="#fbbf24"
                stroke="#f59e0b"
                strokeWidth="1.2"
                strokeLinejoin="round"
              />
              <path
                d="M18 54 V64"
                stroke="#78350f"
                strokeWidth="1"
                strokeLinecap="round"
              />
            </svg>
          </div>

          {/* "HARE KRSNA" in all caps */}
          <div className="space-y-1">
            <span
              className="text-[20px] sm:text-[22px] font-semibold tracking-[0.3em] uppercase text-[#fbbf24] select-none block drop-shadow-[0_0_12px_rgba(251,191,36,0.45)]"
              style={{ fontFamily: "'Inter Tight', Inter, system-ui, sans-serif" }}
            >
              HARE KRSNA
            </span>
          </div>
        </motion.div>

        {/* Apple Clean Footer Meta & Copyright */}
        <div className="pt-8 border-t border-[#222225] flex flex-col sm:flex-row items-center justify-between gap-6 text-[12px] font-mono text-[#86868b]">
          <div className="flex items-center gap-3">
            <span className="text-[#f5f5f7]">Dipson Basnet</span>
            <span aria-hidden="true">·</span>
            <span>Kathmandu, Nepal</span>
          </div>

          <div className="flex items-center gap-6">
            <span>
              © {new Date().getFullYear()} Dipson Basnet. All rights reserved.
            </span>
            <button
              onClick={scrollToTop}
              className="flex items-center gap-1 text-[#f5f5f7] hover:underline"
              title="Return to top"
            >
              <span>Back to top</span>
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
};
