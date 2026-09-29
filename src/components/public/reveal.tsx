'use client'

import { motion, type HTMLMotionProps } from 'framer-motion'

type RevealFrom = 'up' | 'left' | 'right' | 'fade'

const offsets: Record<RevealFrom, { x?: number; y?: number }> = {
  up: { y: 24 },
  left: { x: -24 },
  right: { x: 24 },
  fade: {},
}

interface RevealProps extends HTMLMotionProps<'div'> {
  /** Seconds to wait once in view; pass (index % columns) * 0.08 to stagger a grid row */
  delay?: number
  from?: RevealFrom
}

/* ── Scroll Reveal ─────────────────────────────
   Fades its content in the first time it scrolls into view. The trigger line sits
   64px above the bottom edge, so a block taller than the screen (a product grid on
   a phone) still reveals as soon as its top shows. Hover/tap motion belongs on the
   child, not here, so the reveal delay never slows down a hover. */
export default function Reveal({ delay = 0, from = 'up', ...props }: RevealProps) {
  return (
    <motion.div
      initial={{ opacity: 0, ...offsets[from] }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, margin: '0px 0px -64px 0px' }}
      transition={{ duration: 0.6, delay, ease: [0.25, 0.1, 0.25, 1] }}
      {...props}
    />
  )
}
