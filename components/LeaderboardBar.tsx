"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";

type LeaderboardBarProps = {
  score: number;
  delay?: number;
};

export function LeaderboardBar({ score, delay = 0 }: LeaderboardBarProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.25, margin: "-8% 0px" });

  return (
    <div ref={ref} className="mt-2 h-2 rounded-full bg-white/10 overflow-hidden">
      <motion.div
        animate={{
          width: inView ? `${score}%` : "0%",
          filter: inView ? "blur(0px)" : "blur(6px)",
        }}
        transition={{
          duration: 0.9,
          ease: [0.16, 1, 0.3, 1],
          delay: inView ? delay : 0,
        }}
        className="h-full rounded-full bg-gradient-to-r from-white/40 via-white/70 to-white/40"
      />
    </div>
  );
}
