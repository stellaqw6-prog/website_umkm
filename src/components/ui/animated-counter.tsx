"use client";

import { useEffect, useRef } from "react";
import { motion, useInView, useMotionValue, useTransform, animate } from "framer-motion";

interface AnimatedCounterProps {
  value: number;
  duration?: number;
  formatter?: (n: number) => string;
  className?: string;
}

/**
 * Angka yang animasi menghitung naik dari 0 ke `value` begitu komponennya
 * kelihatan di layar (sekali saja, tidak berulang tiap scroll).
 */
export function AnimatedCounter({ value, duration = 1.8, formatter, className }: AnimatedCounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-40px" });
  const count = useMotionValue(0);
  const display = useTransform(count, (latest) =>
    formatter ? formatter(latest) : Math.round(latest).toLocaleString("id-ID")
  );

  useEffect(() => {
    if (!isInView) return;
    const controls = animate(count, value, { duration, ease: "easeOut" });
    return controls.stop;
  }, [isInView, value, duration, count]);

  return (
    <motion.span ref={ref} className={className}>
      {display}
    </motion.span>
  );
}
