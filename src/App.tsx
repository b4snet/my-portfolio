/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { MotionConfig } from 'motion/react';
import { Navbar } from './components/Navbar';
import { BrainCanvas } from './components/BrainCanvas';
import { HeroSection } from './components/HeroSection';
import { AboutSection } from './components/AboutSection';
import { AreaOfInterestSection } from './components/AreaOfInterestSection';
import { AcademicsSection } from './components/AcademicsSection';
import { SkillsSection } from './components/SkillsSection';
import { AchievementsSection } from './components/AchievementsSection';
import { HobbiesSection } from './components/HobbiesSection';
import { ContactSection } from './components/ContactSection';
import { Footer } from './components/Footer';
import { KrishnaCharacter } from './components/KrishnaCharacter';
import { BackgroundMusic } from './components/BackgroundMusic';

export default function App() {
  const handleContactClick = () => {
    const el = document.getElementById('contact');
    if (el) {
      const navOffset = window.innerWidth >= 900 ? 88 : 76;
      const top = el.getBoundingClientRect().top + window.scrollY - navOffset;
      window.scrollTo({
        top: Math.max(0, top),
        behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
      });
    }
  };

  return (
    <MotionConfig reducedMotion="user">
      <div className="min-h-screen bg-[#000000] text-[#f5f5f7] selection:bg-[#1d1d1f] selection:text-white relative font-sans">

      {/* Skip to content accessibility link as first focusable element */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:bg-[#111111] focus:text-[#f5f5f7] focus:px-4 focus:py-2 focus:text-[14px] focus:font-medium focus:outline-2 focus:outline-[#f5f5f7] focus:outline-offset-2"
      >
        Skip to content
      </a>
      
      {/* 3D Brain Model: Pinned & Scroll-driven with lobe color luminescence */}
      <BrainCanvas />

      {/* Notched & Floating Navigation Bar */}
      <Navbar onContactClick={handleContactClick} />

      {/* Main Alternating Sections (Black #000 / Light Grey #f5f5f7) */}
      <main id="main-content" tabIndex={-1} className="relative z-10 outline-none">
        {/* Section 1: Hero (Studio Grey) */}
        <HeroSection />

        <div className="w-full h-[1px] bg-[#333336]" role="separator" />

        {/* Section 2: About Me (Light Grey #f5f5f7) */}
        <AboutSection />

        <div className="w-full h-[1px] bg-[#333336]" role="separator" />

        {/* Section 3: Area of Interest (Black #000) */}
        <AreaOfInterestSection />

        <div className="w-full h-[1px] bg-[#333336]" role="separator" />

        {/* Section 4: Academics (Light Grey #f5f5f7) */}
        <AcademicsSection />

        <div className="w-full h-[1px] bg-[#333336]" role="separator" />

        {/* Section 5: Skills (Black #000) */}
        <SkillsSection />

        <div className="w-full h-[1px] bg-[#333336]" role="separator" />

        {/* Section 6: Achievements (Light Grey #f5f5f7) */}
        <AchievementsSection />

        <div className="w-full h-[1px] bg-[#333336]" role="separator" />

        {/* Section 7: Hobbies & Bucket List (Black #000) */}
        <HobbiesSection />

        <div className="w-full h-[1px] bg-[#333336]" role="separator" />

        {/* Section 8: Contact (Light Grey #f5f5f7) */}
        <ContactSection />
      </main>

      {/* Section 9: Footer (Black #000) */}
      <Footer />

      {/* Interactive Lord Krishna Character in Right Bottom */}
      <KrishnaCharacter />

      {/* Continuous Meditative Background Music Synthesizer in Left Bottom */}
      <BackgroundMusic />

      </div>
    </MotionConfig>
  );
}
