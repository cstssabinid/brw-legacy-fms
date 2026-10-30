"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, Camera, UserRound } from "lucide-react";

export function LoginBrandIntro() {
  const [visible, setVisible] = useState(true);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const timer = window.setTimeout(() => setVisible(false), reduceMotion ? 1700 : 3400);
    return () => window.clearTimeout(timer);
  }, [reduceMotion]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.section
          className="staff-login-intro"
          aria-label="Berwa Photo Hub"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.02 }}
          transition={{ duration: reduceMotion ? 0 : 0.45, ease: "easeInOut" }}
        >
          <div className="staff-login-intro-glass">
            <Link href="/" className="staff-login-home staff-login-intro-home">
              <ArrowLeft size={15} aria-hidden="true" /> <span>Home</span>
            </Link>

            <div className="staff-login-intro-art" aria-hidden="true">
              <motion.div
                className="staff-login-intro-person"
                initial={reduceMotion ? false : { x: 150, opacity: 0, rotate: 8 }}
                animate={{ x: 0, opacity: 1, rotate: 0 }}
                transition={reduceMotion ? { duration: 0 } : { type: "spring", stiffness: 75, damping: 15, delay: 0.18 }}
              >
                <UserRound size={96} strokeWidth={1.35} />
              </motion.div>

              <motion.div
                className="staff-login-intro-camera"
                initial={reduceMotion ? false : { x: -155, opacity: 0, rotate: -15 }}
                animate={{ x: 0, opacity: 1, rotate: 0 }}
                transition={reduceMotion ? { duration: 0 } : { type: "spring", stiffness: 82, damping: 14, delay: 0.12 }}
              >
                <Camera size={58} strokeWidth={1.6} />
              </motion.div>

              <motion.svg className="staff-login-intro-arms" viewBox="0 0 240 150" fill="none">
                <motion.path
                  d="M104 82 91 64q-4-6 1-10t10 1l13 13m21 14 14-18q4-6 9-2t1 10l-17 24"
                  stroke="currentColor"
                  strokeWidth="5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  initial={reduceMotion ? false : { pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={reduceMotion ? { duration: 0 } : { duration: 0.42, delay: 1.02, ease: "easeOut" }}
                />
              </motion.svg>
              <motion.span
                className="staff-login-intro-focus"
                initial={reduceMotion ? false : { scale: 0.6, opacity: 0 }}
                animate={{ scale: [0.6, 1.12, 1], opacity: [0, 0.75, 0.35] }}
                transition={reduceMotion ? { duration: 0 } : { duration: 0.7, delay: 0.92, ease: "easeOut" }}
              />
            </div>

            <motion.h1
              className="staff-login-intro-title"
              initial={reduceMotion ? false : { y: 12, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={reduceMotion ? { duration: 0 } : { duration: 0.5, delay: 1.15, ease: "easeOut" }}
            >
              Berwa Photo Hub
            </motion.h1>
            <motion.p
              className="staff-login-intro-tagline"
              initial={reduceMotion ? false : { y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={reduceMotion ? { duration: 0 } : { duration: 0.48, delay: 1.4, ease: "easeOut" }}
            >
              Where Comfort Meets Sophistication
            </motion.p>
            <motion.span
              className="staff-login-intro-caption"
              initial={reduceMotion ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={reduceMotion ? { duration: 0 } : { duration: 0.5, delay: 1.65 }}
            >
              STAFF ACCESS
            </motion.span>
          </div>
        </motion.section>
      )}
    </AnimatePresence>
  );
}
