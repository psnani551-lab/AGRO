import { Variants } from 'framer-motion';
import gsap from 'gsap';
import { useEffect, useState } from 'react';

// Framer Motion Variants
export const pageVariants: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

export const pageTransition = {
  duration: 0.3,
  ease: 'easeInOut',
};

export const fadeIn: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
};

export const slideUp: Variants = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
};

export const staggerContainer: Variants = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export const themeToggleVariants: Variants = {
  light: { rotate: 0, scale: 1 },
  dark: { rotate: 180, scale: 1 },
};

// GSAP Helper Functions
export const pulseAnimation = (element: HTMLElement) => {
  gsap.to(element, {
    scale: 1.05,
    duration: 0.1,
    yoyo: true,
    repeat: 1,
    ease: 'power2.inOut',
  });
};

export const hoverLift = {
  onMouseEnter: (element: HTMLElement) => {
    gsap.to(element, {
      y: -4,
      duration: 0.2,
      ease: 'power2.out',
    });
  },
  onMouseLeave: (element: HTMLElement) => {
    gsap.to(element, {
      y: 0,
      duration: 0.2,
      ease: 'power2.in',
    });
  },
};

export const scrollFadeIn = (element: HTMLElement) => {
  gsap.from(element, {
    opacity: 0,
    y: 50,
    duration: 0.8,
    scrollTrigger: {
      trigger: element,
      start: 'top 80%',
      toggleActions: 'play none none reverse',
    },
  });
};

// Reduced Motion Hook
export const useReducedMotion = () => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);

    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  return prefersReducedMotion;
};
