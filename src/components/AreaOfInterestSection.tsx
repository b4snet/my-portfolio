import React from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { useRevealMotion } from '../utils/useAnimationConfig';

export const AreaOfInterestSection: React.FC = () => {
  const shouldReduceMotion = useReducedMotion();
  const headerMotion = useRevealMotion(0);

  const interests = [
    {
      index: '01',
      title: 'Neuroscience',
      subtitle: 'Neural plasticity and cognitive systems',
      description:
        'Captivated by how biological neural circuits process information, adapt through synaptic plasticity, and give rise to memory, perception, and human cognition.',
      currentlyReading:
        'Parkinson’s disease neuropathology, basal ganglia motor circuits, and how deep brain stimulation modulates abnormal neural activity.'
    },
    {
      index: '02',
      title: 'Artificial intelligence',
      subtitle: 'Bio-inspired computing and health science',
      description:
        'I’m interested in how neuroscience can inspire machine learning, particularly spiking neural networks and event-driven neuromorphic computing. The human brain runs on roughly 20 watts, and I want to understand what that efficiency could teach us about building more sustainable AI.',
      currentlyReading:
        'How AI is used in Parkinson’s disease research, from early detection and symptom monitoring to drug discovery and deep brain stimulation, and what it takes to move these tools from research into clinics.'
    },
    {
      index: '03',
      title: 'Human anatomy',
      subtitle: 'Structural neurobiology and physiological systems',
      description:
        'Studying the physical architecture of human physiology, structural neuroanatomy, cranial nerve pathways, and the bodily foundations that support nervous system function.',
      currentlyReading:
        'Functional human neuroanatomy, central nervous system pathways, and electrophysiological motor integration.'
    },
    {
      index: '04',
      title: 'Archaeology and evolution',
      subtitle: 'Ancient findings, present-day connections',
      description:
        'I study archaeological discoveries, fossil evidence, and prehistoric tools to understand how the expansion of the hominid brain shaped modern human cognition and behavior. I’m also interested in ancient medical texts, which show how early societies understood the body and disease.',
      currentlyReading:
        'The Sushruta Samhita, an ancient Sanskrit treatise on medicine and surgery, composed in layers from about 2,500 years ago. Its oldest known manuscript is in Kathmandu.'
    }
  ];

  return (
    <section
      id="interests"
      className="relative py-32 sm:py-40 lg:py-48 bg-[#000000] text-[#f5f5f7] overflow-hidden"
    >
      <div className="max-w-[980px] mx-auto px-6 sm:px-8">
        
        {/* Apple Centered Headline with Grey Supporting Line */}
        <motion.div {...headerMotion} className="text-center space-y-4 mb-24">
          <span className="text-[12px] font-mono tracking-wider uppercase text-[#86868b] block">
            Intellectual curiosities
          </span>
          <h2 className="text-[52px] sm:text-[68px] lg:text-[84px] font-semibold tracking-[-0.03em] leading-[1.05] text-[#f5f5f7]">
            Areas of interest.
          </h2>
          <p className="text-[19px] sm:text-[22px] lg:text-[24px] font-normal leading-[1.3] text-[#86868b] max-w-2xl mx-auto">
            The core research disciplines, biological inquiries, and ancient literature driving my studies.
          </p>
        </motion.div>

        {/* Apple Ruled Breakdown (No card boxes, no shadows, no gradients) */}
        <div className="border-t border-[#333336] divide-y divide-[#333336]">
          {interests.map((item, idx) => (
            <motion.div
              key={item.index}
              initial={shouldReduceMotion ? false : { opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.8, ease: [0.28, 0.11, 0.32, 1], delay: idx * 0.1 }}
              className="py-14 sm:py-16 grid grid-cols-1 md:grid-cols-12 gap-8 items-start"
            >
              {/* Left Column: Number & Title */}
              <div className="md:col-span-5 space-y-2">
                <span className="text-[12px] font-mono text-[#86868b] block">
                  {item.index}
                </span>
                <h3 className="text-[28px] sm:text-[34px] font-semibold tracking-[-0.02em] leading-[1.1] text-[#f5f5f7]">
                  {item.title}
                </h3>
                <p className="text-[15px] font-normal text-[#86868b]">
                  {item.subtitle}
                </p>
              </div>

              {/* Right Column: Description & Currently Reading */}
              <div className="md:col-span-7 space-y-5 text-[17px] sm:text-[19px] leading-[1.4] text-[#86868b]">
                <p className="text-[#f5f5f7]">
                  {item.description}
                </p>

                <div className="pt-4 border-t border-[#222225] space-y-1">
                  <span className="text-[11px] font-mono tracking-wider uppercase text-[#86868b] block">
                    Currently reading
                  </span>
                  <p className="text-[15px] leading-[1.4] text-[#86868b]">
                    {item.currentlyReading}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
};
