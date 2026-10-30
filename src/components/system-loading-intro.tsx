"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Camera, UserRound } from "lucide-react";

export function SystemLoadingIntro() {
  const pathname = usePathname();
  const reduceMotion = useReducedMotion();
  const [visible, setVisible] = useState(true);
  const previousPath = useRef<string | null>(null);

  useEffect(() => {
    if (previousPath.current === pathname && previousPath.current !== null) return;
    const isFirstLoad = previousPath.current === null;
    previousPath.current = pathname;
    setVisible(true);

    const duration = reduceMotion
      ? isFirstLoad ? 1200 : 450
      : isFirstLoad ? 3300 : 1050;
    const timer = window.setTimeout(() => setVisible(false), duration);
    return () => window.clearTimeout(timer);
  }, [pathname, reduceMotion]);

  const noMotion = Boolean(reduceMotion);

  return (
    <AnimatePresence>
      {visible && (
        <motion.section
          className="system-loading-intro"
          role="status"
          aria-label="Loading Berwa Photo Hub"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: noMotion ? 1 : 1.02 }}
          transition={{ duration: noMotion ? 0 : 0.4, ease: "easeInOut" }}
        >
          <div className="system-loading-glass">
            <div className="system-loading-art" aria-hidden="true">
              <motion.div
                className="system-loading-person"
                initial={noMotion ? false : { x: 150, opacity: 0, rotate: 8 }}
                animate={{ x: 0, opacity: 1, rotate: 0 }}
                transition={noMotion ? { duration: 0 } : { type: "spring", stiffness: 75, damping: 15, delay: 0.12 }}
              >
                <UserRound size={96} strokeWidth={1.35} />
              </motion.div>

              <motion.div
                className="system-loading-camera"
                initial={noMotion ? false : { x: -155, opacity: 0, rotate: -15 }}
                animate={{ x: 0, opacity: 1, rotate: 0 }}
                transition={noMotion ? { duration: 0 } : { type: "spring", stiffness: 82, damping: 14, delay: 0.08 }}
              >
                <Camera size={58} strokeWidth={1.6} />
              </motion.div>

              <motion.svg className="system-loading-arms" viewBox="0 0 240 150" fill="none">
                <motion.path
                  d="M104 82 91 64q-4-6 1-10t10 1l13 13m21 14 14-18q4-6 9-2t1 10l-17 24"
                  stroke="currentColor"
                  strokeWidth="5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  initial={noMotion ? false : { pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={noMotion ? { duration: 0 } : { duration: 0.42, delay: 0.86, ease: "easeOut" }}
                />
              </motion.svg>
              <motion.span
                className="system-loading-focus"
                initial={noMotion ? false : { scale: 0.6, opacity: 0 }}
                animate={noMotion ? { scale: 1, opacity: 0.35 } : { scale: [0.6, 1.12, 1], opacity: [0, 0.75, 0.35] }}
                transition={noMotion ? { duration: 0 } : { duration: 0.7, delay: 0.78, ease: "easeOut" }}
              />
            </div>

            <motion.h1
              className="system-loading-title"
              initial={noMotion ? false : { y: 12, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={noMotion ? { duration: 0 } : { duration: 0.5, delay: 1.02, ease: "easeOut" }}
            >
              Berwa Photo Hub
            </motion.h1>
            <motion.p
              className="system-loading-tagline"
              initial={noMotion ? false : { y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={noMotion ? { duration: 0 } : { duration: 0.48, delay: 1.23, ease: "easeOut" }}
            >
              Where Comfort Meets Sophistication
            </motion.p>
            <motion.span
              className="system-loading-caption"
              initial={noMotion ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={noMotion ? { duration: 0 } : { duration: 0.5, delay: 1.45 }}
            >
              YOUR STUDIO EXPERIENCE
            </motion.span>
          </div>
        </motion.section>
      )}
    </AnimatePresence>
  );
}
