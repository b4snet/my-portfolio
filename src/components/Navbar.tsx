import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useReducedMotion } from 'motion/react';

interface NavbarProps {
  onContactClick?: () => void;
}

interface NavItem {
  label: string;
  href: string;
  targetId: string;
  fallbackId?: string;
}

const PRIMARY_LINKS: NavItem[] = [
  { label: 'About', href: '#about', targetId: 'about' },
  { label: 'Interests', href: '#interests', targetId: 'interests' },
  { label: 'Academics', href: '#academics', targetId: 'academics' },
];

const MORE_LINKS: NavItem[] = [
  { label: 'Skills', href: '#skills', targetId: 'skills' },
  { label: 'Achievements', href: '#achievements', targetId: 'achievements' },
  { label: 'Research', href: '#research', targetId: 'research', fallbackId: 'interests' },
  { label: 'Project', href: '#project', targetId: 'project', fallbackId: 'skills' },
  { label: 'Hobbies', href: '#hobbies', targetId: 'hobbies' },
];

const MOBILE_LINKS: NavItem[] = [
  { label: 'About', href: '#about', targetId: 'about' },
  { label: 'Interests', href: '#interests', targetId: 'interests' },
  { label: 'Academics', href: '#academics', targetId: 'academics' },
  { label: 'Skills', href: '#skills', targetId: 'skills' },
  { label: 'Achievements', href: '#achievements', targetId: 'achievements' },
  { label: 'Research', href: '#research', targetId: 'research', fallbackId: 'interests' },
  { label: 'Project', href: '#project', targetId: 'project', fallbackId: 'skills' },
  { label: 'Hobbies', href: '#hobbies', targetId: 'hobbies' },
  { label: 'Contact', href: '#contact', targetId: 'contact' },
];

const OBSERVED_SECTION_IDS = [
  'hero',
  'about',
  'interests',
  'academics',
  'skills',
  'achievements',
  'hobbies',
  'contact',
];

