"use client";

import { motion, type Variants } from "framer-motion";
import type { ComponentPropsWithoutRef, PropsWithChildren } from "react";

type RevealProps = PropsWithChildren<{
  className?: string;
  delay?: number;
  once?: boolean;
  amount?: number;
}> &
  Omit<ComponentPropsWithoutRef<typeof motion.div>, "children">;

const itemVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 18,
    filter: "blur(10px)",
  },
  show: (delay: number) => ({
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      duration: 0.7,
      ease: [0.16, 1, 0.3, 1],
      delay,
    },
  }),
};

export function Reveal({
  children,
  className,
  delay = 0,
  once = true,
  amount = 0.22,
  ...rest
}: RevealProps) {
  return (
    <motion.div
      className={className}
      variants={itemVariants}
      initial="hidden"
      whileInView="show"
      viewport={{ once, amount }}
      custom={delay}
      {...rest}
    >
      {children}
    </motion.div>
  );
}
