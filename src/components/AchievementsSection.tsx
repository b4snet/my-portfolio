import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { CERTIFICATES, Certificate } from '../data/portfolioData';
import { X, ShieldCheck } from 'lucide-react';
import { useRevealMotion } from '../utils/useAnimationConfig';

export const AchievementsSection: React.FC = () => {
  const [selectedCert, setSelectedCert] = useState<Certificate | null>(null);
  const shouldReduceMotion = useReducedMotion();
  const headerMotion = useRevealMotion(0);

  useEffect(() => {
    if (!selectedCert) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedCert(null);
    };
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [selectedCert]);

  return (
    <section
      id="achievements"
      className="relative py-32 sm:py-40 lg:py-48 bg-[#f5f5f7] text-[#1d1d1f] overflow-hidden"
    >
      <div className="max-w-[980px] mx-auto px-6 sm:px-8">
        
        {/* Apple Centered Headline with Grey Supporting Line */}
        <motion.div
          {...headerMotion}
          className="text-center space-y-4 mb-24"
        >
          <span className="text-[12px] font-mono tracking-wider uppercase text-[#86868b] block">
            Verified credentials
          </span>
          <h2 className="text-[52px] sm:text-[68px] lg:text-[84px] font-semibold tracking-[-0.03em] leading-[1.05] text-[#1d1d1f]">
            Achievements.
          </h2>
          <p className="text-[19px] sm:text-[22px] lg:text-[24px] font-normal leading-[1.3] text-[#86868b] max-w-2xl mx-auto">
            Verified participation certificates in technology hackathons, community health initiatives, and endurance runs.
          </p>
        </motion.div>

        {/* Apple Clean List of Certificates (No heavy cards, ruled hairlines, pure Apple editorial presentation) */}
        <div className="border-t border-[#d2d2d7] divide-y divide-[#d2d2d7]">
          {CERTIFICATES.map((cert, idx) => (
            <motion.div
              key={cert.id}
              initial={shouldReduceMotion ? false : { opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.8, ease: [0.28, 0.11, 0.32, 1], delay: idx * 0.1 }}
              onClick={() => setSelectedCert(cert)}
              className="py-14 sm:py-16 grid grid-cols-1 md:grid-cols-12 gap-8 items-center cursor-pointer group select-none"
            >
              {/* Left Column: Image Preview Thumbnail */}
              <div className="md:col-span-5 aspect-[4/3] overflow-hidden bg-white border border-[#d2d2d7] group-hover:border-black/30 transition-all p-2 flex items-center justify-center">
                {cert.imageSrc && (
                  <img
                    src={cert.imageSrc}
                    alt={cert.title}
                    className="w-full h-full object-contain group-hover:scale-[1.02] transition-transform duration-300"
                    referrerPolicy="no-referrer"
                  />
                )}
              </div>

              {/* Right Column: Metadata & Details */}
              <div className="md:col-span-7 space-y-3">
                <div className="flex items-center gap-2 text-[12px] font-mono text-[#86868b]">
                  <span>{cert.category}</span>
                  <span aria-hidden="true">·</span>
                  <span>{cert.date}</span>
                </div>

                <h3 className="text-[26px] sm:text-[30px] font-semibold tracking-[-0.02em] leading-[1.15] text-[#1d1d1f] group-hover:text-black transition-colors">
                  {cert.title}
                </h3>

                <p className="text-[13px] font-mono text-[#86868b]">
                  {cert.issuer}
                </p>

                <p className="text-[16px] sm:text-[17px] leading-[1.4] text-[#86868b]">
                  {cert.description}
                </p>

                <div className="pt-2 flex items-center justify-between text-[13px] text-[#1d1d1f] group-hover:underline">
                  <span>{cert.venue}</span>
                  <span className="font-medium">Inspect document →</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

      </div>

      {/* Clean Fullscreen High-Resolution Certificate Modal rendered via Portal above Navbar */}
      {typeof document !== 'undefined' &&
        createPortal(
          <AnimatePresence>
            {selectedCert && (
              <div
                className="fixed inset-0 z-[120] flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-sm"
                onClick={() => setSelectedCert(null)}
              >
                <motion.div
                  initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.95 }}
                  transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.3, ease: [0.28, 0.11, 0.32, 1] }}
                  onClick={(e) => e.stopPropagation()}
                  className="bg-[#ffffff] text-[#1d1d1f] max-w-3xl w-full max-h-[92vh] overflow-y-auto p-6 sm:p-8 space-y-6 shadow-2xl relative"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between gap-4 border-b border-[#d2d2d7] pb-4">
                    <div className="space-y-1">
                      <span className="text-[11px] font-mono uppercase tracking-wider text-[#86868b] block">
                        {selectedCert.category} · {selectedCert.date}
                      </span>
                      <h3 className="text-[22px] sm:text-[26px] font-semibold tracking-[-0.02em] text-[#1d1d1f]">
                        {selectedCert.title}
                      </h3>
                      <p className="text-[13px] font-mono text-[#86868b]">
                        {selectedCert.issuer}
                      </p>
                    </div>
                    <button
                      onClick={() => setSelectedCert(null)}
                      className="p-1.5 hover:bg-neutral-100 text-[#86868b] hover:text-[#1d1d1f] transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#86868b]"
                      aria-label="Close modal"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Certificate Image View */}
                  {selectedCert.imageSrc && (
                    <div className="overflow-hidden bg-[#f5f5f7] p-2 border border-[#d2d2d7]">
                      <img
                        src={selectedCert.imageSrc}
                        alt={selectedCert.title}
                        className="w-full h-auto object-contain max-h-[55vh] mx-auto"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  )}

                  {/* Description */}
                  <div className="space-y-3 text-[15px] sm:text-[16px] leading-[1.4] text-[#86868b]">
                    <p>{selectedCert.description}</p>
                    <div className="text-[12px] font-mono text-[#1d1d1f] pt-1">
                      Venue: {selectedCert.venue}
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-4 border-t border-[#d2d2d7]">
                    <span className="text-[12px] font-mono text-[#86868b] flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      Verified credential of Dipson Basnet
                    </span>
                    <button
                      onClick={() => setSelectedCert(null)}
                      className="px-4 py-1.5 text-[13px] text-[#1d1d1f] hover:underline"
                    >
                      Close
                    </button>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </section>
  );
};