export const Navbar: React.FC<NavbarProps> = ({ onContactClick }) => {
  const shouldReduceMotion = useReducedMotion();
  const [moreOpen, setMoreOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isDetached, setIsDetached] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('');
  const [cornerTop, setCornerTop] = useState<number>(14);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const moreButtonRef = useRef<HTMLButtonElement>(null);
  const mobileMenuButtonRef = useRef<HTMLButtonElement>(null);
  const mobileSheetRef = useRef<HTMLDivElement>(null);
  const mobileCloseButtonRef = useRef<HTMLButtonElement>(null);

  const lastScrollYRef = useRef(0);
  const lastScrollTimeRef = useRef(0);

  // Observe Hero section to switch between attached notched tab and detached floating bar
  useEffect(() => {
    const heroEl = document.getElementById('hero');
    if (!heroEl) return;

    const heroObserver = new IntersectionObserver(
      ([entry]) => {
        const pastHero = !entry.isIntersecting && entry.boundingClientRect.top < 0;
        setIsDetached(pastHero);
      },
      {
        threshold: 0.05,
        rootMargin: '-60px 0px 0px 0px',
      }
    );

    heroObserver.observe(heroEl);
    return () => heroObserver.disconnect();
  }, []);

  // Observe main sections for active section underline
  useEffect(() => {
    const elements = OBSERVED_SECTION_IDS
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);

    if (elements.length === 0) return;

    const sectionObserver = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

        if (visible.length > 0) {
          const topId = visible[0].target.id;
          setActiveSection(topId === 'hero' ? '' : topId);
        }
      },
      {
        rootMargin: '-35% 0px -45% 0px',
        threshold: [0.05, 0.2, 0.5],
      }
    );

    elements.forEach((el) => sectionObserver.observe(el));
    return () => sectionObserver.disconnect();
  }, []);

  // Scroll listener: update concave corner top offset + fast downward scroll hide / show on scroll up
  useEffect(() => {
    lastScrollYRef.current = window.scrollY;
    lastScrollTimeRef.current = performance.now();

    const onScroll = () => {
      const currentY = window.scrollY;
      const now = performance.now();
      const deltaY = currentY - lastScrollYRef.current;
      const deltaTime = Math.max(1, now - lastScrollTimeRef.current);
      const velocity = deltaY / deltaTime; // px per ms

      // Keep inverse corners aligned with hero's top 14px inset margin
      const nextCornerTop = Math.max(0, 14 - currentY);
      setCornerTop(nextCornerTop);

      if (moreOpen || mobileOpen || shouldReduceMotion) {
        setIsHidden(false);
      } else if (currentY <= 80) {
        setIsHidden(false);
      } else if (deltaY < -4) {
        // Scrolling up: reveal immediately
        setIsHidden(false);
      } else if (isDetached && (velocity > 0.45 || deltaY > 24)) {
        // Fast downward scroll past hero: hide bar
        setIsHidden(true);
      }

      lastScrollYRef.current = currentY;
      lastScrollTimeRef.current = now;
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [isDetached, moreOpen, mobileOpen, shouldReduceMotion]);

  // Never hide nav while dropdown or mobile menu is open
  useEffect(() => {
    if (moreOpen || mobileOpen) {
      setIsHidden(false);
    }
  }, [moreOpen, mobileOpen]);

  // Close More dropdown on outside click or Escape
  useEffect(() => {
    if (!moreOpen) return;

    const handlePointerDown = (e: PointerEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setMoreOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMoreOpen(false);
        moreButtonRef.current?.focus();
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [moreOpen]);

  // Lock body scroll and trap focus inside mobile sheet
  useEffect(() => {
    if (!mobileOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // Focus close button on open
    const focusTimer = window.setTimeout(() => {
      mobileCloseButtonRef.current?.focus();
    }, 20);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        setMobileOpen(false);
        mobileMenuButtonRef.current?.focus();
        return;
      }

      if (e.key === 'Tab' && mobileSheetRef.current) {
        const focusables = mobileSheetRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        if (focusables.length === 0) return;

        const first = focusables[0];
        const last = focusables[focusables.length - 1];

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      window.clearTimeout(focusTimer);
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [mobileOpen]);

  const scrollToTarget = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>, item: NavItem) => {
      e.preventDefault();
      const target =
        document.getElementById(item.targetId) ||
        (item.fallbackId ? document.getElementById(item.fallbackId) : null);

      if (target) {
        const navOffset = window.innerWidth >= 900 ? 88 : 76;
        const top = target.getBoundingClientRect().top + window.scrollY - navOffset;
        window.scrollTo({
          top: Math.max(0, top),
          behavior: shouldReduceMotion ? 'auto' : 'smooth',
        });
      }

      setMoreOpen(false);
      setMobileOpen(false);
    },
    [shouldReduceMotion]
  );

  const handleBrandClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    window.scrollTo({
      top: 0,
      behavior: shouldReduceMotion ? 'auto' : 'smooth',
    });
    setMoreOpen(false);
    setMobileOpen(false);
  };

  const handleGetInTouchClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    setMoreOpen(false);
    setMobileOpen(false);
    if (onContactClick) {
      onContactClick();
      return;
    }
    const contactEl = document.getElementById('contact');
    if (contactEl) {
      const navOffset = window.innerWidth >= 900 ? 88 : 76;
      const top = contactEl.getBoundingClientRect().top + window.scrollY - navOffset;
      window.scrollTo({
        top: Math.max(0, top),
        behavior: shouldReduceMotion ? 'auto' : 'smooth',
      });
    }
  };

  const linkBaseClass =
    'text-[15px] font-medium text-[#1d1d1f] hover:text-[#6e6e73] focus-visible:text-[#6e6e73] transition-colors duration-[250ms] whitespace-nowrap focus-visible:outline-2 focus-visible:outline-[#111111] focus-visible:outline-offset-2';

  const isMoreSectionActive = MORE_LINKS.some(
    (item) => activeSection === item.targetId || (item.fallbackId && activeSection === item.fallbackId && !document.getElementById(item.targetId))
  );

  return (
    <>
      <header className="relative z-50">
        {/* Desktop & Mobile Floating/Notched Nav Panel */}
        <div
          className={`nav-panel px-[20px] min-[900px]:px-[28px] ${
            isDetached ? 'nav-panel--detached' : ''
          } ${isHidden ? 'nav-panel--hidden' : ''}`}
          style={{ '--nav-corner-top': `${cornerTop}px` } as React.CSSProperties}
        >
          <nav
            aria-label="Main"
            className="w-full h-full flex items-center justify-between min-[900px]:grid min-[900px]:grid-cols-[1fr_auto_1fr] min-[900px]:items-center gap-4"
          >
            {/* Left Zone (Desktop): Primary links + More dropdown */}
            <div className="hidden min-[900px]:flex items-center gap-6">
              {PRIMARY_LINKS.map((item) => {
                const isActive = activeSection === item.targetId;
                return (
                  <a
                    key={item.label}
                    href={item.href}
                    onClick={(e) => scrollToTarget(e, item)}
                    aria-current={isActive ? 'location' : undefined}
                    className={`${linkBaseClass} ${
                      isActive ? 'underline decoration-[1px] underline-offset-[6px]' : ''
                    }`}
                  >
                    {item.label}
                  </a>
                );
              })}

              {/* More Dropdown Trigger */}
              <div ref={dropdownRef} className="relative flex items-center">
                <button
                  ref={moreButtonRef}
                  type="button"
                  aria-expanded={moreOpen}
                  aria-controls="nav-more-menu"
                  onClick={() => setMoreOpen((prev) => !prev)}
                  className={`${linkBaseClass} inline-flex items-center gap-1.5 cursor-pointer ${
                    isMoreSectionActive && !moreOpen
                      ? 'underline decoration-[1px] underline-offset-[6px]'
                      : ''
                  }`}
                >
                  <span>More</span>
                  <svg
                    width="10"
                    height="6"
                    viewBox="0 0 10 6"
                    fill="none"
                    aria-hidden="true"
                    className={`transition-transform duration-[250ms] ${
                      moreOpen ? 'rotate-180' : ''
                    }`}
                  >
                    <path
                      d="M1 1L5 5L9 1"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>

                {/* Dropdown Panel */}
                <div
                  id="nav-more-menu"
                  role="menu"
                  aria-label="More sections"
                  hidden={!moreOpen}
                  className={`absolute left-0 top-[calc(100%+14px)] min-w-[200px] bg-[#f5f5f7] border border-[#d2d2d7] rounded-[14px] p-[8px] flex flex-col ${
                    shouldReduceMotion
                      ? ''
                      : 'transition-all duration-[250ms] ease-[cubic-bezier(0.28,0.11,0.32,1)]'
                  } ${
                    moreOpen
                      ? 'opacity-100 translate-y-0 pointer-events-auto'
                      : 'opacity-0 -translate-y-[8px] pointer-events-none'
                  }`}
                >
                  {MORE_LINKS.map((item) => {
                    const isActive = activeSection === item.targetId;
                    return (
                      <a
                        key={item.label}
                        role="menuitem"
                        href={item.href}
                        onClick={(e) => scrollToTarget(e, item)}
                        tabIndex={moreOpen ? 0 : -1}
                        className={`block text-[15px] font-medium text-[#1d1d1f] hover:text-[#6e6e73] focus-visible:text-[#6e6e73] hover:bg-[#e8e8ed] focus-visible:bg-[#e8e8ed] px-[14px] py-[10px] transition-colors duration-[250ms] focus-visible:outline-2 focus-visible:outline-[#111111] focus-visible:outline-offset-[-2px] ${
                          isActive ? 'underline decoration-[1px] underline-offset-[6px]' : ''
                        }`}
                      >
                        {item.label}
                      </a>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Wordmark: Left on mobile (<900px), Centre on desktop (>=900px) */}
            <a
              href="#hero"
              onClick={handleBrandClick}
              className="text-[20px] font-semibold tracking-[-0.02em] text-[#1d1d1f] hover:text-[#6e6e73] focus-visible:text-[#6e6e73] transition-colors duration-[250ms] whitespace-nowrap justify-self-start min-[900px]:justify-self-center focus-visible:outline-2 focus-visible:outline-[#111111] focus-visible:outline-offset-2"
            >
              Dipson Basnet
            </a>

            {/* Right Zone (Desktop): Single "Get in touch" button */}
            <div className="hidden min-[900px]:flex items-center justify-self-end">
              <a
                href="#contact"
                onClick={handleGetInTouchClick}
                className="inline-flex items-center gap-2.5 bg-[#111111] hover:bg-[#2a2a2d] focus-visible:bg-[#2a2a2d] text-[#f5f5f7] text-[15px] font-medium px-[18px] py-[12px] rounded-[12px] transition-colors duration-[250ms] whitespace-nowrap focus-visible:outline-2 focus-visible:outline-[#111111] focus-visible:outline-offset-2"
              >
                <span>Get in touch</span>
                <span
                  aria-hidden="true"
                  className="w-[24px] h-[24px] rounded-full bg-white/[0.14] flex items-center justify-center shrink-0"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                  >
                    <path
                      d="M3.5 8H12.5M12.5 8L8.5 4M12.5 8L8.5 12"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
              </a>
            </div>

            {/* Mobile Right Control (<900px): Text "Menu" button only */}
            <button
              ref={mobileMenuButtonRef}
              type="button"
              aria-expanded={mobileOpen}
              aria-controls="mobile-nav-sheet"
              onClick={() => setMobileOpen(true)}
              className={`min-[900px]:hidden ${linkBaseClass} cursor-pointer`}
            >
              Menu
            </button>
          </nav>
        </div>
      </header>

      {/* Mobile Full-Screen Sheet (<900px) */}
      <div
        id="mobile-nav-sheet"
        ref={mobileSheetRef}
        role="dialog"
        aria-modal="true"
        aria-label="Mobile navigation"
        aria-hidden={!mobileOpen}
        className={`min-[900px]:hidden fixed inset-0 z-50 bg-[#f5f5f7] text-[#1d1d1f] flex flex-col justify-between p-[28px] ${
          shouldReduceMotion ? '' : 'transition-opacity duration-[300ms] ease-[cubic-bezier(0.28,0.11,0.32,1)]'
        } ${
          mobileOpen ? 'opacity-100 pointer-events-auto visible' : 'opacity-0 pointer-events-none invisible'
        }`}
      >
        {/* Top Row: Wordmark + Close Button */}
        <div className="flex items-center justify-between h-[44px]">
          <a
            href="#hero"
            onClick={handleBrandClick}
            tabIndex={mobileOpen ? 0 : -1}
            className="text-[20px] font-semibold tracking-[-0.02em] text-[#1d1d1f] hover:text-[#6e6e73] focus-visible:text-[#6e6e73] transition-colors duration-[250ms] focus-visible:outline-2 focus-visible:outline-[#111111] focus-visible:outline-offset-2"
          >
            Dipson Basnet
          </a>

          <button
            ref={mobileCloseButtonRef}
            type="button"
            onClick={() => {
              setMobileOpen(false);
              mobileMenuButtonRef.current?.focus();
            }}
            tabIndex={mobileOpen ? 0 : -1}
            className={`${linkBaseClass} cursor-pointer`}
          >
            Close
          </button>
        </div>

        {/* 9 Full-Height Mobile Links */}
        <nav aria-label="Mobile sections" className="my-auto py-6 flex flex-col gap-3 overflow-y-auto">
          {MOBILE_LINKS.map((item) => {
            const isActive = activeSection === item.targetId;
            return (
              <a
                key={item.label}
                href={item.href}
                onClick={(e) => scrollToTarget(e, item)}
                tabIndex={mobileOpen ? 0 : -1}
                className={`text-[32px] leading-[1.2] tracking-[-0.02em] font-medium text-[#1d1d1f] hover:text-[#6e6e73] focus-visible:text-[#6e6e73] transition-colors duration-[250ms] w-fit focus-visible:outline-2 focus-visible:outline-[#111111] focus-visible:outline-offset-2 ${
                  isActive ? 'underline decoration-[1px] underline-offset-[6px]' : ''
                }`}
              >
                {item.label}
              </a>
            );
          })}
        </nav>

        {/* Bottom CTA */}
        <div className="pt-4">
          <a
            href="#contact"
            onClick={handleGetInTouchClick}
            tabIndex={mobileOpen ? 0 : -1}
            className="w-full inline-flex items-center justify-between bg-[#111111] hover:bg-[#2a2a2d] focus-visible:bg-[#2a2a2d] text-[#f5f5f7] text-[15px] font-medium px-[18px] py-[12px] rounded-[12px] transition-colors duration-[250ms] focus-visible:outline-2 focus-visible:outline-[#111111] focus-visible:outline-offset-2"
          >
            <span>Get in touch</span>
            <span
              aria-hidden="true"
              className="w-[24px] h-[24px] rounded-full bg-white/[0.14] flex items-center justify-center shrink-0"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
              >
                <path
                  d="M3.5 8H12.5M12.5 8L8.5 4M12.5 8L8.5 12"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
          </a>
        </div>
      </div>
    </>
  );
};
