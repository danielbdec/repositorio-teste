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
        }
    };

    return (
        <motion.div
            {...motionProps}
            className={cn(
                "group relative rounded-xl border border-white/5 bg-slate-950/40 transition-all duration-500",
                "backdrop-blur-md shadow-lg shadow-black/20", // Deep glass
                hoverEffect && "hover:border-white/10 hover:bg-slate-900/50 hover:shadow-xl hover:shadow-black/30",
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
