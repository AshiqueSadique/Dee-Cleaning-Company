import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

let initialized = false;

export function initGSAP() {
  if (initialized) return;
  initialized = true;

  gsap.registerPlugin(ScrollTrigger);

  // Respect prefers-reduced-motion
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (prefersReducedMotion) {
    // Set all GSAP animations to their end state immediately
    gsap.globalTimeline.timeScale(1000);
    return;
  }
}

export function getReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function fadeUpStagger(
  elements: string | Element | Element[],
  options: {
    stagger?: number;
    delay?: number;
    duration?: number;
    scrollTrigger?: ScrollTrigger.Vars;
    y?: number;
  } = {}
) {
  if (getReducedMotion()) {
    gsap.set(elements, { opacity: 1, y: 0 });
    return;
  }

  const {
    stagger = 0.08,
    delay = 0,
    duration = 0.7,
    scrollTrigger,
    y = 20,
  } = options;

  gsap.fromTo(
    elements,
    { opacity: 0, y },
    {
      opacity: 1,
      y: 0,
      duration,
      delay,
      stagger,
      ease: 'power2.out',
      scrollTrigger,
    }
  );
}

export { gsap, ScrollTrigger };
