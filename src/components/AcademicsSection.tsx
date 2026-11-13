import React from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { useRevealMotion } from '../utils/useAnimationConfig';

export const AcademicsSection: React.FC = () => {
  const shouldReduceMotion = useReducedMotion();
  const headerMotion = useRevealMotion(0);

  const institutions = [
    {
      level: 'Grades 11 & 12',
      school: 'Reliance International Academy',
      period: 'Higher Secondary · Science Stream',
      location: 'Saraswati Nagar, Chabahil, Kathmandu',
      description: 'Science curriculum with rigorous focus on biology, chemistry, physics, and advanced mathematics, deepening analytical foundation in natural sciences.',
      logoSrc: '/assets/aistudio/image_e24decd3.png',
      logoAlt: 'Reliance International Academy logo',
    },
    {
      level: 'Grades 7 to 10',
      school: 'Samten Memorial Educational Academy',
      period: 'Secondary School',
      location: 'Kapan, Budhanilkantha, Kathmandu',
      description: 'Completed Secondary Education Examination (SEE) with strong scientific foundation and active involvement in literary and academic competitions.',
      logoSrc: '/assets/aistudio/image_2c93eefb.png',
      logoAlt: 'Samten Memorial Educational Academy logo',
    },
    {
      level: 'Grades 1 to 6',
      school: 'Valley Public Higher Secondary School',
      period: 'Primary & Middle School',
      location: 'Kathmandu, Nepal',
      description: 'Built foundational academic curiosity, language skills, environmental appreciation, and discipline in early natural sciences.',
      logoSrc: '/assets/aistudio/image_d11bbb08.png',
      logoAlt: 'Valley Public Higher Secondary School logo',
    },
    {
      level: 'Kindergarten',
      school: 'Creative Kids Pre-School',
      period: 'Early Childhood Education',
      location: 'Kathmandu, Nepal',
      description: 'Early childhood cognitive development, early creative learning, and curiosity-driven exploration.',
      logoSrc: '/assets/aistudio/Creative_Kids_Pre-School_67b18eca.png',
      logoAlt: 'Creative Kids Pre-School logo',
    }
  ];

  return (
    <section
      id="academics"
      className="relative py-32 sm:py-40 lg:py-48 bg-[#f5f5f7] text-[#1d1d1f] overflow-hidden"
    >
      <div className="max-w-[980px] mx-auto px-6 sm:px-8">
        
        {/* Apple Centered Headline */}
        <motion.div {...headerMotion} className="text-center space-y-4 mb-24">
          <span className="text-[12px] font-mono tracking-wider uppercase text-[#86868b] block">
            Educational journey
          </span>
          <h2 className="text-[52px] sm:text-[68px] lg:text-[84px] font-semibold tracking-[-0.03em] leading-[1.05] text-[#1d1d1f]">
            Academics.
          </h2>
        </motion.div>

        {/* Education Timeline (Borderless, Large Logos on Right Side) */}
        <div className="border-t border-[#d2d2d7] divide-y divide-[#d2d2d7]">
          {institutions.map((inst, idx) => (
            <motion.div
              key={inst.school}
              initial={shouldReduceMotion ? false : { opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.8, ease: [0.28, 0.11, 0.32, 1], delay: idx * 0.1 }}
              className="py-12 sm:py-14 grid grid-cols-1 md:grid-cols-12 gap-8 items-center"
            >
              <div className="md:col-span-4 space-y-1">
                <span className="text-[12px] font-mono text-[#86868b] block">
                  {inst.level}
                </span>
                <span className="text-[14px] text-[#86868b] block">
                  {inst.period}
                </span>
                <span className="text-[12px] font-mono text-[#86868b] block pt-2">
                  {inst.location}
                </span>
              </div>

              <div className="md:col-span-8 flex items-center justify-between gap-8">
                <div className="space-y-3 flex-1">
                  <h3 className="text-[24px] sm:text-[28px] font-semibold tracking-[-0.02em] leading-[1.15] text-[#1d1d1f]">
                    {inst.school}
                  </h3>
                  <p className="text-[17px] sm:text-[19px] leading-[1.4] text-[#86868b]">
                    {inst.description}
                  </p>
                </div>

                {/* Borderless Institution Logo on the right side */}
                <div className="w-28 h-28 sm:w-36 sm:h-36 shrink-0 flex items-center justify-center">
                  <img
                    src={inst.logoSrc}
                    alt={inst.logoAlt}
                    className="w-full h-full object-contain mix-blend-multiply"
                    referrerPolicy="no-referrer"
                  />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
};
