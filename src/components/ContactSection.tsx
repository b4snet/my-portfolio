import React, { useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { Copy, Check, ArrowUpRight } from 'lucide-react';
import { useRevealMotion } from '../utils/useAnimationConfig';

export const ContactSection: React.FC = () => {
  const [copied, setCopied] = useState(false);
  const shouldReduceMotion = useReducedMotion();
  const headerMotion = useRevealMotion(0);
  const emailMotion = useRevealMotion(0.1);
  const email = 'dipsonbasnett0506@gmail.com';

  const copyEmail = () => {
    navigator.clipboard.writeText(email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  const socialLinks = [
    { name: 'LinkedIn', handle: 'dipsonbasnettt', url: 'https://www.linkedin.com/in/dipsonbasnettt/' },
    { name: 'GitHub', handle: 'b4snet', url: 'https://github.com/b4snet' },
    { name: 'Instagram', handle: 'dipsonbasnett', url: 'https://www.instagram.com/dipsonbasnett/' },
    { name: 'Facebook', handle: 'dipsonbasnettt', url: 'https://www.facebook.com/dipsonbasnettt' },
  ];

  return (
    <section
      id="contact"
      className="relative py-32 sm:py-40 lg:py-48 bg-[#f5f5f7] text-[#1d1d1f] overflow-hidden"
    >
      <div className="max-w-[980px] mx-auto px-6 sm:px-8">
        
        {/* Apple Centered Headline with Grey Supporting Line */}
        <motion.div
          {...headerMotion}
          className="text-center space-y-4 mb-24"
        >
          <span className="text-[12px] font-mono tracking-wider uppercase text-[#86868b] block">
            Get in touch
          </span>
          <h2 className="text-[52px] sm:text-[68px] lg:text-[84px] font-semibold tracking-[-0.03em] leading-[1.05] text-[#1d1d1f]">
            Contact.
          </h2>
          <p className="text-[19px] sm:text-[22px] lg:text-[24px] font-normal leading-[1.3] text-[#86868b] max-w-2xl mx-auto">
            Reach out directly via email or connect across verified social media profiles.
          </p>
        </motion.div>

        {/* Direct Email Focus (Apple Hero Block) */}
        <motion.div
          {...emailMotion}
          className="py-14 border-t border-[#d2d2d7] space-y-6 text-center sm:text-left"
        >
          <span className="text-[12px] font-mono tracking-wider uppercase text-[#86868b] block">
            Direct email
          </span>

          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-6">
            <a
              href={`mailto:${email}`}
              className="text-[26px] sm:text-[36px] lg:text-[42px] font-semibold tracking-[-0.03em] text-[#1d1d1f] hover:text-black hover:underline break-all"
            >
              {email}
            </a>

            <div className="flex items-center justify-center sm:justify-start gap-4">
              <button
                onClick={copyEmail}
                className="px-4 py-2 text-[13px] font-medium text-[#1d1d1f] bg-white border border-[#d2d2d7] hover:border-black/40 transition-all flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#86868b]"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy email'}</span>
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 text-[13px] font-mono text-[#86868b]">
            <span>Kathmandu, Nepal</span>
            <span aria-hidden="true">·</span>
            <span>Timezone: NPT (UTC+5:45)</span>
          </div>
        </motion.div>

        {/* Social Profiles (Ruled Apple List) */}
        <div className="space-y-4 pt-12 border-t border-[#d2d2d7]">
          <span className="text-[12px] font-mono tracking-wider uppercase text-[#86868b] block text-center sm:text-left">
            Online profiles
          </span>

          <div className="divide-y divide-[#d2d2d7]">
            {socialLinks.map((link, idx) => (
              <motion.a
                key={link.name}
                href={link.url}
                target="_blank"
                rel="noreferrer"
                initial={shouldReduceMotion ? false : { opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.8, ease: [0.28, 0.11, 0.32, 1], delay: idx * 0.08 }}
                className="py-5 flex items-center justify-between group hover:px-2 transition-all"
              >
                <div className="flex items-center gap-4">
                  <span className="text-[18px] sm:text-[20px] font-semibold text-[#1d1d1f] group-hover:underline">
                    {link.name}
                  </span>
                  <span className="text-[13px] font-mono text-[#86868b]">
                    @{link.handle}
                  </span>
                </div>
                <ArrowUpRight className="w-4 h-4 text-[#86868b] group-hover:text-black group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
              </motion.a>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};
