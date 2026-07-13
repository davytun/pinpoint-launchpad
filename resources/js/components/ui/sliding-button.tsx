"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ArrowUpRight } from "lucide-react";
import { motion } from "motion/react";
import React from "react";

export interface SlidingButtonProps
  extends Omit<React.ComponentProps<typeof Button>, "variant"> {
  children: React.ReactNode;
  iconPosition?: "left" | "right";
  variant?: keyof typeof BOX_SHADOW;
  className?: string;
}

const ICON_PX = 56;
const GAP_PX = 4;

const SPRING_SLIDE = { type: "spring", stiffness: 300, damping: 28 } as const;
const SPRING_ROTATE = { type: "spring", stiffness: 400, damping: 20 } as const;

const ICON_STYLE = {
  background: "#ffffff",
  boxShadow: "0 2px 6px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(0, 0, 0, 0.04)",
} as const;

const BOX_SHADOW = {
  default: "none",
  outline: "none",
} as const;

export const SlidingButton = React.forwardRef<
  HTMLButtonElement,
  SlidingButtonProps
>(
  (
    { children, className, variant = "default", iconPosition = "right", ...props },
    externalRef
  ) => {
    const [isHovered, setIsHovered] = React.useState(false);
    const [travelDistance, setTravelDistance] = React.useState(0);

    const mergedRef = React.useCallback(
      (node: HTMLButtonElement | null) => {
        if (typeof externalRef === "function") externalRef(node);
        else if (externalRef)
          (
            externalRef as React.MutableRefObject<HTMLButtonElement | null>
          ).current = node;

        if (!node) return;

        const measure = () => {
          const iconEl = node.querySelector(".sliding-icon-container") as HTMLElement;
          const currentIconPx = iconEl ? iconEl.offsetWidth : ICON_PX;
          setTravelDistance(node.clientWidth - currentIconPx - GAP_PX * 2);
        };

        measure();

        const ro = new ResizeObserver(measure);
        ro.observe(node);
      },
      [externalRef]
    );

    const slideX = isHovered
      ? iconPosition === "right"
        ? -travelDistance
        : travelDistance
      : 0;
    const rotateX = isHovered ? 360 : 0;

    return (
      <Button
        ref={mergedRef}
        variant={variant}
        aria-label={children?.toString()}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={cn(
          "relative h-12 sm:h-16 w-fit min-w-[240px] sm:min-w-[280px] justify-center cursor-pointer overflow-hidden rounded-xl sm:rounded-2xl p-1 text-sm sm:text-base font-semibold transition-all duration-500 flex items-center active:scale-[0.98]",
          "bg-[#3A54A5] text-white hover:bg-[#2f458a] border-none",
          iconPosition === "right"
            ? "ps-6 pe-[52px] hover:ps-[52px] hover:pe-6 sm:ps-8 sm:pe-[72px] sm:hover:ps-[72px] sm:hover:pe-8"
            : "ps-[52px] pe-6 hover:ps-6 hover:pe-[52px] sm:ps-[72px] sm:pe-8 sm:hover:ps-8 sm:hover:pe-[72px]",
          className
        )}
        style={{ boxShadow: BOX_SHADOW[variant as keyof typeof BOX_SHADOW] }}
        {...props}
      >
        <span
          className="relative z-10 transition-all duration-500 text-shadow-black/10 text-shadow-lg whitespace-nowrap"
        >
          {children}
        </span>

        <motion.div
          aria-hidden
          className={cn(
            "sliding-icon-container absolute z-20 flex h-10 w-10 sm:h-14 sm:w-14 items-center justify-center rounded-lg sm:rounded-xl text-[#3A54A5]",
            iconPosition === "right" ? "right-1" : "left-1"
          )}
          style={ICON_STYLE}
          animate={{ x: slideX, rotate: rotateX }}
          transition={SPRING_SLIDE}
        >
          <motion.span
            className="relative z-30 flex items-center justify-center drop-shadow-sm"
            animate={{ rotate: isHovered ? 45 : 0 }}
            transition={SPRING_ROTATE}
          >
            <ArrowUpRight className="h-4 w-4 sm:h-6 sm:w-6" />
          </motion.span>
        </motion.div>
      </Button>
    );
  }
);

SlidingButton.displayName = "SlidingButton";
