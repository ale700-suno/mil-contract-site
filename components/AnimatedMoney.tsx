"use client";

import { animate, motion, useMotionValue, useTransform } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";

function formatRuble(amount: number) {
  return new Intl.NumberFormat("ru-RU").format(Math.round(amount)) + " ₽";
}

function parseMoneyText(input: string) {
  const match = input.match(/([\d\s]+)\s*₽/);
  const n = match ? Number(match[1].replaceAll(" ", "")) : null;
  const prefix =
    match && match.index! > 0 ? input.slice(0, match.index).trim() : "";
  const suffix = match ? input.slice(match.index! + match[0].length).trim() : "";
  return { value: n, prefix, suffix };
}

type AnimatedMoneyProps = {
  text: string;
  className?: string;
  duration?: number;
  startWhenVisible?: boolean;
};

export function AnimatedMoney({
  text,
  className,
  duration = 1.9,
  startWhenVisible = true,
}: AnimatedMoneyProps) {
  const { value, prefix, suffix } = useMemo(
    () => parseMoneyText(text),
    [text]
  );

  const ref = useRef<HTMLSpanElement | null>(null);
  const [inView, setInView] = useState(!startWhenVisible);

  const mv = useMotionValue(0);
  const formatted = useTransform(mv, (v) => formatRuble(v));

  useEffect(() => {
    if (!startWhenVisible) return;
    const el = ref.current;
    if (!el) return;

    const obs = new IntersectionObserver(
      (entries) => {
        setInView(entries[0]?.isIntersecting ?? false);
      },
      { threshold: 0.35 }
    );

    obs.observe(el);
    return () => obs.disconnect();
  }, [startWhenVisible]);

  useEffect(() => {
    if (!inView || value == null) {
      if (!inView) mv.set(0);
      return;
    }

    mv.set(0);

    const controls = animate(mv, value, {
      duration,
      ease: [0.16, 1, 0.3, 1],
    });

    return () => controls.stop();
  }, [duration, inView, mv, value]);

  if (value == null) {
    return <span className={className}>{text}</span>;
  }

  const showAnimated = inView || !startWhenVisible;

  return (
    <span ref={ref} className={className}>
      {prefix ? <span className="text-white/60">{prefix} </span> : null}
      <motion.span>
        {showAnimated ? formatted : formatRuble(0)}
      </motion.span>
      {suffix ? <span className="text-white/60"> {suffix}</span> : null}
    </span>
  );
}
