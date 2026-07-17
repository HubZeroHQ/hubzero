export const PUBLIC_MOTION = {
  duration: {
    press: 110,
    immediate: 200,
    considered: 400,
    exit: 200,
  },
  easing: {
    standard: [0.2, 0.8, 0.2, 1] as const,
    css: 'cubic-bezier(.2,.8,.2,1)',
  },
  settle: { y: 10 },
  press: { scale: 0.97 },
} as const;

export const PUBLIC_TRANSITIONS = {
  immediate: {
    duration: PUBLIC_MOTION.duration.immediate / 1000,
    ease: PUBLIC_MOTION.easing.standard,
  },
  considered: {
    duration: PUBLIC_MOTION.duration.considered / 1000,
    ease: PUBLIC_MOTION.easing.standard,
  },
  exit: {
    duration: PUBLIC_MOTION.duration.exit / 1000,
    ease: PUBLIC_MOTION.easing.standard,
  },
} as const;
