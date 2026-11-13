import React from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { useRevealMotion } from '../utils/useAnimationConfig';

export const SkillsSection: React.FC = () => {
  const shouldReduceMotion = useReducedMotion();
  const headerMotion = useRevealMotion(0);

  const skillsList = [
    {
      num: '01',
      title: 'Research skills',
      category: 'Scientific Inquiry',
    },
    {
      num: '02',
      title: 'Data analytics',
      category: 'Computational Modeling',
    },
    {
      num: '03',
      title: 'Lab etiquette',
      category: 'Laboratory Operations',
    },
  ];

  return (
    <section
      id="skills"
      className="relative py-32 sm:py-40 lg:py-48 bg-[#000000] text-[#f5f5f7] overflow-hidden"
    >
      <div className="max-w-[980px] mx-auto px-6 sm:px-8">
        
        {/* Apple Centered Headline */}
        <motion.div {...headerMotion} className="text-center space-y-4 mb-20">
          <span className="text-[12px] font-mono tracking-wider uppercase text-[#86868b] block">
            Technical capabilities
          </span>
          <h2 className="text-[52px] sm:text-[68px] lg:text-[84px] font-semibold tracking-[-0.03em] leading-[1.05] text-[#f5f5f7]">
            Skills.
          </h2>
        </motion.div>

        {/* Clean Ruled Skill List */}
        <div className="border-t border-[#333336] divide-y divide-[#333336]">
          {skillsList.map((skill, idx) => (
            <motion.div
              key={skill.num}
              initial={shouldReduceMotion ? false : { opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={
                shouldReduceMotion
                  ? { duration: 0 }
                  : { duration: 0.8, ease: [0.28, 0.11, 0.32, 1], delay: idx * 0.1 }
              }
              className="py-10 px-6 -mx-6 transition-colors duration-300 hover:bg-[#111113]"
            >
              <div className="flex items-center gap-8 sm:gap-12">
                <span className="text-[32px] sm:text-[40px] font-light text-[#86868b] tabular-nums block">
                  {skill.num}.
                </span>

                <div>
                  <h3 className="text-[26px] sm:text-[34px] font-semibold tracking-[-0.02em] text-[#f5f5f7]">
                    {skill.title}
                  </h3>
                  <span className="text-[13px] font-mono text-[#86868b] block mt-0.5">
                    {skill.category}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
};
