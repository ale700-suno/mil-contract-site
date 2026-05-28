"use client";

import { AnimatePresence, motion } from "framer-motion";
import type { PropsWithChildren } from "react";

type ModalProps = PropsWithChildren<{
  open: boolean;
  onClose: () => void;
  title?: string;
  maxWidthClassName?: string;
}>;

export function Modal({
  open,
  onClose,
  title,
  maxWidthClassName = "max-w-3xl",
  children,
}: ModalProps) {
  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-[350] flex items-end sm:items-center justify-center p-3 sm:p-6 pointer-events-auto bg-black/80 overflow-y-auto overscroll-contain"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.96, opacity: 0, y: 12 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.96, opacity: 0, y: 12 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className={
              "bg-black/92 backdrop-blur-xl border border-white/20 rounded-3xl w-full pointer-events-auto flex flex-col max-h-[min(92dvh,880px)] my-auto sm:my-0 " +
              maxWidthClassName
            }
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div className="flex-shrink-0 flex items-start gap-3 justify-between p-5 sm:p-6 pb-0 sm:pb-0 border-b border-white/10">
              {title ? (
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold pr-2 leading-tight">
                  {title}
                </h2>
              ) : (
                <div />
              )}
              <button
                type="button"
                onClick={onClose}
                className="flex-shrink-0 px-3 py-2 sm:px-4 sm:py-2 rounded-xl bg-white text-black text-sm font-semibold hover:scale-[1.02] transition"
              >
                Закрыть
              </button>
            </div>
            <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-5 sm:p-6 text-white/75 leading-relaxed text-sm sm:text-base">
              {children}
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
