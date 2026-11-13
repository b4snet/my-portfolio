import { useReducedMotion } from 'motion/react';

export function useRevealMotion(delay = 0) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return {
      initial: false,
      whileInView: { opacity: 1, y: 0 },
      viewport: { once: true },
      transition: { duration: 0 },
    };
  }

  return {
    initial: { opacity: 0, y: 24 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: '-60px' },
    transition: {
      duration: 0.8,
      ease: [0.28, 0.11, 0.32, 1] as const,
      delay,
    },
  };
}
