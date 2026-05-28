"use client";

import {
  motion,
  useSpring,
  useMotionValue,
  useTransform,
  animate,
} from "framer-motion";
import { useCallback, useEffect, useRef, type CSSProperties, type PointerEvent } from "react";

export type DocumentSize =
  | "xl"
  | "large"
  | "medium"
  | "smallMed"
  | "small"
  | "xsmall";

const sizeClasses: Record<DocumentSize, string> = {
  xl: "h-[208px] sm:h-[248px] md:h-[262px] max-w-[min(100%,330px)]",
  large: "h-[214px] sm:h-[254px] md:h-[268px] max-w-[min(100%,330px)]",
  medium: "h-[138px] sm:h-[162px] max-w-[min(100%,250px)]",
  smallMed: "h-[110px] sm:h-[128px] max-w-[min(100%,215px)]",
  small: "h-[84px] sm:h-[96px] max-w-[min(100%,185px)]",
  xsmall: "h-[54px] sm:h-[64px] max-w-[min(100%,108px)]",
};

const MOBILE_YAWS = [0, 58, -58] as const;
const HOVER_YAW_MULT = 62;
const HOVER_PITCH_MULT = 14;

function pngAlphaMaskStyle(src: string): CSSProperties {
  return {
    WebkitMaskImage: `url("${src}")`,
    maskImage: `url("${src}")`,
    WebkitMaskSize: "100% 100%",
    maskSize: "100% 100%",
    WebkitMaskRepeat: "no-repeat",
    maskRepeat: "no-repeat",
    WebkitMaskPosition: "center",
    maskPosition: "center",
  } as CSSProperties;
}

type DocumentCardProps = {
  title: string;
  img: string;
  size: DocumentSize;
};

export function DocumentCard({ title, img, size }: DocumentCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isCoarseRef = useRef(false);
  const mobileStepRef = useRef(0);

  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);
  const springRotateX = useSpring(rotateX, { stiffness: 160, damping: 16 });
  const springRotateY = useSpring(rotateY, { stiffness: 160, damping: 16 });

  const glareX = useMotionValue(0);
  const glareOpacity = useTransform(glareX, [0, 0.5, 1], [0.2, 0.65, 0.2]);
  const glareLeft = useTransform(glareX, (v) => `${-30 + v * 130}%`);
  const maskStyle = pngAlphaMaskStyle(img);

  useEffect(() => {
    const mq = window.matchMedia("(hover: none), (pointer: coarse)");
    const apply = () => {
      isCoarseRef.current = mq.matches;
    };
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  useEffect(() => {
    const loop = animate(glareX, [0, 1, 0], {
      duration: 3.2,
      ease: "easeInOut",
      repeat: Infinity,
      repeatDelay: 0.45,
    });
    return () => loop.stop();
  }, [glareX]);

  const resetTilt = useCallback(() => {
    rotateX.set(0);
    rotateY.set(0);
    mobileStepRef.current = 0;
  }, [rotateX, rotateY]);

  const handlePointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (isCoarseRef.current || e.pointerType === "touch") return;
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    rotateY.set(px * HOVER_YAW_MULT);
    rotateX.set(-py * HOVER_PITCH_MULT);
  };

  const handlePointerLeave = () => {
    if (isCoarseRef.current) return;
    resetTilt();
  };

  const handlePointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === "mouse" && !isCoarseRef.current) return;

    mobileStepRef.current =
      (mobileStepRef.current + 1) % MOBILE_YAWS.length;
    const yaw = MOBILE_YAWS[mobileStepRef.current];
    rotateY.set(yaw);
    rotateX.set(yaw === 0 ? 0 : yaw > 0 ? -4 : 4);
  };

  return (
    <div
      className="flex flex-col items-center text-center pointer-events-auto touch-manipulation"
      data-ui-interactive
    >
      <h3 className="text-lg sm:text-xl font-black mb-5 px-2">{title}</h3>
      <motion.div
        ref={ref}
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        onPointerDown={handlePointerDown}
        style={{
          rotateX: springRotateX,
          rotateY: springRotateY,
          transformPerspective: 700,
        }}
        className="relative w-full flex items-center justify-center [transform-style:preserve-3d] cursor-grab active:cursor-grabbing select-none"
      >
        <div className="relative inline-block max-w-full leading-none">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={img}
            alt={title}
            draggable={false}
            className={`block relative z-0 w-auto max-w-full object-contain object-center select-none drop-shadow-[0_22px_44px_rgba(0,0,0,0.5)] ${sizeClasses[size]}`}
          />

          <div
            className="pointer-events-none absolute inset-0 z-10 overflow-hidden"
            style={maskStyle}
            aria-hidden
          >
            <motion.div
              className="absolute inset-0"
              style={{ opacity: glareOpacity }}
            >
              <motion.div
                className="absolute -inset-y-4 w-[38%] bg-gradient-to-r from-transparent via-white/45 to-transparent skew-x-[-18deg]"
                style={{ left: glareLeft }}
              />
            </motion.div>

            <motion.div
              className="absolute inset-0"
              animate={{ opacity: [0.35, 0.85, 0.35] }}
              transition={{
                duration: 2.6,
                ease: "easeInOut",
                repeat: Infinity,
                repeatDelay: 1.1,
              }}
            >
              <motion.div
                className="absolute -inset-y-3 w-[26%] bg-gradient-to-r from-transparent via-white/25 to-transparent skew-x-[-14deg]"
                animate={{ left: ["-35%", "105%"] }}
                transition={{
                  duration: 2.6,
                  ease: "easeInOut",
                  repeat: Infinity,
                  repeatDelay: 1.1,
                }}
              />
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
