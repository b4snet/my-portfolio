import React from 'react';
import { motion } from 'motion/react';
import { useRevealMotion } from '../utils/useAnimationConfig';

export const AboutSection: React.FC = () => {
  const headerMotion = useRevealMotion(0);
  const contentMotion = useRevealMotion(0.15);

  return (
    <section
      id="about"
      className="relative py-32 sm:py-40 lg:py-48 bg-[#f5f5f7] text-[#1d1d1f] overflow-hidden"
    >
      <div className="max-w-[980px] mx-auto px-6 sm:px-8 text-center">
        
        {/* Apple Centered Headline with Grey Supporting Line */}
        <motion.div {...headerMotion} className="space-y-4 mb-20">
          <span className="text-[12px] font-mono tracking-wider uppercase text-[#86868b] block">
            Personal background
          </span>
          <h2 className="text-[52px] sm:text-[68px] lg:text-[84px] font-semibold tracking-[-0.03em] leading-[1.05] text-[#1d1d1f]">
            About me.
          </h2>
          <p className="text-[19px] sm:text-[22px] lg:text-[24px] font-normal leading-[1.3] text-[#86868b] max-w-2xl mx-auto">
            18-year-old student, researcher, and neuroscience enthusiast born and raised in Kathmandu, Nepal.
          </p>
        </motion.div>

        {/* Focused Reading Paragraphs (Left) + Larger Circular Portrait (Right) */}
        <motion.div
          {...contentMotion}
          className="max-w-[880px] mx-auto flex flex-col-reverse md:flex-row items-center md:items-center justify-between gap-10 sm:gap-14 text-left text-[17px] sm:text-[19px] lg:text-[21px] leading-[1.4] text-[#1d1d1f]"
        >
          <div className="space-y-8 flex-1">
            <p className="font-normal">
              I was born and raised in Kathmandu, Nepal, and I’m an 18-year-old neuroscience enthusiast. 
              I’m interested in how biological neural systems work, particularly neural plasticity and cognitive architecture.
            </p>

            <p className="font-normal text-[#86868b]">
              Outside neuroscience and AI, I read about archaeology: excavation findings, early tool use, and prehistoric cultural change. 
              I’m interested in how those developments relate to the way our brains works.
            </p>
          </div>

          <div className="w-56 h-56 sm:w-64 sm:h-64 md:w-72 md:h-72 rounded-full overflow-hidden border border-[#d2d2d7] bg-[#d2d2d7]/30 shrink-0">
            <img
              src="/assets/aistudio/image_7d8d219d.png"
              alt="Dipson Basnet"
              className="w-full h-full object-cover object-[50%_15%] scale-[1.12]"
              referrerPolicy="no-referrer"
            />
          </div>
        </motion.div>

      </div>
    </section>
  );
};
