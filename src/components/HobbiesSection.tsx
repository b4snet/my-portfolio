import React from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { useRevealMotion } from '../utils/useAnimationConfig';

export const HobbiesSection: React.FC = () => {
  const shouldReduceMotion = useReducedMotion();
  const headerMotion = useRevealMotion(0);
  const bucketListHeaderMotion = useRevealMotion(0);

  const hobbies = [
    {
      num: '01',
      title: 'Riding',
      category: 'Two-Wheeler & Mountain Ridges',
      description: 'Riding across the mountain passes and scenic hillside routes of Kathmandu Valley. Sharpening spatial anticipation, motor reflexes, and open-road perspective.'
    },
    {
      num: '02',
      title: 'Running',
      category: '5K & Cardio Endurance',
      description: 'Regular 5K road runs and community endurance races. Fostering cardiovascular stamina, focus, and mental discipline for demanding academic study.'
    },
    {
      num: '03',
      title: 'Playing guitar',
      category: 'Acoustic & Rhythm',
      description: 'Playing acoustic guitar and exploring fingerstyle melodies. Practicing bimanual hand coordination and the sensory-motor rhythm of music.'
    },
    {
      num: '04',
      title: 'Archaeological facts & modern connection',
      category: 'Human Origins & Evolutionary Mind',
      description: 'Reading about ancient excavation findings, cranial fossil evolution, and prehistoric hominid societies—linking ancestral adaptations to modern neuroscience and human nature.'
    }
  ];

  const bucketList = [
    {
      id: 'ironman',
      title: 'Trailathon Ironman',
      status: 'Ultimate endurance goal'
    },
    {
      id: 'isle-of-man-tt',
      title: 'Isle Man of TT',
      status: 'Ultimate road racing goal'
    }
  ];

  return (
    <section
      id="hobbies"
      className="relative py-32 sm:py-40 lg:py-48 bg-[#000000] text-[#f5f5f7] overflow-hidden"
    >
      <div className="max-w-[980px] mx-auto px-6 sm:px-8">
        
        {/* Apple Centered Headline with Grey Supporting Line */}
        <motion.div
          {...headerMotion}
          className="text-center space-y-4 mb-24"
        >
          <span className="text-[12px] font-mono tracking-wider uppercase text-[#86868b] block">
            Personal pursuits
          </span>
          <h2 className="text-[52px] sm:text-[68px] lg:text-[84px] font-semibold tracking-[-0.03em] leading-[1.05] text-[#f5f5f7]">
            Hobbies.
          </h2>
          <p className="text-[19px] sm:text-[22px] lg:text-[24px] font-normal leading-[1.3] text-[#86868b] max-w-2xl mx-auto">
            What I love doing in my free time to stay energized, creative, and physically active.
          </p>
        </motion.div>

        {/* Hobbies Ruled Breakdown */}
        <div className="border-t border-[#333336] divide-y divide-[#333336] mb-32">
          {hobbies.map((item, idx) => (
            <motion.div
              key={item.num}
              initial={shouldReduceMotion ? false : { opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.8, ease: [0.28, 0.11, 0.32, 1], delay: idx * 0.08 }}
              className="py-10 grid grid-cols-1 md:grid-cols-12 gap-6 items-baseline"
            >
              <div className="md:col-span-5 space-y-1">
                <div className="flex items-center gap-3">
                  <span className="text-[12px] font-mono text-[#86868b]">
                    {item.num}
                  </span>
                  <h3 className="text-[22px] sm:text-[26px] font-semibold tracking-[-0.02em] text-[#f5f5f7]">
                    {item.title}
                  </h3>
                </div>
                <span className="text-[13px] font-mono text-[#86868b] block pl-7">
                  {item.category}
                </span>
              </div>

              <div className="md:col-span-7 pl-7 md:pl-0">
                <p className="text-[16px] sm:text-[17px] leading-[1.4] text-[#86868b]">
                  {item.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bucket List (No descriptions, no tick marks) */}
        <div className="space-y-12">
          <motion.div
            {...bucketListHeaderMotion}
            className="space-y-2 text-center sm:text-left"
          >
            <span className="text-[12px] font-mono tracking-wider uppercase text-[#86868b] block">
              Personal milestones
            </span>
            <h3 className="text-[32px] sm:text-[40px] font-semibold tracking-[-0.02em] text-[#f5f5f7]">
              Bucket list.
            </h3>
          </motion.div>

          <div className="border-t border-[#333336] divide-y divide-[#333336]">
            {bucketList.map((item, idx) => (
              <motion.div
                key={item.id}
                initial={shouldReduceMotion ? false : { opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.8, ease: [0.28, 0.11, 0.32, 1], delay: idx * 0.1 }}
                className="py-8 grid grid-cols-1 md:grid-cols-12 gap-6 items-center"
              >
                <div className="md:col-span-8">
                  <h4 className="text-[20px] font-semibold text-[#f5f5f7]">
                    {item.title}
                  </h4>
                </div>

                <div className="md:col-span-4 flex items-center justify-start md:justify-end text-[12px] font-mono">
                  <span className="text-[#86868b]">{item.status}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};
