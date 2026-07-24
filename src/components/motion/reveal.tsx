"use client";

import { motion, type HTMLMotionProps } from "motion/react";

type RevealProps = HTMLMotionProps<"div"> & { delay?: number };

/**
 * Slow, cinematic rise-in on scroll. Honours reduced-motion via the app-level
 * <MotionConfig reducedMotion="user"> in providers.
 */
export function Reveal({ delay = 0, children, ...props }: RevealProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10% 0px" }}
      transition={{ duration: 0.8, delay, ease: [0.22, 1, 0.36, 0.16] }}
      {...props}
    >
      {children}
    </motion.div>
  );
}
