"use client";

import { cn } from "@/lib/cn";
import { motion, useReducedMotion } from "framer-motion";

type ChartVariant = "sparkline" | "bar";

type AnalyticsChartProps = {
  variant?: ChartVariant;
  className?: string;
  color?: string;
};

const sparklinePath =
  "M0,30 L20,25 L40,28 L60,18 L80,22 L100,12 L120,15 L140,8 L160,10 L180,5 L200,8";

const barHeights = [40, 65, 45, 80, 55, 70, 90, 60, 75, 85, 50, 95];

export function AnalyticsChart({
  variant = "sparkline",
  className,
  color = "#2563EB",
}: AnalyticsChartProps) {
  const shouldReduceMotion = useReducedMotion();

  if (variant === "bar") {
    return (
      <svg
        viewBox="0 0 200 40"
        className={cn("h-10 w-full", className)}
        aria-hidden="true"
      >
        {barHeights.map((height, i) => (
          <motion.rect
            key={i}
            x={i * 16 + 2}
            y={40 - height * 0.4}
            width={12}
            height={height * 0.4}
            rx={2}
            fill={color}
            opacity={0.7 + (i % 3) * 0.1}
            initial={{ scaleY: 0 }}
            whileInView={{ scaleY: 1 }}
            viewport={{ once: true }}
            transition={{
              duration: shouldReduceMotion ? 0 : 0.4,
              delay: shouldReduceMotion ? 0 : i * 0.05,
              ease: [0.22, 1, 0.36, 1],
            }}
            style={{ originY: "40px" }}
          />
        ))}
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 200 35"
      className={cn("h-10 w-full", className)}
      aria-hidden="true"
    >
      <motion.path
        d={sparklinePath}
        fill="none"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0, opacity: 0 }}
        whileInView={{ pathLength: 1, opacity: 1 }}
        viewport={{ once: true }}
        transition={{
          duration: shouldReduceMotion ? 0 : 1.2,
          ease: [0.22, 1, 0.36, 1],
        }}
      />
      <motion.path
        d={`${sparklinePath} L200,35 L0,35 Z`}
        fill={color}
        fillOpacity={0.1}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: shouldReduceMotion ? 0 : 0.6, delay: 0.4 }}
      />
    </svg>
  );
}
