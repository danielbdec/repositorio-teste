"use client";

import { motion, useMotionTemplate, useMotionValue } from "framer-motion";
import { MouseEvent } from "react";
import clsx from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: (string | undefined | null | false)[]) {
    return twMerge(clsx(inputs));
}

interface PremiumCardProps {
    children: React.ReactNode;
    className?: string;
    onClick?: (e: React.MouseEvent) => void;
    hoverEffect?: boolean;
    disableAnimation?: boolean;
}

export function PremiumCard({
    children,
    className,
    onClick,
    hoverEffect = true,
    disableAnimation = false
}: PremiumCardProps) {
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    function handleMouseMove({ currentTarget, clientX, clientY }: MouseEvent) {
        const { left, top } = currentTarget.getBoundingClientRect();
        mouseX.set(clientX - left);
        mouseY.set(clientY - top);
    }

    const motionProps = disableAnimation ? {
        initial: false,
        animate: undefined,
        transition: undefined
    } : {
        initial: { opacity: 0, scale: 0.98, y: 5 },
        animate: { opacity: 1, scale: 1, y: 0 },
        transition: {
            type: "spring",
            stiffness: 120, // Solid feel
            damping: 25,    // No bounce
            mass: 1
        } as const
    };

    return (
        <motion.div
            {...motionProps}
            className={cn(
                "group relative rounded-xl border border-border transition-all duration-500",
                "bg-white/70 dark:bg-card/40", // Light: High opacity white | Dark: Glass
                "backdrop-blur-md shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] dark:shadow-black/20", // Light: Soft clean shadow
                hoverEffect && "hover:border-border/80 hover:bg-white/90 dark:hover:bg-accent/50 hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.1)] hover:-translate-y-0.5 dark:hover:translate-y-0 dark:hover:shadow-black/30",
                className
            )}
            onMouseMove={handleMouseMove}
            onClick={onClick}
        >
            {/* Very Subtle Spotlight - Reduced opacity significantly */}
            {hoverEffect && (
                <motion.div
                    className="pointer-events-none absolute -inset-px rounded-xl opacity-0 transition duration-700 group-hover:opacity-100"
                    style={{
                        background: useMotionTemplate`
                radial-gradient(
                  400px circle at ${mouseX}px ${mouseY}px,
                  rgba(255, 255, 255, 0.03),
                  transparent 80%
                )
              `,
                    }}
                />
            )}

            {/* Content Container */}
            <div className="relative z-10 h-full">
                {children}
            </div>

            {/* Inner Glow for depth */}
            <div className="absolute inset-0 rounded-xl ring-1 ring-inset ring-white/5 pointer-events-none" />
        </motion.div>
    );
}
