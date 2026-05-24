"use client";

import { motion, useMotionTemplate, useMotionValue } from "motion/react";
import { useCallback, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

export interface MagicCardProps {
  children?: React.ReactNode;
  className?: string;
  mode?: "gradient" | "orb";
  /** gradient mode */
  gradientSize?: number;
  gradientColor?: string;
  gradientOpacity?: number;
  gradientFrom?: string;
  gradientTo?: string;
  /** orb mode */
  glowFrom?: string;
  glowTo?: string;
  glowAngle?: number;
  glowSize?: number;
  glowBlur?: number;
  glowOpacity?: number;
}

/**
 * MagicCard — magicui-style card with two effects:
 *
 * - "gradient" (default): a soft radial gradient follows the cursor + an animated
 *   gradient border revealed by the cursor.
 * - "orb": an animated rotating gradient orb sits behind the card content.
 *
 * Source inspiration: https://magicui.design/docs/components/magic-card
 */
export function MagicCard({
  children,
  className,
  mode = "gradient",
  gradientSize = 200,
  gradientColor = "#262626",
  gradientOpacity = 0.8,
  gradientFrom = "#9E7AFF",
  gradientTo = "#FE8BBB",
  glowFrom = "#ee4f27",
  glowTo = "#6b21ef",
  glowAngle = 90,
  glowSize = 420,
  glowBlur = 60,
  glowOpacity = 0.9,
}: MagicCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(-gradientSize);
  const mouseY = useMotionValue(-gradientSize);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!cardRef.current) return;
      const rect = cardRef.current.getBoundingClientRect();
      mouseX.set(e.clientX - rect.left);
      mouseY.set(e.clientY - rect.top);
    },
    [mouseX, mouseY],
  );

  const handleMouseLeave = useCallback(() => {
    mouseX.set(-gradientSize);
    mouseY.set(-gradientSize);
  }, [mouseX, mouseY, gradientSize]);

  // Reset position once mounted so the card isn't lit on first render.
  useEffect(() => {
    mouseX.set(-gradientSize);
    mouseY.set(-gradientSize);
  }, [mouseX, mouseY, gradientSize]);

  // Border gradient that follows the cursor (gradient mode).
  const borderBg = useMotionTemplate`
    radial-gradient(${gradientSize}px circle at ${mouseX}px ${mouseY}px,
      ${gradientFrom},
      ${gradientTo},
      var(--border) 100%
    )
  `;

  // Soft inner highlight that follows the cursor (gradient mode).
  const highlightBg = useMotionTemplate`
    radial-gradient(${gradientSize}px circle at ${mouseX}px ${mouseY}px,
      ${gradientColor},
      transparent 100%
    )
  `;

  if (mode === "orb") {
    return (
      <div
        ref={cardRef}
        className={cn("group relative rounded-[inherit]", className)}
      >
        {/* Orb glow — sits behind the card */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 overflow-hidden rounded-[inherit]"
        >
          <motion.div
            className="absolute left-1/2 top-1/2"
            style={{
              width: glowSize,
              height: glowSize,
              marginLeft: -glowSize / 2,
              marginTop: -glowSize / 2,
              borderRadius: "9999px",
              background: `conic-gradient(from ${glowAngle}deg, ${glowFrom}, ${glowTo}, ${glowFrom})`,
              filter: `blur(${glowBlur}px)`,
              opacity: glowOpacity,
            }}
            animate={{ rotate: 360 }}
            transition={{
              repeat: Infinity,
              duration: 8,
              ease: "linear",
            }}
          />
        </div>
        <div className="relative rounded-[inherit]">{children}</div>
      </div>
    );
  }

  // gradient mode
  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={cn("group relative rounded-[inherit]", className)}
    >
      {/* Animated gradient border (cursor-driven) */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{ background: borderBg as unknown as string }}
      />
      <div className="absolute inset-px rounded-[inherit] bg-background" />
      {/* Soft inner highlight (cursor-driven) */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-px rounded-[inherit] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background: highlightBg as unknown as string,
          opacity: gradientOpacity,
        }}
      />
      <div className="relative rounded-[inherit]">{children}</div>
    </div>
  );
}
