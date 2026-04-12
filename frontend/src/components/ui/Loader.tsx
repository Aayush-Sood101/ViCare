"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const LOADING_PHRASES = [
  "Booting systems...",
  "Loading projects...",
  "Preparing interface...",
  "Almost there...",
];

const NAME = "ViCare";

interface LoaderProps {
  onComplete: () => void;
}

export function Loader({ onComplete }: LoaderProps) {
  const [progress, setProgress] = useState(0);
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [visible, setVisible] = useState(true);
  const [lettersVisible, setLettersVisible] = useState(0);

  // Letter-by-letter reveal
  useEffect(() => {
    const letterTimer = setInterval(() => {
      setLettersVisible((prev) => {
        if (prev >= NAME.length) {
          clearInterval(letterTimer);
          return prev;
        }
        return prev + 1;
      });
    }, 80);
    return () => clearInterval(letterTimer);
  }, []);

  // Rotating phrases
  useEffect(() => {
    const phraseTimer = setInterval(() => {
      setPhraseIndex((prev) => (prev + 1) % LOADING_PHRASES.length);
    }, 900);
    return () => clearInterval(phraseTimer);
  }, []);

  // Eased progress bar
  useEffect(() => {
    const intervals: ReturnType<typeof setInterval>[] = [];
    let current = 0;

    const tick = () => {
      current +=
        Math.random() * 8 +
        (current < 60 ? 4 : current < 85 ? 1.5 : 0.5);
      if (current >= 100) {
        current = 100;
        setProgress(100);
        setTimeout(() => {
          setVisible(false);
          setTimeout(onComplete, 700);
        }, 400);
        intervals.forEach(clearInterval);
        return;
      }
      setProgress(Math.min(current, 100));
    };

    const id = setInterval(tick, 80);
    intervals.push(id);
    return () => intervals.forEach(clearInterval);
  }, [onComplete]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#001e40]"
          exit={{ opacity: 0, scale: 1.04 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Background radial glow */}
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse 60% 40% at 50% 50%, rgba(0,96,172,0.2) 0%, transparent 70%)",
            }}
          />

          {/* Subtle grid pattern */}
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
              backgroundSize: "60px 60px",
            }}
          />

          {/* Name */}
          <div className="relative mb-12 overflow-hidden">
            <h1 className="text-[2.8rem] font-extrabold tracking-[0.25em] text-white md:text-[4rem]">
              {NAME.split("").map((char, i) => (
                <motion.span
                  key={i}
                  initial={{ opacity: 0, y: 12 }}
                  animate={
                    i < lettersVisible
                      ? { opacity: 1, y: 0 }
                      : { opacity: 0, y: 12 }
                  }
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  className="inline-block"
                  style={{ minWidth: char === " " ? "0.5em" : undefined }}
                >
                  {char}
                </motion.span>
              ))}
            </h1>

            {/* Animated underline */}
            <motion.div
              className="mt-3 h-[2px] rounded-full"
              style={{
                background: "linear-gradient(90deg, transparent, #0060ac, #a4c9ff, #0060ac, transparent)",
              }}
              initial={{ scaleX: 0 }}
              animate={{ scaleX: lettersVisible >= NAME.length ? 1 : 0 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
            />
          </div>

          {/* Tagline (fades in after name completes) */}
          <motion.p
            className="mb-10 text-xs uppercase tracking-[0.3em] text-white/30"
            initial={{ opacity: 0 }}
            animate={{ opacity: lettersVisible >= NAME.length ? 1 : 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            Campus Healthcare Platform
          </motion.p>

          {/* Progress bar */}
          <div className="relative w-64 md:w-80">
            <div className="h-[2px] w-full overflow-hidden rounded-full bg-white/10">
              <motion.div
                className="h-full rounded-full"
                style={{
                  width: `${progress}%`,
                  background: "linear-gradient(90deg, #0060ac, #a4c9ff)",
                  boxShadow: "0 0 16px rgba(164,201,255,0.4)",
                  transition: "width 0.15s ease",
                }}
              />
            </div>

            <div className="mt-4 flex items-center justify-between">
              <AnimatePresence mode="wait">
                <motion.span
                  key={phraseIndex}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.35 }}
                  className="text-[10px] uppercase tracking-[0.15em] text-white/30"
                >
                  {LOADING_PHRASES[phraseIndex]}
                </motion.span>
              </AnimatePresence>
              <span className="text-[10px] tabular-nums text-white/25">
                {Math.floor(progress)}%
              </span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
