"use client";

import { motion, type HTMLMotionProps } from "motion/react";

type RevealProps = HTMLMotionProps<"div"> & {
  delay?: number;
  /** Render as a list item when the reveal sits inside an <ol>/<ul>. */
  as?: "div" | "li";
};

/**
 * Slow, cinematic rise-in on scroll. Honours reduced-motion via the app-level
 * <MotionConfig reducedMotion="user"> in providers.
 */
export function Reveal({
  delay = 0,
  as = "div",
  children,
  ...props
}: RevealProps) {
  // The div and li motion components share every prop this component uses;
  // the cast keeps the public prop type simple instead of unioning both
  // element prop sets.
  const MotionTag = (as === "li" ? motion.li : motion.div) as typeof motion.div;
  return (
    <MotionTag
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10% 0px" }}
      transition={{ duration: 0.8, delay, ease: [0.22, 1, 0.36, 0.16] }}
      {...props}
    >
      {children}
    </MotionTag>
  );
}
