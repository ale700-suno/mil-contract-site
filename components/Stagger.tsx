"use client";

import { motion, type Variants } from "framer-motion";
import type { PropsWithChildren } from "react";

type StaggerProps = PropsWithChildren<{
  className?: string;
  once?: boolean;
  amount?: number;
  delayChildren?: number;
  staggerChildren?: number;
}>;

const containerVariants: Variants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0,
    },
  },
};

export function Stagger({
  children,
  className,
  once = true,
  amount = 0.22,
  delayChildren = 0,
  staggerChildren = 0.08,
}: StaggerProps) {
  return (
    <motion.div
      className={className}
      variants={containerVariants}
      initial="hidden"
      whileInView="show"
      viewport={{ once, amount }}
      transition={{ delayChildren, staggerChildren }}
    >
      {children}
    </motion.div>
  );
}

